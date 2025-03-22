'use client';

import { useState } from 'react';
import { useOptimalTransactionTime, useOptimalGasPrice } from '../hooks/useGasData';
import { formatGasPrice } from '../utils/ethereum';

export default function TransactionOptimizer() {
  const [timeframe, setTimeframe] = useState<'next_hour' | 'today' | 'next_24_hours'>('today');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [confirmedMinutes, setConfirmedMinutes] = useState<number>(5);
  
  const { data: optimalTime, isLoading: isLoadingOptimalTime } = useOptimalTransactionTime(timeframe, priority);
  const { data: optimalGasPrice, isLoading: isLoadingGasPrice } = useOptimalGasPrice(confirmedMinutes);
  
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">AI Transaction Optimizer</h2>
      <p className="text-gray-600 mb-4">
        Our AI will analyze current and predicted network conditions to recommend the 
        optimal transaction parameters.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Find Best Transaction Time</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              When do you want to transact?
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
            >
              <option value="next_hour">Within the next hour</option>
              <option value="today">Sometime today</option>
              <option value="next_24_hours">Within the next 24 hours</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Priority
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="low"
                  checked={priority === 'low'}
                  onChange={() => setPriority('low')}
                  className="mr-2"
                />
                Low
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="medium"
                  checked={priority === 'medium'}
                  onChange={() => setPriority('medium')}
                  className="mr-2"
                />
                Medium
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="high"
                  checked={priority === 'high'}
                  onChange={() => setPriority('high')}
                  className="mr-2"
                />
                High
              </label>
            </div>
          </div>
          
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md transition-colors"
          >
            Calculate Optimal Time
          </button>
          
          {isLoadingOptimalTime ? (
            <div className="mt-4 animate-pulse h-20 bg-gray-100 rounded"></div>
          ) : optimalTime && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h4 className="font-medium text-green-800">AI Recommendation</h4>
              <p className="text-sm text-gray-700 mt-1">
                The best time to transact is around: <span className="font-bold text-lg">{optimalTime.bestTimeToTransact}</span>
              </p>
              <p className="text-sm text-gray-700">
                Expected gas price: <span className="font-medium">{optimalTime.predictedGasPrice} Gwei</span>
              </p>
              <p className="text-sm text-gray-700">
                Confidence level: <span className="font-medium">{Math.round(optimalTime.confidenceScore * 100)}%</span>
              </p>
              <div className="mt-2 flex items-center">
                <span className="text-xs mr-2">Network congestion:</span>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${getCongestionColorClass(optimalTime.congestionLevel)}`}
                    style={{ width: `${optimalTime.congestionLevel}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Optimize Gas Price</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How quickly do you need confirmation? (minutes)
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={confirmedMinutes}
              onChange={(e) => setConfirmedMinutes(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Faster (1 min)</span>
              <span>Cheaper (15 min)</span>
            </div>
            <div className="text-center text-sm mt-1">
              Selected: <span className="font-medium">{confirmedMinutes} minutes</span>
            </div>
          </div>
          
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md transition-colors"
          >
            Calculate Optimal Gas
          </button>
          
          {isLoadingGasPrice ? (
            <div className="mt-4 animate-pulse h-20 bg-gray-100 rounded"></div>
          ) : optimalGasPrice && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-800">AI Recommendation</h4>
              <p className="text-2xl font-bold mt-1">
                {formatGasPrice(optimalGasPrice.gasPrice)}
              </p>
              <p className="text-sm text-gray-700">
                Estimated confirmation time: <span className="font-medium">{optimalGasPrice.estimatedTimeMinutes} minutes</span>
              </p>
              <p className="text-xs text-gray-500 mt-3">
                *Estimations based on current network conditions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getCongestionColorClass(level: number): string {
  if (level < 30) return 'bg-green-500';
  if (level < 60) return 'bg-yellow-500';
  if (level < 85) return 'bg-orange-500';
  return 'bg-red-500';
} 