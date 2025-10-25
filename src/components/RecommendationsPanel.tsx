import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, Eye, RefreshCw, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export interface Recommendation {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'immediate' | 'preventive' | 'monitoring';
  impact: string;
  timeframe: string;
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const RecommendationsPanel = ({ 
  recommendations, 
  onRefresh,
  isLoading = false 
}: RecommendationsPanelProps) => {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'immediate':
        return <AlertTriangle className="h-4 w-4" />;
      case 'preventive':
        return <Shield className="h-4 w-4" />;
      case 'monitoring':
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const toggleComplete = (index: number) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompleted(newCompleted);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <ScrollArea className="h-[300px]">
        <CardContent className="space-y-3">
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              All systems operating normally. No recommendations at this time.
            </p>
          ) : (
            recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 transition-all ${
                  completed.has(index) 
                    ? 'bg-muted/50 border-muted opacity-60' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(rec.category)}
                    <Badge variant={getPriorityColor(rec.priority) as any}>
                      {rec.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {rec.category}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComplete(index)}
                    className="h-6 w-6 p-0"
                  >
                    <CheckCircle2 
                      className={`h-4 w-4 ${
                        completed.has(index) 
                          ? 'text-green-500 fill-green-500' 
                          : 'text-muted-foreground'
                      }`}
                    />
                  </Button>
                </div>
                <p className={`text-sm font-medium mb-1 ${completed.has(index) ? 'line-through' : ''}`}>
                  {rec.action}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Impact:</strong> {rec.impact}
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Timeframe:</strong> {rec.timeframe}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};
