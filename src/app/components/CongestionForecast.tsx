'use client';

import { usePredictFutureCongestion } from '../hooks/useGasData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CongestionForecast() {
  const { data, isLoading, error } = usePredictFutureCongestion();
  
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
        <h2 className="text-xl font-semibold mb-4">Network Congestion Forecast</h2>
        <div className="text-red-500">Error loading congestion forecast</div>
      </div>
    );
  }
  
  const chartData = data.timeIntervals.map((time, index) => ({
    hour: time,
    congestion: data.congestionLevels[index],
    status: getCongestionStatus(data.congestionLevels[index])
  }));
  
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Network Congestion Forecast (Next 24 Hours)</h2>
      <p className="text-gray-600 mb-4">
        Our AI model predicts network congestion levels for the next 24 hours. 
        Green bars indicate optimal times for transactions.
      </p>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="hour" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tickMargin={15}
            />
            <YAxis 
              domain={[0, 100]}
              label={{ value: 'Congestion %', angle: -90, position: 'insideLeft'
               }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value}%`, 'Congestion']}
              labelFormatter={(hour) => `Time: ${hour}`}
            />
            <Bar 
              dataKey="congestion" 
              name="Congestion Level"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between mt-4">
        <div className="text-sm">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
          Low (0-30%)
        </div>
        <div className="text-sm">
          <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
          Moderate (30-60%)
        </div>
        <div className="text-sm">
          <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1"></span>
          High (60-85%)
        </div>
        <div className="text-sm">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
          Very High (85-100%)
        </div>
      </div>
    </div>
  );
}

function getCongestionStatus(level: number): string {
  if (level < 30) return 'Low';
  if (level < 60) return 'Moderate';
  if (level < 85) return 'High';
  return 'Very High';
} 