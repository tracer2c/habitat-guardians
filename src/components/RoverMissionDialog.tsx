import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mission, Rover } from "@/hooks/useMissions";
import { useRoverLogs } from "@/hooks/useRoverLogs";
import { useMissions } from "@/hooks/useMissions";
import { Activity, Clock, MapPin, Battery } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RoverMissionDialogProps {
  mission: Mission;
  rover: Rover;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoverMissionDialog = ({ mission, rover, open, onOpenChange }: RoverMissionDialogProps) => {
  const { logs, createLog } = useRoverLogs(mission.id);
  const { updateRoverStatus } = useMissions();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentBattery, setCurrentBattery] = useState(rover.battery_level || 95);
  const [currentLocation, setCurrentLocation] = useState({ 
    x: rover.location_x || 0, 
    y: rover.location_y || 0 
  });
  const [roverStatus, setRoverStatus] = useState(rover.status);
  const missionStartedRef = useRef(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollToBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && mission.status === 'in_progress' && !missionStartedRef.current) {
      missionStartedRef.current = true;
      setHasStarted(true);
      simulateMissionLogs();
    }
  }, [open, mission.status, mission.id]);

  useEffect(() => {
    // Reset when dialog closes
    if (!open) {
      missionStartedRef.current = false;
      setHasStarted(false);
    }
  }, [open]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollToBottomRef.current) {
      scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs.length]);

  const updateRoverData = async (battery: number, locationX: number, locationY: number, status: string) => {
    setCurrentBattery(battery);
    setCurrentLocation({ x: locationX, y: locationY });
    setRoverStatus(status as any);
    
    await updateRoverStatus(rover.rover_id, {
      battery_level: battery,
      location_x: locationX,
      location_y: locationY,
      status: status as any,
      current_task_id: mission.id
    });
  };

  const simulateMissionLogs = async () => {
    const missionLogs = generateMissionSequence(mission, rover);
    const totalSteps = missionLogs.length;
    const batteryDrainPerStep = 0.5 + Math.random() * 1; // 0.5-1.5% per step
    let currentBatteryLevel = rover.battery_level || 95;
    
    // Update rover status to active
    await updateRoverData(currentBatteryLevel, rover.location_x || 0, rover.location_y || 0, 'active');
    
    for (let i = 0; i < missionLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 2000));
      
      // Calculate battery drain
      currentBatteryLevel = Math.max(20, currentBatteryLevel - batteryDrainPerStep);
      
      // Calculate location changes (simulate gradual movement)
      const targetX = (rover.location_x || 0) + (Math.random() * 20 - 10);
      const targetY = (rover.location_y || 0) + (Math.random() * 20 - 10);
      const progress = (i + 1) / totalSteps;
      const currentX = (rover.location_x || 0) + (targetX - (rover.location_x || 0)) * progress;
      const currentY = (rover.location_y || 0) + (targetY - (rover.location_y || 0)) * progress;
      
      // Update rover data
      await updateRoverData(currentBatteryLevel, currentX, currentY, 'active');
      
      // Create log entry
      await createLog({
        message: missionLogs[i].message,
        event_type: 'rover_activity',
        severity: missionLogs[i].severity,
        metadata: {
          mission_id: mission.id,
          rover_id: rover.rover_id,
          rover_name: rover.name,
          mission_title: mission.title,
          step: i + 1,
          total_steps: totalSteps,
          battery: currentBatteryLevel,
          location_x: currentX,
          location_y: currentY
        }
      });
    }
    
    // Mission complete - return to idle/charging
    const finalStatus = currentBatteryLevel < 30 ? 'charging' : 'idle';
    await updateRoverData(currentBatteryLevel, rover.location_x || 0, rover.location_y || 0, finalStatus);
    
    // Add completion log to main activity log
    await createLog({
      message: `${rover.name} completed mission: ${mission.title}. Returning to base. Final battery: ${currentBatteryLevel}%`,
      event_type: 'rover_activity',
      severity: 'info',
      metadata: {
        rover_id: rover.rover_id,
        rover_name: rover.name,
        mission_title: mission.title,
        mission_completed: true,
        final_battery: currentBatteryLevel
      }
    });
  };

  const missionLogs = logs;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]" aria-describedby="mission-dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Mission Progress: {mission.title}
          </DialogTitle>
          <p id="mission-dialog-description" className="sr-only">
            View real-time mission progress and rover telemetry
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mission Info */}
          <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
            <div className="flex-1">
              <div className="text-sm font-medium">{rover.name}</div>
              <div className="text-xs text-muted-foreground">Rover ID: {rover.rover_id}</div>
            </div>
            <Badge variant="default">{mission.status.replace('_', ' ')}</Badge>
          </div>

          {/* Rover Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Battery className="h-3 w-3" />
                Battery
              </div>
              <div className="text-lg font-bold mb-1">{currentBattery.toFixed(0)}%</div>
              <Progress value={currentBattery} className="h-1.5" />
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Location</div>
              <div className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {currentLocation.x.toFixed(1)}, {currentLocation.y.toFixed(1)}
              </div>
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Status</div>
              <Badge variant={roverStatus === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">
                {roverStatus}
              </Badge>
            </div>
          </div>

          {/* Live Logs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Live Mission Feed</h3>
              <Badge variant="outline" className="text-xs">{missionLogs.length} entries</Badge>
            </div>
            <ScrollArea className="h-[320px] border rounded-lg p-3 bg-card/50">
              {missionLogs.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  <div className="animate-pulse">Initializing mission systems...</div>
                  <div className="text-xs mt-2">Waiting for rover telemetry...</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {missionLogs.map((log, index) => (
                    <div
                      key={`${log.id}-${index}`}
                      className="flex items-start gap-3 p-2 rounded border border-border/50 hover:bg-secondary/30 transition-colors animate-in fade-in slide-in-from-left-2 duration-300"
                    >
                      <div className="text-xs text-muted-foreground font-mono mt-0.5 min-w-[80px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-mono">{log.message}</div>
                        {log.metadata?.step && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Step {log.metadata.step} of {log.metadata.total_steps} • Battery: {log.metadata.battery?.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollToBottomRef} />
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const generateMissionSequence = (mission: Mission, rover: Rover): Array<{message: string, severity: string}> => {
  const sequences: Record<string, Array<{message: string, severity: string}>> = {
    rover: [
      { message: `[SYSTEM] ${rover.name} received mission assignment: ${mission.title}`, severity: 'info' },
      { message: '[INIT] Powering up subsystems... COMPLETE', severity: 'info' },
      { message: '[DIAG] Running pre-mission diagnostics check', severity: 'info' },
      { message: '[DIAG] Wheel motors: NOMINAL | Camera systems: ONLINE | Sensors: ACTIVE', severity: 'info' },
      { message: '[NAV] Computing optimal path to target coordinates', severity: 'info' },
      { message: '[NAV] Path computed. Distance: 127.3m. Estimated time: 8 minutes', severity: 'info' },
      { message: '[MOVE] Beginning traverse to target location', severity: 'info' },
      { message: '[MOVE] Speed: 0.3 m/s | Heading: 045° | Battery drain: 5%/segment', severity: 'info' },
      { message: '[SENSOR] Terrain scan: Loose regolith detected. Adjusting speed.', severity: 'warning' },
      { message: '[NAV] Waypoint 1 reached. Continuing...', severity: 'info' },
      { message: '[ARM] Deploying robotic arm and sample collection drill', severity: 'info' },
      { message: '[SAMPLE] Drilling initiated. Depth: 15cm target', severity: 'info' },
      { message: '[SAMPLE] Core sample extracted. Sealing containment unit.', severity: 'info' },
      { message: '[DATA] Capturing high-resolution images of sample site', severity: 'info' },
      { message: '[NAV] Mission objective complete. Calculating return path.', severity: 'info' },
      { message: '[MOVE] Returning to base station. ETA: 9 minutes', severity: 'info' },
      { message: '[SYSTEM] Mission accomplished. Total distance: 254.6m', severity: 'info' },
    ],
    habitat: [
      { message: `[SYSTEM] ${rover.name} dispatched for habitat maintenance`, severity: 'info' },
      { message: '[NAV] Approaching habitat module airlock', severity: 'info' },
      { message: '[SENSOR] Initiating structural integrity scan', severity: 'info' },
      { message: '[SCAN] Pressure seals: 98.7% | Thermal insulation: NOMINAL', severity: 'info' },
      { message: '[CHECK] Life support systems verification in progress', severity: 'info' },
      { message: '[CHECK] O2 generation: PASS | Water recycling: PASS | HVAC: PASS', severity: 'info' },
      { message: '[INSPECT] Scanning airlock door seals B-1 through B-4', severity: 'info' },
      { message: '[ALERT] Minor degradation detected on seal B-3 (2.3mm wear)', severity: 'warning' },
      { message: '[REPAIR] Deploying sealant applicator. Applying polymer patch.', severity: 'info' },
      { message: '[VERIFY] Seal integrity restored to 99.1%. Test PASSED', severity: 'info' },
      { message: '[DATA] Uploading maintenance report to base computer', severity: 'info' },
      { message: '[SYSTEM] Habitat maintenance cycle complete', severity: 'info' },
    ],
    science: [
      { message: `[SYSTEM] ${rover.name} beginning scientific survey mission`, severity: 'info' },
      { message: '[INIT] Calibrating spectrometer, seismometer, and weather station', severity: 'info' },
      { message: '[ATMOS] Atmospheric pressure: 6.1 mbar | Temp: -63°C | Humidity: <0.1%', severity: 'info' },
      { message: '[ATMOS] CO2: 95.3% | N2: 2.7% | Ar: 1.6% | O2: trace', severity: 'info' },
      { message: '[RAD] Radiation levels: 0.24 mSv/day (within safe limits)', severity: 'info' },
      { message: '[SEISMO] Deploying ground-penetrating seismometer', severity: 'info' },
      { message: '[SEISMO] Recording subsurface vibrations. Duration: 60 seconds', severity: 'info' },
      { message: '[GEO] Collecting rock and mineral samples for analysis', severity: 'info' },
      { message: '[SPEC] Spectral analysis: Iron oxide detected (hematite signature)', severity: 'info' },
      { message: '[DATA] Compressing 2.4GB sensor data for transmission', severity: 'info' },
      { message: '[COMM] Transmitting science package to Earth relay... 100%', severity: 'info' },
      { message: '[SYSTEM] All scientific objectives completed successfully', severity: 'info' },
    ],
    maintenance: [
      { message: `[SYSTEM] ${rover.name} assigned to equipment maintenance routine`, severity: 'info' },
      { message: '[DIAG] Scanning all external equipment and solar arrays', severity: 'info' },
      { message: '[SOLAR] Dust accumulation detected: Panel efficiency at 76%', severity: 'warning' },
      { message: '[CLEAN] Activating electrostatic dust removal system', severity: 'info' },
      { message: '[CLEAN] Panel 1: 87% efficiency | Panel 2: 89% | Panel 3: 91% | Panel 4: 88%', severity: 'info' },
      { message: '[RESULT] Average panel efficiency increased from 76% to 88.75%', severity: 'info' },
      { message: '[COMM] Inspecting high-gain antenna and communication array', severity: 'info' },
      { message: '[COMM] Signal strength: OPTIMAL | Orientation: LOCKED', severity: 'info' },
      { message: '[WHEELS] Performing mobility system inspection', severity: 'info' },
      { message: '[WHEELS] All 6 wheels operational. Minimal wear detected.', severity: 'info' },
      { message: '[DATA] Equipment status report uploaded to mission control', severity: 'info' },
      { message: '[SYSTEM] Maintenance cycle complete. All systems operational.', severity: 'info' },
    ],
  };

  return sequences[mission.category] || sequences.rover;
};
