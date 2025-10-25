import { cn } from "@/lib/utils";

interface StatusGaugeProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  optimalMin?: number;
  optimalMax?: number;
  warningMin?: number;
  warningMax?: number;
}

export const StatusGauge = ({
  label,
  value,
  unit,
  min,
  max,
  optimalMin,
  optimalMax,
  warningMin,
  warningMax,
}: StatusGaugeProps) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Determine status color
  let statusColor = 'text-success';
  let glowClass = 'glow-success';
  let borderColor = 'border-success/50';

  if (optimalMin !== undefined && optimalMax !== undefined) {
    if (value < optimalMin || value > optimalMax) {
      if (warningMin !== undefined && warningMax !== undefined) {
        if (value < warningMin || value > warningMax) {
          statusColor = 'text-destructive';
          glowClass = 'glow-danger';
          borderColor = 'border-destructive/50';
        } else {
          statusColor = 'text-warning';
          glowClass = 'glow-warning';
          borderColor = 'border-warning/50';
        }
      } else {
        statusColor = 'text-warning';
        glowClass = 'glow-warning';
        borderColor = 'border-warning/50';
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-card rounded-lg border border-border">
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      
      {/* Circular gauge */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            opacity="0.3"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${clampedPercentage * 2.51327} 251.327`}
            className={cn("transition-all duration-500", statusColor)}
          />
        </svg>
        
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn("text-3xl font-bold transition-colors", statusColor)}>
            {value.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">{unit}</div>
        </div>
      </div>

      {/* Status indicator */}
      <div className={cn(
        "w-full h-1 rounded-full transition-all duration-500",
        glowClass,
        statusColor.replace('text-', 'bg-')
      )} />
    </div>
  );
};
