import { useState } from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { StatusGauge } from "@/components/StatusGauge";
import { AlertsPanel } from "@/components/AlertsPanel";
import { AdvisoryPanel } from "@/components/AdvisoryPanel";
import { EnvironmentChart } from "@/components/EnvironmentChart";
import { MissionLog } from "@/components/MissionLog";
import { LocationSelector, LOCATIONS, Location } from "@/components/LocationSelector";
import { HabitatMode, Advisory } from "@/lib/dataSimulator";
import { useEnvironmentData } from "@/hooks/useEnvironmentData";
import { Button } from "@/components/ui/button";
import { Play, Pause, Database } from "lucide-react";

const Index = () => {
  const [mode, setMode] = useState<HabitatMode>("mars");
  const [isRunning, setIsRunning] = useState(false);
  const [advisory] = useState<Advisory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);

  const { data, currentReading, alerts, triggerSimulation } = useEnvironmentData(
    mode, 
    isRunning,
    mode === 'earth' ? selectedLocation : undefined
  );

  const handleModeChange = (newMode: HabitatMode) => {
    setMode(newMode);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient-shift">
            HABIT.AI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'mars' 
              ? 'Simulated Mars Habitat Environmental Control • Live Database'
              : `Real-Time Weather Monitoring • ${selectedLocation.name}`
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle mode={mode} onModeChange={handleModeChange} />
          {mode === 'earth' && (
            <LocationSelector 
              selectedLocation={selectedLocation} 
              onLocationChange={setSelectedLocation} 
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerSimulation(mode === 'earth' ? selectedLocation : undefined)}
            className="gap-2"
          >
            <Database className="h-4 w-4" />
            {mode === 'earth' ? 'Refresh Weather' : 'Generate Data'}
          </Button>
          <Button
            variant={isRunning ? "destructive" : "default"}
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
                Auto-Run
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <StatusGauge
          label="Temperature"
          value={currentReading?.temperature || 0}
          unit="°C"
          min={0}
          max={50}
          optimalMin={mode === "mars" ? 18 : 15}
          optimalMax={mode === "mars" ? 24 : 25}
          warningMin={mode === "mars" ? 15 : 0}
          warningMax={mode === "mars" ? 30 : 35}
        />
        <StatusGauge
          label={mode === "mars" ? "Oxygen" : "Air Quality"}
          value={currentReading?.oxygen || 0}
          unit={mode === "mars" ? "%" : "AQI"}
          min={0}
          max={mode === "mars" ? 25 : 100}
          optimalMin={mode === "mars" ? 19.5 : 70}
          optimalMax={mode === "mars" ? 23 : 100}
          warningMin={mode === "mars" ? 18 : 50}
          warningMax={mode === "mars" ? 24 : 100}
        />
        {mode === "mars" && (
          <StatusGauge
            label="Power"
            value={currentReading?.power || 0}
            unit="%"
            min={0}
            max={100}
            optimalMin={60}
            optimalMax={100}
            warningMin={30}
            warningMax={100}
          />
        )}
        <StatusGauge
          label="Humidity"
          value={currentReading?.humidity || 0}
          unit="%"
          min={0}
          max={100}
          optimalMin={30}
          optimalMax={60}
          warningMin={20}
          warningMax={85}
        />
        <StatusGauge
          label={mode === "mars" ? "Stability" : "Weather Score"}
          value={currentReading?.stabilityScore || 0}
          unit=""
          min={0}
          max={100}
          optimalMin={60}
          optimalMax={100}
          warningMin={40}
          warningMax={100}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EnvironmentChart data={data} mode={mode} />
        </div>
        <div className="space-y-6">
          <AlertsPanel alerts={alerts} />
          {advisory && <AdvisoryPanel advisory={advisory} />}
        </div>
      </div>

      {/* Additional Metrics */}
      {currentReading && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Pressure</p>
            <p className="text-2xl font-bold">{currentReading.pressure.toFixed(1)} {mode === 'mars' ? 'Pa' : 'hPa'}</p>
          </div>
          {mode === 'earth' && currentReading.co2_level && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">CO₂ Level</p>
              <p className="text-2xl font-bold">{currentReading.co2_level.toFixed(0)} ppm</p>
            </div>
          )}
          {mode === 'mars' && currentReading.radiation && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Radiation</p>
              <p className="text-2xl font-bold">{currentReading.radiation.toFixed(3)} Sv/h</p>
            </div>
          )}
          {currentReading.is_crisis && (
            <div className="bg-destructive/20 border border-destructive rounded-lg p-4 col-span-2">
              <p className="text-sm text-destructive font-semibold">⚠ CRISIS MODE</p>
              <p className="text-lg font-bold text-destructive">{currentReading.crisis_type?.replace('_', ' ').toUpperCase()}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <MissionLog entries={alerts.slice(0, 8).map(a => ({
          timestamp: a.timestamp,
          message: a.message,
          type: a.severity as 'info' | 'warning' | 'critical'
        }))} />
      </div>
    </div>
  );
};

export default Index;
