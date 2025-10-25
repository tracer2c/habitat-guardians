import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { StatusGauge } from "@/components/StatusGauge";
import { AlertsPanel } from "@/components/AlertsPanel";
import { AdvisoryPanel } from "@/components/AdvisoryPanel";
import { EnvironmentChart } from "@/components/EnvironmentChart";
import { MissionLog } from "@/components/MissionLog";
import { PredictionsPanel } from "@/components/PredictionsPanel";
import { AnomalyPanel } from "@/components/AnomalyPanel";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { MissionControlPanel } from "@/components/MissionControlPanel";
import { MultiLocationDashboard } from "@/components/MultiLocationDashboard";
import { RoverActivityLog } from "@/components/RoverActivityLog";
import { LocationSelector, LOCATIONS, Location } from "@/components/LocationSelector";
import { HabitatMode } from "@/lib/dataSimulator";
import { useEnvironmentData } from "@/hooks/useEnvironmentData";
import { usePredictions } from "@/hooks/usePredictions";
import { Button } from "@/components/ui/button";
import { Play, Pause, Database, Rocket, Grid3x3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Index = () => {
  const [mode, setMode] = useState<HabitatMode>("mars");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);
  const [showMultiLocation, setShowMultiLocation] = useState(false);
  const [showMissionControl, setShowMissionControl] = useState(false);

  const { 
    data, 
    currentReading, 
    alerts, 
    advisory, 
    recommendations,
    isGeneratingRecommendations,
    generateRecommendations,
    triggerSimulation 
  } = useEnvironmentData(
    mode,
    isRunning,
    mode === 'earth' ? selectedLocation : undefined
  );

  const { predictions, anomalies } = usePredictions(data, currentReading);

  const handleModeChange = (newMode: HabitatMode) => {
    setMode(newMode);
    setIsRunning(false);
    setShowMultiLocation(false);
  };

  useEffect(() => {
    if (mode === 'earth' && !isRunning) {
      triggerSimulation(selectedLocation);
    }
  }, [selectedLocation, mode]);

  // Generate recommendations when conditions warrant
  useEffect(() => {
    if (currentReading && alerts.length > 0) {
      const hasHighSeverity = alerts.some(a => a.severity === 'critical' || a.severity === 'warning');
      const lowStability = (currentReading.stabilityScore || 0) < 70;
      
      if (hasHighSeverity || lowStability || currentReading.is_crisis) {
        generateRecommendations(currentReading, alerts, predictions);
      }
    }
  }, [currentReading?.timestamp, alerts.length]);

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
              : `Real-Time Weather at NASA ${selectedLocation.name.split(',')[0]}`
            }
          </p>
          {mode === 'earth' && currentReading && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              Last Updated: {new Date(currentReading.timestamp).toLocaleTimeString()} • Updates every 5 seconds • Fresh weather data every 5 minutes
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle mode={mode} onModeChange={handleModeChange} />
          {mode === 'earth' && !showMultiLocation && (
            <LocationSelector 
              selectedLocation={selectedLocation} 
              onLocationChange={setSelectedLocation} 
            />
          )}
          {mode === 'earth' && (
            <Button
              variant={showMultiLocation ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMultiLocation(!showMultiLocation)}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              {showMultiLocation ? 'Single View' : 'Multi-Location'}
            </Button>
          )}
          {mode === 'mars' && (
            <Dialog open={showMissionControl} onOpenChange={setShowMissionControl}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Rocket className="h-4 w-4" />
                  Mission Control
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Mars Mission Control</DialogTitle>
                </DialogHeader>
                <MissionControlPanel />
              </DialogContent>
            </Dialog>
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

      {/* Status Gauges - Only show in single view */}
      {!showMultiLocation && (
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
      )}

      {/* Multi-Location Dashboard for Earth Mode */}
      {mode === 'earth' && showMultiLocation && (
        <MultiLocationDashboard />
      )}

      {/* Main Content Grid - Only show in single view */}
      {!showMultiLocation && (
        <>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <EnvironmentChart data={data.slice(-20)} mode={mode} />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Pressure</p>
                  <p className="text-2xl font-bold">{currentReading?.pressure.toFixed(1) || 0} {mode === 'mars' ? 'Pa' : 'hPa'}</p>
                </div>
                {mode === 'earth' && currentReading?.co2_level && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">CO₂ Level</p>
                    <p className="text-2xl font-bold">{currentReading.co2_level.toFixed(0)} ppm</p>
                  </div>
                )}
                {mode === 'mars' && currentReading?.radiation && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Radiation</p>
                    <p className="text-2xl font-bold">{currentReading.radiation.toFixed(3)} Sv/h</p>
                  </div>
                )}
              </div>
              {currentReading?.is_crisis && (
                <div className="bg-destructive/20 border border-destructive rounded-lg p-4">
                  <p className="text-sm text-destructive font-semibold">⚠ CRISIS MODE</p>
                  <p className="text-lg font-bold text-destructive">{currentReading.crisis_type?.replace('_', ' ').toUpperCase()}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <RecommendationsPanel 
                recommendations={recommendations}
                onRefresh={() => currentReading && generateRecommendations(currentReading, alerts, predictions)}
                isLoading={isGeneratingRecommendations}
              />
              <PredictionsPanel predictions={predictions} />
              <AnomalyPanel anomalies={anomalies} />
            </div>
          </div>

          {/* Secondary Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AlertsPanel alerts={alerts} />
            {advisory && <AdvisoryPanel advisory={advisory} />}
          </div>
        </>
      )}

      {/* Mission Log / Rover Activity - Always show */}
      <div className="max-w-7xl mx-auto">
        {mode === 'mars' ? (
          <RoverActivityLog />
        ) : (
          <MissionLog entries={alerts.slice(0, 8).map(a => ({
            timestamp: a.timestamp,
            message: a.message,
            type: a.severity as 'info' | 'warning' | 'critical'
          }))} />
        )}
      </div>
    </div>
  );
};

export default Index;
