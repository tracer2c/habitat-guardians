import { Alert } from "@/lib/dataSimulator";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AlertsPanelProps {
  alerts: Alert[];
}

export const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Active Alerts</h3>
        {alerts.length > 0 && (
          <Badge variant={criticalAlerts.length > 0 ? 'destructive' : 'default'}>
            {alerts.length}
          </Badge>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 p-4 text-success/70 bg-success/10 rounded border border-success/30">
          <Info className="h-5 w-5" />
          <span className="text-sm">All systems nominal</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {alerts.map((alert, idx) => (
            <div
              key={`${alert.id}-${idx}`}
              className={cn(
                "flex items-start gap-3 p-3 rounded border transition-all",
                alert.severity === 'critical' && "bg-destructive/10 border-destructive/50 glow-danger",
                alert.severity === 'warning' && "bg-warning/10 border-warning/50 glow-warning",
                alert.severity === 'info' && "bg-primary/10 border-primary/50",
                alert.severity === 'critical' && "pulse-glow"
              )}
            >
              {alert.severity === 'critical' && (
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              )}
              {alert.severity === 'warning' && (
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              )}
              {alert.severity === 'info' && (
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
