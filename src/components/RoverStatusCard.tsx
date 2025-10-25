import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Battery, MapPin } from "lucide-react";
import { Rover } from "@/hooks/useMissions";

interface RoverStatusCardProps {
  rover: Rover;
}

export const RoverStatusCard = ({ rover }: RoverStatusCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'idle': return 'secondary';
      case 'charging': return 'outline';
      case 'maintenance': return 'destructive';
      case 'offline': return 'destructive';
      default: return 'secondary';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-500';
    if (level > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{rover.name}</h3>
          <p className="text-xs text-muted-foreground">{rover.rover_id}</p>
        </div>
        <Badge variant={getStatusColor(rover.status) as any} className="capitalize">
          {rover.status}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className={`h-4 w-4 ${getBatteryColor(rover.battery_level || 0)}`} />
            <span className="text-sm">Battery</span>
          </div>
          <span className={`text-sm font-bold ${getBatteryColor(rover.battery_level || 0)}`}>
            {rover.battery_level?.toFixed(0) || 0}%
          </span>
        </div>
        <Progress value={rover.battery_level || 0} className="h-2" />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        <span>
          Position: ({rover.location_x?.toFixed(1) || 0}, {rover.location_y?.toFixed(1) || 0})
        </span>
      </div>

      {rover.current_task_id && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">Current Task:</p>
          <p className="text-sm font-medium truncate">{rover.current_task_id}</p>
        </div>
      )}
    </Card>
  );
};
