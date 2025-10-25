export type HabitatMode = 'mars' | 'earth';

export interface EnvironmentalData {
  timestamp: Date;
  temperature: number;
  oxygen: number; // Mars: O2 %, Earth: Air Quality Index
  power: number; // % available
  stabilityScore: number;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

export interface Advisory {
  condition: string;
  recommendations: string[];
  explanation: string;
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

  generateData(): EnvironmentalData {
    // Introduce crisis events randomly
    if (!this.crisisMode && Math.random() < 0.005) {
      this.crisisMode = true;
      this.crisisTimer = 20 + Math.floor(Math.random() * 20);
    }

    if (this.crisisMode) {
      this.crisisTimer--;
      if (this.crisisTimer <= 0) {
        this.crisisMode = false;
      }
    }

    // Add trending behavior
    this.trendOffset += (Math.random() - 0.5) * 0.5;
    this.trendOffset = Math.max(-5, Math.min(5, this.trendOffset));

    // Generate values with noise and crisis impacts
    let temperature = this.baseTemp + this.trendOffset + (Math.random() - 0.5) * 2;
    let oxygen = this.baseOxygen + this.trendOffset * 0.5 + (Math.random() - 0.5) * 3;
    let power = this.basePower + this.trendOffset * 2 + (Math.random() - 0.5) * 5;

    if (this.crisisMode) {
      const crisisType = Math.floor(Math.random() * 3);
      if (crisisType === 0) {
        // Oxygen crisis
        oxygen -= 10 + Math.random() * 5;
      } else if (crisisType === 1) {
        // Power crisis
        power -= 15 + Math.random() * 10;
      } else {
        // Temperature spike
        temperature += 8 + Math.random() * 7;
      }
    }

    // Clamp values
    temperature = Math.max(0, Math.min(50, temperature));
    oxygen = Math.max(0, Math.min(this.mode === 'mars' ? 25 : 100, oxygen));
    power = Math.max(0, Math.min(100, power));

    // Calculate stability score (0-100)
    const stabilityScore = this.calculateStability(temperature, oxygen, power);

    return {
      timestamp: new Date(),
      temperature,
      oxygen,
      power,
      stabilityScore,
    };
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

  generateAdvisory(data: EnvironmentalData, alerts: Alert[]): Advisory | null {
    if (alerts.length === 0) return null;

    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    
    if (data.oxygen < (this.mode === 'mars' ? 19.5 : 60) && data.power < 50) {
      return {
        condition: this.mode === 'mars' 
          ? 'Oxygen depletion with insufficient power reserves'
          : 'Air quality degradation with insufficient power reserves',
        recommendations: [
          'Reduce non-critical operations immediately',
          'Prioritize life-support systems',
          'Dim lighting and reduce HVAC load',
          'Activate emergency oxygen/filtration reserves',
        ],
        explanation: this.mode === 'mars'
          ? 'Current oxygen levels cannot sustain crew safety. With limited power, CO2 scrubbers may fail. Immediate intervention required to prevent life-threatening conditions.'
          : 'Poor air quality combined with low power threatens ventilation systems. Without action, indoor air could become hazardous within hours.',
      };
    }

    if (data.temperature > 30 && data.power > 60) {
      return {
        condition: 'Thermal regulation failure with available power',
        recommendations: [
          'Activate enhanced cooling systems',
          'Close solar-facing vents/windows',
          'Pause heat-intensive equipment',
          'Redirect power to thermal management',
        ],
        explanation: 'Elevated temperatures stress both equipment and crew. With sufficient power available, aggressive cooling measures can prevent cascade failures.',
      };
    }

    if (data.power < 30) {
      return {
        condition: 'Critical power deficit',
        recommendations: [
          'Switch to emergency low-power mode',
          'Defer all non-essential operations',
          'Prepare for potential system hibernation',
          'Monitor solar/grid recovery status',
        ],
        explanation: 'Power reserves approaching minimum safe levels. All systems must enter conservation mode to maintain critical life support until power generation recovers.',
      };
    }

    if (criticalAlerts.length > 0) {
      return {
        condition: 'Multiple critical systems compromised',
        recommendations: [
          'Activate emergency protocols',
          'Prioritize life-support systems',
          'Prepare for potential evacuation',
          'Contact ground control/support',
        ],
        explanation: 'Multiple simultaneous failures indicate systemic instability. Immediate coordinated response required across all habitat systems.',
      };
    }

    return {
      condition: 'Minor stability degradation',
      recommendations: [
        'Monitor trending parameters closely',
        'Perform preventive maintenance checks',
        'Review recent operational changes',
      ],
      explanation: 'Current conditions are suboptimal but manageable. Proactive monitoring and minor adjustments should prevent escalation.',
    };
  }
}
