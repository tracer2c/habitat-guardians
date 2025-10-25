import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Battery, MapPin } from "lucide-react";
import { Rover } from "@/hooks/useMissions";
import { useMissions } from "@/hooks/useMissions";

interface RoverStatusCardProps {
  rover: Rover;
}

export const RoverStatusCard = ({ rover }: RoverStatusCardProps) => {
  const { updateRoverStatus } = useMissions();
  const [currentBattery, setCurrentBattery] = useState(rover.battery_level || 0);

  // Simulate battery charging when rover is charging
  useEffect(() => {
    setCurrentBattery(rover.battery_level || 0);
    
    if (rover.status === 'charging' && currentBattery < 100) {
      const interval = setInterval(async () => {
        setCurrentBattery(prev => {
          const newBattery = Math.min(100, prev + 0.5);
          
          // Update database every 2% change
          if (Math.floor(newBattery) % 2 === 0 && Math.floor(newBattery) !== Math.floor(prev)) {
            updateRoverStatus(rover.rover_id, {
              battery_level: newBattery,
              status: newBattery >= 100 ? 'idle' : 'charging'
            });
          }
          
          return newBattery;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [rover.status, rover.battery_level, rover.rover_id]);

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
            <Battery className={`h-4 w-4 ${getBatteryColor(currentBattery)}`} />
            <span className="text-sm">Battery</span>
          </div>
          <span className={`text-sm font-bold ${getBatteryColor(currentBattery)}`}>
            {currentBattery.toFixed(0)}%
          </span>
        </div>
        <Progress value={currentBattery} className="h-2" />
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
