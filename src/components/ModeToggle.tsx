import { Button } from "@/components/ui/button";
import { Rocket, Building2 } from "lucide-react";
import { HabitatMode } from "@/lib/dataSimulator";

interface ModeToggleProps {
  mode: HabitatMode;
  onModeChange: (mode: HabitatMode) => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="flex gap-2 p-1 bg-secondary rounded-lg border border-border">
      <Button
        variant={mode === 'mars' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('mars')}
        className="gap-2"
      >
        <Rocket className="h-4 w-4" />
        Mars Mode
      </Button>
      <Button
        variant={mode === 'earth' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('earth')}
        className="gap-2"
      >
        <Building2 className="h-4 w-4" />
        Earth Mode
      </Button>
    </div>
  );
};
