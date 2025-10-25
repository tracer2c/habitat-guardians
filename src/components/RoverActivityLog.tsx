import { useRoverLogs } from "@/hooks/useRoverLogs";
import { useMissions } from "@/hooks/useMissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const RoverActivityLog = () => {
  const { logs, isLoading: logsLoading } = useRoverLogs();
  const { missions, rovers, isLoading: missionsLoading } = useMissions();
  
  const isLoading = logsLoading || missionsLoading;
  
  // Get completed missions
  const completedMissions = missions.filter(m => m.status === 'completed');
  
  // Filter logs to only show mission-level events (not detailed step-by-step logs)
  const missionLevelLogs = logs.filter(log => {
    // Only show logs that indicate mission completion or assignment
    const message = log.message.toLowerCase();
    return message.includes('completed mission') || 
           message.includes('returning to base') ||
           message.includes('received mission assignment');
  });
  
  // Group completed missions by rover
  const missionsByRover = completedMissions.reduce((acc, mission) => {
    if (mission.assigned_to) {
      if (!acc[mission.assigned_to]) {
        acc[mission.assigned_to] = [];
      }
      acc[mission.assigned_to].push(mission);
    }
    return acc;
  }, {} as Record<string, typeof completedMissions>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Rover Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-secondary/30">
        <CardTitle className="flex items-center gap-2 font-mono text-base tracking-wider">
          <Activity className="h-5 w-5 text-primary" />
          ROVER ACTIVITY LOG
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 pr-4">
            {/* Completed Missions Section */}
            {Object.keys(missionsByRover).length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Completed Missions
                </h3>
                {Object.entries(missionsByRover).map(([roverId, missions]) => {
                  const rover = rovers.find(r => r.rover_id === roverId);
                  return (
                    <div key={roverId} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {rover?.name || roverId}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {missions.length} mission{missions.length > 1 ? 's' : ''} completed
                        </span>
                      </div>
                      <div className="ml-4 space-y-1">
                        {missions.map((mission) => (
                          <div
                            key={mission.id}
                            className="p-2 rounded border border-green-500/20 bg-green-500/5"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="text-sm font-mono">{mission.title}</span>
                            </div>
                            {mission.completed_at && (
                              <div className="flex items-center gap-1 ml-5">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground font-mono">
                                  {new Date(mission.completed_at).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <Separator className="my-4" />
              </div>
            )}

            {/* Recent Mission-Level Activity */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Mission Updates
              </h3>
              {missionLevelLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 font-mono">
                  [NO MISSION UPDATES]
                </p>
              ) : (
                missionLevelLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-primary/20 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        {log.metadata?.rover_name && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {log.metadata.rover_name}
                          </Badge>
                        )}
                        {log.severity && (
                          <Badge 
                            variant={log.severity === 'error' ? 'destructive' : 'secondary'}
                            className="text-xs font-mono"
                          >
                            {log.severity.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-mono">{log.message}</p>
                      {log.metadata?.mission_title && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          MISSION: {log.metadata.mission_title}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
