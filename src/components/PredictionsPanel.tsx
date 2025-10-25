import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  alertLevel: 'safe' | 'warning' | 'critical';
}

interface PredictionsPanelProps {
  predictions: Prediction[];
}

export const PredictionsPanel = ({ predictions }: PredictionsPanelProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-blue-400';
      case 'decreasing':
        return 'text-orange-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/5';
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/5';
      default:
        return 'border-border/40';
    }
  };

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      temperature: 'Temp',
      oxygen: 'O₂',
      power: 'Power',
      stability: 'Stability',
    };
    return labels[metric] || metric;
  };

  const getMetricUnit = (metric: string) => {
    const units: Record<string, string> = {
      temperature: '°C',
      oxygen: '%',
      power: '%',
      stability: '',
    };
    return units[metric] || '';
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/40">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Predictions</h3>
        <Badge variant="outline" className="ml-auto text-xs">Next 30min</Badge>
      </div>

      <div className="space-y-3">
        {predictions.map((pred) => (
          <div
            key={pred.metric}
            className={`p-3 rounded-lg border transition-all ${getAlertColor(pred.alertLevel)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{getMetricLabel(pred.metric)}</span>
              <div className={`flex items-center gap-1 text-xs ${getTrendColor(pred.trend)}`}>
                {getTrendIcon(pred.trend)}
                <span className="capitalize">{pred.trend}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current</div>
                <div className="text-lg font-bold">
                  {pred.current?.toFixed(1) ?? 'N/A'}{pred.current != null && getMetricUnit(pred.metric)}
                </div>
              </div>

              <div className="text-muted-foreground">→</div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">Predicted</div>
                <div className="text-lg font-bold text-primary">
                  {pred.predicted?.toFixed(1) ?? 'N/A'}{pred.predicted != null && getMetricUnit(pred.metric)}
                </div>
              </div>

              <div className="ml-auto text-right">
                <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                <div className="text-sm font-medium">
                  {pred.confidence != null ? (pred.confidence * 100).toFixed(0) : 'N/A'}%
                </div>
              </div>
            </div>

            {pred.alertLevel !== 'safe' && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-muted-foreground">
                  {pred.alertLevel === 'critical' ? 'Critical threshold predicted' : 'Warning threshold predicted'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          Predictions use statistical analysis of historical patterns and trends
        </p>
      </div>
    </Card>
  );
};
