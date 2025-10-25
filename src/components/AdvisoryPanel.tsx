import { Lightbulb, AlertCircle, Info } from "lucide-react";

interface Advisory {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface AdvisoryPanelProps {
  advisory: Advisory | null;
}

export const AdvisoryPanel = ({ advisory }: AdvisoryPanelProps) => {
  if (!advisory) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Advisory</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No immediate actions required. Systems operating within normal parameters.
        </p>
      </div>
    );
  }

  // Determine styling based on priority
  const priorityStyles = {
    high: {
      border: "border-destructive/50",
      icon: AlertCircle,
      iconColor: "text-destructive",
      glow: "glow-destructive"
    },
    medium: {
      border: "border-yellow-500/50",
      icon: AlertCircle,
      iconColor: "text-yellow-500",
      glow: "glow-warning"
    },
    low: {
      border: "border-accent/50",
      icon: Info,
      iconColor: "text-accent",
      glow: "glow-primary"
    }
  };

  const style = priorityStyles[advisory.priority];
  const Icon = style.icon;

  return (
    <div className={`flex flex-col gap-4 p-4 bg-card rounded-lg border ${style.border} ${style.glow}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${style.iconColor}`} />
          <h3 className="text-lg font-semibold">AI Advisory</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          advisory.priority === 'high' ? 'bg-destructive/20 text-destructive' :
          advisory.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
          'bg-accent/20 text-accent'
        }`}>
          {advisory.priority.toUpperCase()}
        </span>
      </div>

      <div>
        <h4 className={`text-sm font-semibold mb-2 ${style.iconColor}`}>
          {advisory.title}
        </h4>
        <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {advisory.message}
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Generated: {new Date(advisory.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
