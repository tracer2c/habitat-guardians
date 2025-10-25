import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface LocationCardProps {
  locationName: string;
  temperature: number;
  humidity: number;
  airQuality: number;
  weatherScore: number;
  data: any[];
  onRemove: () => void;
}

export const LocationCard = ({
  locationName,
  temperature,
  humidity,
  airQuality,
  weatherScore,
  data,
  onRemove
}: LocationCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "Good" };
    if (score >= 60) return { variant: "secondary" as const, label: "Fair" };
    return { variant: "destructive" as const, label: "Poor" };
  };

  const getTrend = () => {
    if (data.length < 2) return null;
    const recent = data[data.length - 1]?.temperature || 0;
    const previous = data[data.length - 2]?.temperature || 0;
    const diff = recent - previous;
    
    if (Math.abs(diff) < 1) return <Minus className="h-3 w-3" />;
    return diff > 0 ? <TrendingUp className="h-3 w-3 text-red-500" /> : <TrendingDown className="h-3 w-3 text-blue-500" />;
  };

  const badge = getScoreBadge(weatherScore);

  return (
    <Card className="relative p-4 space-y-3 border-2 hover:border-primary/50 transition-colors">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm truncate">{locationName.split(',')[0]}</h3>
          {getTrend()}
        </div>
        <p className="text-xs text-muted-foreground">{locationName.split(',').slice(1).join(',')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Temperature</p>
          <p className="text-xl font-bold">{temperature.toFixed(1)}°C</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Humidity</p>
          <p className="text-xl font-bold">{humidity.toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Air Quality</p>
          <p className="text-xl font-bold">{airQuality.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Score</p>
          <p className={`text-xl font-bold ${getScoreColor(weatherScore)}`}>
            {weatherScore.toFixed(0)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <div className="h-8 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.slice(-10)}>
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
