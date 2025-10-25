import { useState, useEffect } from 'react';
import { EnvironmentalData, Alert } from '@/lib/dataSimulator';

interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  alertLevel: 'safe' | 'warning' | 'critical';
}

interface AnomalyDetection {
  detected: boolean;
  metric: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
}

export const usePredictions = (data: EnvironmentalData[], currentReading: EnvironmentalData | null) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);

  useEffect(() => {
    if (!currentReading || data.length < 5) return;

    // Simple moving average prediction
    const predictNext = (values: number[]): { predicted: number; confidence: number } => {
      const recent = values.slice(-10);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const stdDev = Math.sqrt(
        recent.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / recent.length
      );
      
      // Linear trend
      const trend = recent.length > 1 
        ? (recent[recent.length - 1] - recent[0]) / recent.length
        : 0;
      
      const predicted = avg + trend * 3; // Predict 3 steps ahead
      const confidence = Math.max(0, Math.min(1, 1 - (stdDev / avg)));
      
      return { predicted, confidence };
    };

    // Detect anomalies using z-score
    const detectAnomaly = (current: number, historical: number[]): boolean => {
      if (historical.length < 5) return false;
      const mean = historical.reduce((a, b) => a + b, 0) / historical.length;
      const stdDev = Math.sqrt(
        historical.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / historical.length
      );
      const zScore = Math.abs((current - mean) / stdDev);
      return zScore > 2; // 2 standard deviations
    };

    // Calculate trend
    const getTrend = (values: number[]): 'increasing' | 'decreasing' | 'stable' => {
      if (values.length < 2) return 'stable';
      const recent = values.slice(-5);
      const diff = recent[recent.length - 1] - recent[0];
      if (Math.abs(diff) < 1) return 'stable';
      return diff > 0 ? 'increasing' : 'decreasing';
    };

    // Get alert level
    const getAlertLevel = (metric: string, predicted: number): 'safe' | 'warning' | 'critical' => {
      if (metric === 'temperature') {
        if (predicted < 16 || predicted > 30) return 'critical';
        if (predicted < 18 || predicted > 26) return 'warning';
      } else if (metric === 'oxygen') {
        if (predicted < 19.5) return 'critical';
        if (predicted < 20) return 'warning';
      } else if (metric === 'power') {
        if (predicted < 30) return 'critical';
        if (predicted < 50) return 'warning';
      } else if (metric === 'stability') {
        if (predicted < 40) return 'critical';
        if (predicted < 60) return 'warning';
      }
      return 'safe';
    };

    // Extract time series data
    const temps = data.map(d => d.temperature);
    const oxygens = data.map(d => d.oxygen);
    const powers = data.map(d => d.power);
    const stabilities = data.map(d => d.stabilityScore);

    // Generate predictions
    const tempPred = predictNext(temps);
    const oxygenPred = predictNext(oxygens);
    const powerPred = predictNext(powers);
    const stabilityPred = predictNext(stabilities);

    const newPredictions: Prediction[] = [
      {
        metric: 'temperature',
        current: currentReading.temperature,
        predicted: tempPred.predicted,
        confidence: tempPred.confidence,
        trend: getTrend(temps),
        alertLevel: getAlertLevel('temperature', tempPred.predicted),
      },
      {
        metric: 'oxygen',
        current: currentReading.oxygen,
        predicted: oxygenPred.predicted,
        confidence: oxygenPred.confidence,
        trend: getTrend(oxygens),
        alertLevel: getAlertLevel('oxygen', oxygenPred.predicted),
      },
      {
        metric: 'power',
        current: currentReading.power,
        predicted: powerPred.predicted,
        confidence: powerPred.confidence,
        trend: getTrend(powers),
        alertLevel: getAlertLevel('power', powerPred.predicted),
      },
      {
        metric: 'stability',
        current: currentReading.stabilityScore,
        predicted: stabilityPred.predicted,
        confidence: stabilityPred.confidence,
        trend: getTrend(stabilities),
        alertLevel: getAlertLevel('stability', stabilityPred.predicted),
      },
    ];

    setPredictions(newPredictions);

    // Detect anomalies
    const newAnomalies: AnomalyDetection[] = [];

    if (detectAnomaly(currentReading.temperature, temps)) {
      newAnomalies.push({
        detected: true,
        metric: 'Temperature',
        severity: Math.abs(currentReading.temperature - 20) > 10 ? 'high' : 'medium',
        message: `Unusual temperature pattern detected: ${currentReading.temperature.toFixed(1)}°C`,
        timestamp: currentReading.timestamp,
      });
    }

    if (detectAnomaly(currentReading.oxygen, oxygens)) {
      newAnomalies.push({
        detected: true,
        metric: 'Oxygen',
        severity: currentReading.oxygen < 19.5 ? 'high' : 'medium',
        message: `Anomalous oxygen levels detected: ${currentReading.oxygen.toFixed(1)}%`,
        timestamp: currentReading.timestamp,
      });
    }

    if (detectAnomaly(currentReading.power, powers)) {
      newAnomalies.push({
        detected: true,
        metric: 'Power',
        severity: currentReading.power < 40 ? 'high' : 'medium',
        message: `Unexpected power fluctuation: ${currentReading.power.toFixed(1)}%`,
        timestamp: currentReading.timestamp,
      });
    }

    setAnomalies(newAnomalies);
  }, [data, currentReading]);

  return { predictions, anomalies };
};
