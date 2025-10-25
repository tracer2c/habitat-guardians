import { Card } from "@/components/ui/card";
import { AlertTriangle, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnomalyDetection {
  detected: boolean;
  metric: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
}

interface AnomalyPanelProps {
  anomalies: AnomalyDetection[];
}

export const AnomalyPanel = ({ anomalies }: AnomalyPanelProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500 bg-red-500/10 border-red-500/50';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/50';
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/50';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/40">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Anomaly Detection</h3>
      </div>

      {anomalies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Shield className="w-12 h-12 text-green-500 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No anomalies detected
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            All metrics within normal patterns
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.map((anomaly, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold">{anomaly.metric}</span>
                    <Badge 
                      variant={getSeverityBadge(anomaly.severity)}
                      className="text-xs"
                    >
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/90 mb-2">
                    {anomaly.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Detected: {new Date(anomaly.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          AI analyzes deviations from normal patterns using statistical methods
        </p>
      </div>
    </Card>
  );
};
