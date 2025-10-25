import { useState, useEffect, useCallback } from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { StatusGauge } from "@/components/StatusGauge";
import { AlertsPanel } from "@/components/AlertsPanel";
import { AdvisoryPanel } from "@/components/AdvisoryPanel";
import { EnvironmentChart } from "@/components/EnvironmentChart";
import { MissionLog, LogEntry } from "@/components/MissionLog";
import { HabitatSimulator, HabitatMode, EnvironmentalData, Alert, Advisory } from "@/lib/dataSimulator";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

const MAX_DATA_POINTS = 50;

const Index = () => {
  const [mode, setMode] = useState<HabitatMode>('mars');
  const [simulator] = useState(() => new HabitatSimulator('mars'));
  const [isRunning, setIsRunning] = useState(true);
  const [data, setData] = useState<EnvironmentalData[]>([]);
  const [currentData, setCurrentData] = useState<EnvironmentalData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [missionLog, setMissionLog] = useState<LogEntry[]>([]);

  const handleModeChange = useCallback((newMode: HabitatMode) => {
    setMode(newMode);
    simulator.setMode(newMode);
    setMissionLog(prev => [
      {
        timestamp: new Date(),
        message: `Switched to ${newMode.toUpperCase()} mode`,
        type: 'info',
      },
      ...prev,
    ]);
  }, [simulator]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const newData = simulator.generateData();
      const newAlerts = simulator.detectAlerts(newData);
      const newAdvisory = simulator.generateAdvisory(newData, newAlerts);

      setCurrentData(newData);
      setData(prev => [...prev, newData].slice(-MAX_DATA_POINTS));
      setAlerts(newAlerts);
      setAdvisory(newAdvisory);

      // Log significant events
      if (newAlerts.some(a => a.severity === 'critical')) {
        setMissionLog(prev => [
          {
            timestamp: new Date(),
            message: 'CRITICAL: Multiple systems compromised',
            type: 'critical',
          },
          ...prev.slice(0, 49),
        ]);
      } else if (newData.stabilityScore < 60 && (data.length === 0 || data[data.length - 1].stabilityScore >= 60)) {
        setMissionLog(prev => [
          {
            timestamp: new Date(),
            message: 'Stability score dropped below 60',
            type: 'warning',
          },
          ...prev.slice(0, 49),
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, simulator, data]);

  // Initialize with first data point
  useEffect(() => {
    const initialData = simulator.generateData();
    setCurrentData(initialData);
    setData([initialData]);
    setMissionLog([
      {
        timestamp: new Date(),
        message: 'HABIT.AI system initialized',
        type: 'info',
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              HABIT.AI
            </h1>
            <p className="text-muted-foreground mt-1">Adaptive Habitat Intelligence System</p>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle mode={mode} onModeChange={handleModeChange} />
            <Button
              variant={isRunning ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setIsRunning(!isRunning)}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        {currentData && (
          <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
            <div className="flex-1">
              <span className="text-sm text-muted-foreground">Current Mode: </span>
              <span className="font-semibold">
                {mode === 'mars' ? 'Mars Habitat' : 'Earth Facility'}
              </span>
            </div>
            <div className="flex-1">
              <span className="text-sm text-muted-foreground">Stability Score: </span>
              <span
                className={`font-bold ${
                  currentData.stabilityScore >= 80
                    ? 'text-success'
                    : currentData.stabilityScore >= 60
                    ? 'text-warning'
                    : 'text-destructive'
                }`}
              >
                {currentData.stabilityScore.toFixed(1)}
              </span>
            </div>
            <div className="flex-1 text-right">
              <span className="text-sm text-muted-foreground">Status: </span>
              <span
                className={`font-semibold ${
                  alerts.some(a => a.severity === 'critical')
                    ? 'text-destructive'
                    : alerts.length > 0
                    ? 'text-warning'
                    : 'text-success'
                }`}
              >
                {alerts.some(a => a.severity === 'critical')
                  ? 'CRITICAL'
                  : alerts.length > 0
                  ? 'WARNING'
                  : 'NOMINAL'}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gauges */}
        {currentData && (
          <>
            <StatusGauge
              label="Temperature"
              value={currentData.temperature}
              unit="°C"
              min={0}
              max={50}
              optimalMin={mode === 'mars' ? 18 : 18}
              optimalMax={mode === 'mars' ? 24 : 26}
              warningMin={mode === 'mars' ? 15 : 15}
              warningMax={mode === 'mars' ? 28 : 30}
            />
            <StatusGauge
              label={mode === 'mars' ? 'Oxygen Level' : 'Air Quality'}
              value={currentData.oxygen}
              unit={mode === 'mars' ? '%' : 'AQI'}
              min={0}
              max={mode === 'mars' ? 25 : 100}
              optimalMin={mode === 'mars' ? 19.5 : 70}
              optimalMax={mode === 'mars' ? 23 : 100}
              warningMin={mode === 'mars' ? 18 : 50}
              warningMax={mode === 'mars' ? 24 : 100}
            />
            <StatusGauge
              label="Power Reserve"
              value={currentData.power}
              unit="%"
              min={0}
              max={100}
              optimalMin={60}
              optimalMax={100}
              warningMin={30}
              warningMax={100}
            />
          </>
        )}
      </div>

      {/* Chart */}
      <div className="mb-6">
        <EnvironmentChart data={data} mode={mode} />
      </div>

      {/* Alerts and Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AlertsPanel alerts={alerts} />
        <AdvisoryPanel advisory={advisory} />
      </div>

      {/* Mission Log */}
      <MissionLog entries={missionLog} />
    </div>
  );
};

export default Index;
