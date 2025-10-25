import { useEffect, useState } from "react";
import { Telescope, Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useMissions } from "@/hooks/useMissions";
import { useRoverLogs } from "@/hooks/useRoverLogs";

interface MarsActivity {
  id: string;
  type: 'mission' | 'alert' | 'completion';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  metadata?: any;
}

export const MarsInvestigationPanel = () => {
  const [activities, setActivities] = useState<MarsActivity[]>([]);
  const { missions, rovers } = useMissions();
  const { logs } = useRoverLogs();

  useEffect(() => {
    const marsActivities: MarsActivity[] = [];

    // Add in-progress missions
    const activeMissions = missions.filter(m => m.status === 'in_progress');
    activeMissions.forEach(mission => {
      const rover = rovers.find(r => r.rover_id === mission.assigned_to);
      marsActivities.push({
        id: `mission-${mission.id}`,
        type: 'mission',
        title: `Active Mission: ${mission.title}`,
        description: `${rover?.name || 'Unknown rover'} is currently executing ${mission.category} mission. Priority: ${mission.priority}. Estimated duration: ${mission.estimated_duration} minutes.`,
        severity: mission.priority === 'critical' ? 'critical' : mission.priority === 'high' ? 'warning' : 'info',
        timestamp: mission.created_at,
        metadata: mission
      });
    });

    // Add recent completions
    const recentCompletions = missions
      .filter(m => m.status === 'completed' && m.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, 3);
    
    recentCompletions.forEach(mission => {
      marsActivities.push({
        id: `completion-${mission.id}`,
        type: 'completion',
        title: `Mission Completed: ${mission.title}`,
        description: `Successfully completed ${mission.category} mission. Data collection and analysis recommended for scientific review.`,
        severity: 'info',
        timestamp: mission.completed_at!,
        metadata: mission
      });
    });

    // Add critical rover alerts (low battery, maintenance needed)
    rovers.forEach(rover => {
      if (rover.battery_level && rover.battery_level < 30) {
        marsActivities.push({
          id: `alert-battery-${rover.rover_id}`,
          type: 'alert',
          title: `Low Battery Alert: ${rover.name}`,
          description: `${rover.name} battery at ${rover.battery_level.toFixed(0)}%. Recommend monitoring solar charging efficiency and mission scheduling adjustments.`,
          severity: 'warning',
          timestamp: rover.last_updated,
          metadata: rover
        });
      }
      if (rover.status === 'maintenance') {
        marsActivities.push({
          id: `alert-maintenance-${rover.rover_id}`,
          type: 'alert',
          title: `Maintenance Required: ${rover.name}`,
          description: `${rover.name} requires maintenance attention. Review diagnostic logs and schedule repair operations.`,
          severity: 'warning',
          timestamp: rover.last_updated,
          metadata: rover
        });
      }
    });

    // Sort by timestamp (most recent first)
    marsActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setActivities(marsActivities.slice(0, 8)); // Show top 8 activities
  }, [missions, rovers, logs]);

  const getIcon = (type: string, severity: string) => {
    if (type === 'alert') return <AlertTriangle className="h-4 w-4" />;
    if (type === 'completion') return <CheckCircle className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'warning': return 'text-yellow-500';
      default: return 'text-primary';
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-lg border border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Telescope className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold font-mono">MARS INVESTIGATION HUB</h3>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          LIVE FEED
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Real-time Mars mission activities for Earth-based scientists to monitor and investigate
      </p>

      <ScrollArea className="h-[400px] pr-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No active Mars activities to investigate</p>
            <p className="text-xs mt-2">All systems nominal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border ${
                  activity.severity === 'critical' 
                    ? 'border-destructive/50 bg-destructive/5' 
                    : activity.severity === 'warning'
                    ? 'border-yellow-500/50 bg-yellow-500/5'
                    : 'border-border bg-secondary/20'
                } hover:bg-secondary/40 transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${getSeverityColor(activity.severity)}`}>
                    {getIcon(activity.type, activity.severity)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold font-mono">
                        {activity.title}
                      </h4>
                      <Badge 
                        variant={activity.type === 'alert' ? 'destructive' : 'secondary'} 
                        className="text-xs font-mono shrink-0"
                      >
                        {activity.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground font-mono">
          🔴 LIVE • Updated in real-time from Mars mission control
        </p>
      </div>
    </div>
  );
};
