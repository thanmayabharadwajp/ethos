'use client';

import { useHistoricalGasData } from '../hooks/useGasData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GasPriceHistory() {
  const { data, isLoading, error } = useHistoricalGasData();
  
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-60 bg-gray-100 rounded"></div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Gas Price History</h2>
        <div className="text-red-500">Error loading historical gas data</div>
      </div>
    );
  }
  
  // Format data for chart
  const chartData = data.map(item => {
    // Format timestamp to readable hour
    const date = new Date(item.timestamp);
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:00`;
    
    return {
      time: formattedTime,
      low: item.low,
      average: item.average,
      high: item.high,
      timestamp: item.timestamp
    };
  });
  
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Gas Price History (Last 24 Hours)</h2>
      <p className="text-gray-600 mb-4">
        Track historical gas prices to identify patterns and find optimal transaction windows.
      </p>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="time" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tickMargin={15}
            />
            <YAxis
              label={{ value: 'Gas Price (Gwei)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              labelFormatter={(time) => `Time: ${time}`}
              formatter={(value) => [`${value} Gwei`, undefined]}
            />
            <Legend wrapperStyle={{ paddingTop: 15 }} />
            <Line 
              type="monotone" 
              dataKey="low" 
              stroke="#10B981" 
              name="Low Priority"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="average" 
              stroke="#3B82F6" 
              name="Average Priority"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="high" 
              stroke="#EF4444" 
              name="High Priority"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Analysis</h3>
        <p className="text-gray-700">
          {getGasPriceAnalysis(data)}
        </p>
      </div>
    </div>
  );
}

function getGasPriceAnalysis(data: any[]): string {
  if (!data || data.length === 0) return '';
  
  // Calculate average gas prices
  const avgLow = data.reduce((sum, item) => sum + item.low, 0) / data.length;
  const avgHigh = data.reduce((sum, item) => sum + item.high, 0) / data.length;
  
  // Find minimum and maximum values
  const minGas = Math.min(...data.map(item => item.low));
  const maxGas = Math.max(...data.map(item => item.high));
  
  // Detect trend (simple implementation)
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.average, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.average, 0) / secondHalf.length;
  
  let trend = '';
  if (secondHalfAvg > firstHalfAvg * 1.1) {
    trend = 'Gas prices are trending upward. Consider transacting soon to avoid higher costs.';
  } else if (secondHalfAvg < firstHalfAvg * 0.9) {
    trend = 'Gas prices are trending downward. You may want to wait for potentially lower costs.';
  } else {
    trend = 'Gas prices have been relatively stable over the past 24 hours.';
  }
  
  return `Over the last 24 hours, gas prices have ranged from ${minGas} to ${maxGas} Gwei. ${trend}`;
} 