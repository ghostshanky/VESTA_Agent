import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Feedback {
  id: number;
  urgency?: number;
  impact?: number;
  theme?: string;
  priority_score?: number;
}

export default function PriorityChart({ data }: { data: Feedback[] }) {
  const chartData = data
    .filter(item => item.urgency && item.impact)
    .map(item => ({
      urgency: item.urgency,
      impact: item.impact,
      theme: item.theme,
      priority: item.priority_score
    }));

  const getColor = (priority?: number) => {
    if (!priority) return '#94a3b8';
    if (priority >= 8) return '#dc2626';
    if (priority >= 6) return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <div className="w-full h-96">
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No data available for chart
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="urgency" 
              name="Urgency" 
              domain={[0, 10]}
              label={{ value: 'Urgency', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              type="number" 
              dataKey="impact" 
              name="Impact" 
              domain={[0, 10]}
              label={{ value: 'Impact', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded shadow-lg border">
                      <p className="font-semibold">{data.theme}</p>
                      <p className="text-sm">Urgency: {data.urgency}/10</p>
                      <p className="text-sm">Impact: {data.impact}/10</p>
                      <p className="text-sm">Priority: {data.priority?.toFixed(2)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={chartData} fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.priority)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
