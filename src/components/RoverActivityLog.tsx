import { useRoverLogs } from "@/hooks/useRoverLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const RoverActivityLog = () => {
  const { logs, isLoading } = useRoverLogs();

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Rover Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-4">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No rover activity yet
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      {log.metadata?.rover_name && (
                        <Badge variant="outline" className="text-xs">
                          {log.metadata.rover_name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{log.message}</p>
                    {log.metadata?.mission_title && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Mission: {log.metadata.mission_title}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
