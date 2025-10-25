export type HabitatMode = 'mars' | 'earth';

export interface EnvironmentalData {
  id?: string;
  timestamp: Date;
  mode: HabitatMode;
  temperature: number;
  oxygen: number;
  power: number;
  humidity: number;
  pressure: number;
  co2_level: number | null;
  radiation: number | null;
  stabilityScore: number;
  is_crisis?: boolean;
  crisis_type?: string | null;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

export interface Advisory {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

export class HabitatSimulator {
  private mode: HabitatMode = 'mars';
  private baseTemp = 20;
  private baseOxygen = 21;
  private basePower = 80;
  private crisisMode = false;
  private crisisTimer = 0;
  private trendOffset = 0;

  constructor(mode: HabitatMode = 'mars') {
    this.mode = mode;
    this.initializeBaselines();
  }

  setMode(mode: HabitatMode) {
    this.mode = mode;
    this.initializeBaselines();
  }

  private initializeBaselines() {
    if (this.mode === 'mars') {
      this.baseTemp = 20;
      this.baseOxygen = 21;
      this.basePower = 75;
    } else {
      this.baseTemp = 22;
      this.baseOxygen = 85; // Air quality index (higher is better)
      this.basePower = 70;
    }
  }


  private calculateStability(temp: number, oxygen: number, power: number): number {
    let score = 100;

    // Temperature penalties
    if (this.mode === 'mars') {
      if (temp < 18 || temp > 24) score -= Math.abs(temp - 21) * 3;
    } else {
      if (temp < 18 || temp > 26) score -= Math.abs(temp - 22) * 2.5;
    }

    // Oxygen/Air quality penalties
    if (this.mode === 'mars') {
      if (oxygen < 19.5) score -= (19.5 - oxygen) * 8;
      if (oxygen > 23) score -= (oxygen - 23) * 5;
    } else {
      if (oxygen < 70) score -= (70 - oxygen) * 1.5;
    }

    // Power penalties
    if (power < 40) score -= (40 - power) * 3;
    if (power < 20) score -= 20;

    return Math.max(0, Math.min(100, score));
  }

  detectAlerts(data: EnvironmentalData): Alert[] {
    const alerts: Alert[] = [];

    if (data.stabilityScore < 40) {
      alerts.push({
        id: `stability-${Date.now()}`,
        severity: 'critical',
        message: 'CRITICAL: Habitat stability severely compromised',
        timestamp: data.timestamp,
      });
    } else if (data.stabilityScore < 60) {
      alerts.push({
        id: `stability-${Date.now()}`,
        severity: 'warning',
        message: 'WARNING: Stability degrading',
        timestamp: data.timestamp,
      });
    }

    if (this.mode === 'mars') {
      if (data.oxygen < 19.5) {
        alerts.push({
          id: `oxygen-${Date.now()}`,
          severity: 'critical',
          message: 'CRITICAL: Oxygen levels below safe threshold',
          timestamp: data.timestamp,
        });
      }
    } else {
      if (data.oxygen < 60) {
        alerts.push({
          id: `air-${Date.now()}`,
          severity: 'critical',
          message: 'CRITICAL: Air quality dangerously low',
          timestamp: data.timestamp,
        });
      }
    }

    if (data.power < 30) {
      alerts.push({
        id: `power-${Date.now()}`,
        severity: 'critical',
        message: 'CRITICAL: Power reserves critically low',
        timestamp: data.timestamp,
      });
    } else if (data.power < 50) {
      alerts.push({
        id: `power-${Date.now()}`,
        severity: 'warning',
        message: 'WARNING: Power reserves declining',
        timestamp: data.timestamp,
      });
    }

    if (data.temperature > 30) {
      alerts.push({
        id: `temp-${Date.now()}`,
        severity: 'warning',
        message: 'WARNING: Temperature rising above optimal range',
        timestamp: data.timestamp,
      });
    } else if (data.temperature < 16) {
      alerts.push({
        id: `temp-${Date.now()}`,
        severity: 'warning',
        message: 'WARNING: Temperature dropping below optimal range',
        timestamp: data.timestamp,
      });
    }

    return alerts;
  }
}
