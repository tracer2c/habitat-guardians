import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Mission } from "@/hooks/useMissions";

interface MissionCardProps {
  mission: Mission;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const MissionCard = ({ mission, onStart, onComplete, onCancel }: MissionCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in_progress': return 'text-blue-500';
      case 'failed': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      rover: '🤖',
      habitat: '🏠',
      science: '🔬',
      maintenance: '🔧'
    };
    return icons[category] || '📋';
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCategoryIcon(mission.category)}</span>
          <div>
            <h3 className="font-semibold text-sm">{mission.title}</h3>
            <p className="text-xs text-muted-foreground capitalize">{mission.category}</p>
          </div>
        </div>
        <Badge variant={getPriorityColor(mission.priority) as any}>
          {mission.priority}
        </Badge>
      </div>

      {mission.description && (
        <p className="text-sm text-muted-foreground">{mission.description}</p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{mission.estimated_duration || 0} min</span>
        </div>
        {mission.assigned_to && (
          <span className="text-muted-foreground">Assigned: {mission.assigned_to}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium capitalize ${getStatusColor(mission.status)}`}>
          {mission.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex gap-2">
        {mission.status === 'pending' && onStart && (
          <Button size="sm" variant="default" onClick={() => onStart(mission.id)} className="flex-1">
            <Play className="h-3 w-3 mr-1" />
            Start
          </Button>
        )}
        {mission.status === 'in_progress' && onComplete && (
          <Button size="sm" variant="default" onClick={() => onComplete(mission.id)} className="flex-1">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Complete
          </Button>
        )}
        {(mission.status === 'pending' || mission.status === 'in_progress') && onCancel && (
          <Button size="sm" variant="outline" onClick={() => onCancel(mission.id)}>
            <XCircle className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
};
