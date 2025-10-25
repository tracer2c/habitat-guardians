import { EnvironmentalData, HabitatMode } from "@/lib/dataSimulator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface EnvironmentChartProps {
  data: EnvironmentalData[];
  mode: HabitatMode;
}

export const EnvironmentChart = ({ data, mode }: EnvironmentChartProps) => {
  const chartData = data.map((d) => ({
    time: d.timestamp.toLocaleTimeString(),
    temperature: d.temperature,
    [mode === 'mars' ? 'oxygen' : 'airQuality']: d.oxygen,
    power: d.power,
    stability: d.stabilityScore,
  }));

  return (
    <div className="w-full h-[400px] bg-card rounded-lg border border-border p-4">
      <h3 className="text-lg font-semibold mb-4">Environmental Telemetry</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="hsl(var(--chart-4))"
            strokeWidth={2}
            dot={false}
            name="Temperature (°C)"
          />
          <Line
            type="monotone"
            dataKey={mode === 'mars' ? 'oxygen' : 'airQuality'}
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={false}
            name={mode === 'mars' ? 'Oxygen (%)' : 'Air Quality'}
          />
          <Line
            type="monotone"
            dataKey="power"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
            name="Power (%)"
          />
          <Line
            type="monotone"
            dataKey="stability"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={false}
            name="Stability Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
