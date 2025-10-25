import { Advisory } from "@/lib/dataSimulator";
import { Lightbulb, CheckCircle2 } from "lucide-react";

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

  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border border-accent/50 glow-primary">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-semibold">AI Advisory</h3>
      </div>

      <div>
        <h4 className="text-sm font-medium text-accent mb-2">Detected Condition</h4>
        <p className="text-sm text-foreground/90">{advisory.condition}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-accent mb-2">Recommended Actions</h4>
        <ul className="space-y-2">
          {advisory.recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground italic">{advisory.explanation}</p>
      </div>
    </div>
  );
};
