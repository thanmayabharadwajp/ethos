import React, { useEffect } from 'react';
import { useBlockGasPredictions } from '../hooks/useGasData';
import { BlockPrediction } from '../api/blockNativeGasPrediction';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BlockGasPrediction: React.FC = () => {
  const { data: predictions, isLoading, error, refetch } = useBlockGasPredictions();
  
  useEffect(() => {
    console.log('BlockGasPrediction Component - Mounted');
    console.log('isLoading:', isLoading);
    console.log('error:', error);
    console.log('predictions:', predictions);
    
    if (error) {
      console.error('Block Gas Prediction Error Details:', error);
    }
  }, [isLoading, error, predictions]);
  
  if (isLoading) {
    console.log('Rendering loading state');
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <div className="animate-pulse text-gray-500">Loading block predictions...</div>
      </div>
    );
  }
  
  if (error || !predictions || predictions.length === 0) {
    console.log('Rendering error state', error);
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-50 rounded-lg p-4">
        <div className="text-red-500 mb-2">Error loading block gas predictions</div>
        {error instanceof Error && (
          <div className="text-sm text-gray-600 mb-4 max-w-md text-center">
            {error.message}
          </div>
        )}
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  console.log('Formatting chart data from predictions:', predictions);
  // Format the data for the chart
  const chartData = predictions.map((prediction: BlockPrediction) => ({
    blockNumber: `Block ${prediction.blockNumber}`,
    highConfidence: parseFloat(prediction.baseFee.high.toFixed(2)),
    mediumConfidence: parseFloat(prediction.baseFee.medium.toFixed(2)),
    estimatedTime: formatBlockTime(prediction.timeEstimate)
  }));
  
  console.log('Formatted chart data:', chartData);
  
  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Next 5 Blocks Gas Prediction</h3>
        <button 
          onClick={() => refetch()} 
          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
        >
          Refresh
        </button>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="blockNumber" />
            <YAxis label={{ value: 'Base Fee (Gwei)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'highConfidence') {
                  return [`${value} Gwei`, 'High Confidence (99%)'];
                } else if (name === 'mediumConfidence') {
                  return [`${value} Gwei`, 'Medium Confidence (70%)'];
                }
                return [`${value} Gwei`, name];
              }}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.blockNumber === label);
                return `${label} - Estimated ${item ? item.estimatedTime : ''}`;
              }}
            />
            <Legend />
            <Bar dataKey="highConfidence" name="High Confidence (99%)" fill="#8884d8" />
            <Bar dataKey="mediumConfidence" name="Medium Confidence (70%)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        {predictions.some(p => p._isFallback) && (
          <p className="mt-1 text-amber-600">
            Some predictions are using estimated values due to limited API data.
          </p>
        )}
        <div className="mt-2">
          <div className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded mr-2">
            <span className="font-semibold">High Confidence:</span> 99% chance gas prices will be at or below this value
          </div>
          <div className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded">
            <span className="font-semibold">Medium Confidence:</span> 70% chance gas prices will be at or below this value
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format block time
function formatBlockTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  
  if (diffSeconds < 60) {
    return `in ${diffSeconds} seconds`;
  } else {
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    return `in ${minutes}m ${seconds}s`;
  }
}

export default BlockGasPrediction;