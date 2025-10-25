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

  const isRoverMission = mission.category === 'rover';
  const isHumanMission = mission.category === 'human';

  return (
    <Card className="p-4 space-y-3 border-primary/20 bg-secondary/20">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCategoryIcon(mission.category)}</span>
          <div>
            <h3 className="font-semibold text-sm font-mono">{mission.title}</h3>
            <p className="text-xs text-muted-foreground capitalize font-mono">{mission.category}</p>
          </div>
        </div>
        <Badge variant={getPriorityColor(mission.priority) as any} className="font-mono">
          {mission.priority.toUpperCase()}
        </Badge>
      </div>

      {mission.description && (
        <p className="text-sm text-muted-foreground font-mono">{mission.description}</p>
      )}

      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>DURATION: {mission.estimated_duration || 0} MIN</span>
        </div>
        {mission.assigned_to && (
          <Badge variant="outline" className="text-xs font-mono">
            {isRoverMission ? '🤖' : isHumanMission ? '👨‍🚀' : '📋'} {mission.assigned_to}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium capitalize font-mono ${getStatusColor(mission.status)}`}>
          [{mission.status.replace('_', ' ').toUpperCase()}]
        </span>
      </div>

      <div className="flex gap-2">
        {mission.status === 'pending' && onStart && (
          <Button size="sm" variant="default" onClick={() => onStart(mission.id)} className="flex-1 font-mono">
            <Play className="h-3 w-3 mr-1" />
            {isRoverMission ? 'Deploy Rover' : isHumanMission ? 'Deploy Crew' : 'Start'}
          </Button>
        )}
        {mission.status === 'in_progress' && onComplete && (
          <Button size="sm" variant="default" onClick={() => onComplete(mission.id)} className="flex-1 font-mono">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Complete
          </Button>
        )}
        {(mission.status === 'pending' || mission.status === 'in_progress') && onCancel && (
          <Button size="sm" variant="outline" onClick={() => onCancel(mission.id)} className="font-mono">
            <XCircle className="h-3 w-3 mr-1" />
            Abort
          </Button>
        )}
      </div>
    </Card>
  );
};
