import { Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'critical';
}

interface MissionLogProps {
  entries: LogEntry[];
}

export const MissionLog = ({ entries }: MissionLogProps) => {
  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Mission Log</h3>
      </div>

      <ScrollArea className="h-[250px]">
        <div className="space-y-2 pr-4">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events logged yet.</p>
          ) : (
            entries.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2 rounded border border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <div className="text-xs text-muted-foreground font-mono mt-0.5 min-w-[80px]">
                  {entry.timestamp.toLocaleTimeString()}
                </div>
                <div className="flex-1 text-sm">{entry.message}</div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export type { LogEntry };
