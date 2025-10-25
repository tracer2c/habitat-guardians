import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mission, Rover } from "@/hooks/useMissions";
import { useRoverLogs } from "@/hooks/useRoverLogs";
import { Activity, Clock, MapPin } from "lucide-react";

interface RoverMissionDialogProps {
  mission: Mission;
  rover: Rover;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoverMissionDialog = ({ mission, rover, open, onOpenChange }: RoverMissionDialogProps) => {
  const { logs, createLog } = useRoverLogs(mission.id);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (open && mission.status === 'in_progress' && !hasStarted) {
      setHasStarted(true);
      simulateMissionLogs();
    }
  }, [open, mission.status]);

  const simulateMissionLogs = async () => {
    const missionLogs = generateMissionSequence(mission, rover);
    
    for (let i = 0; i < missionLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
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
          total_steps: missionLogs.length
        }
      });
    }
  };

  const missionLogs = logs.filter(log => log.metadata?.mission_id === mission.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Mission Progress: {mission.title}
          </DialogTitle>
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
              <div className="text-xs text-muted-foreground mb-1">Battery</div>
              <div className="text-lg font-bold">{rover.battery_level}%</div>
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Location</div>
              <div className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {rover.location_x?.toFixed(1)}, {rover.location_y?.toFixed(1)}
              </div>
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Status</div>
              <div className="text-sm font-medium capitalize">{rover.status}</div>
            </div>
          </div>

          {/* Live Logs */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Live Mission Log</h3>
            </div>
            <ScrollArea className="h-[280px] border rounded-lg p-3">
              {missionLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Initializing mission...
                </p>
              ) : (
                <div className="space-y-2">
                  {missionLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-2 rounded border border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="text-xs text-muted-foreground font-mono mt-0.5 min-w-[80px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">{log.message}</div>
                        {log.metadata?.step && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Step {log.metadata.step} of {log.metadata.total_steps}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
      { message: `${rover.name} received mission assignment: ${mission.title}`, severity: 'info' },
      { message: 'Running pre-mission diagnostics...', severity: 'info' },
      { message: 'All systems nominal. Beginning navigation to target coordinates.', severity: 'info' },
      { message: `Moving to location: ${rover.location_x?.toFixed(1)}, ${rover.location_y?.toFixed(1)}`, severity: 'info' },
      { message: 'Terrain analysis complete. Path is clear.', severity: 'info' },
      { message: 'Deploying soil collection arm...', severity: 'info' },
      { message: 'Sample collection in progress...', severity: 'info' },
      { message: 'Sample secured. Storing in containment unit.', severity: 'info' },
      { message: 'Mission objective achieved. Returning to base.', severity: 'info' },
    ],
    habitat: [
      { message: `${rover.name} dispatched for habitat maintenance task`, severity: 'info' },
      { message: 'Approaching habitat module...', severity: 'info' },
      { message: 'Scanning structural integrity...', severity: 'info' },
      { message: 'Life support systems check: PASS', severity: 'info' },
      { message: 'Performing seal inspection on airlock modules', severity: 'info' },
      { message: 'Minor wear detected on seal B-3. Applying patch.', severity: 'warning' },
      { message: 'Patch applied successfully. Seal integrity restored.', severity: 'info' },
      { message: 'Habitat maintenance complete.', severity: 'info' },
    ],
    science: [
      { message: `${rover.name} beginning scientific data collection`, severity: 'info' },
      { message: 'Calibrating scientific instruments...', severity: 'info' },
      { message: 'Atmospheric analysis commenced', severity: 'info' },
      { message: 'Recording radiation levels and temperature gradients', severity: 'info' },
      { message: 'Deploying seismometer for geological data', severity: 'info' },
      { message: 'Collecting mineral samples from surface', severity: 'info' },
      { message: 'Data transmission to base initiated', severity: 'info' },
      { message: 'All scientific objectives completed successfully', severity: 'info' },
    ],
    maintenance: [
      { message: `${rover.name} assigned to equipment maintenance`, severity: 'info' },
      { message: 'Scanning equipment status...', severity: 'info' },
      { message: 'Solar panel cleaning initiated', severity: 'info' },
      { message: 'Removing dust accumulation from panels 1-4', severity: 'info' },
      { message: 'Panel efficiency increased by 12%', severity: 'info' },
      { message: 'Inspecting communication array', severity: 'info' },
      { message: 'All equipment operational. Maintenance cycle complete.', severity: 'info' },
    ],
  };

  return sequences[mission.category] || sequences.rover;
};
