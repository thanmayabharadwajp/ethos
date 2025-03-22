'use client';

import { useCurrentGasPrice, useNetworkCongestion } from '../hooks/useGasData';

export default function CurrentGasInfo() {
  const { data: gasPriceData, isLoading: isLoadingGasPrice, error: gasPriceError } = useCurrentGasPrice();
  const { data: congestionLevel, isLoading: isLoadingCongestion, error: congestionError } = useNetworkCongestion();
  
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Current Ethereum Network Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-700">Gas Price</h3>
          {isLoadingGasPrice ? (
            <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
          ) : gasPriceError ? (
            <div className="text-red-500">Error loading gas price</div>
          ) : (
            <div className="text-2xl font-bold text-black">{gasPriceData?.formatted}</div>
          )}
          <p className="text-sm text-gray-500 mt-1">Updated just now</p>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-700">Network Congestion</h3>
          {isLoadingCongestion ? (
            <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
          ) : congestionError ? (
            <div className="text-red-500">Error loading congestion data</div>
          ) : (
            <div>
              <div className="text-2xl font-bold">
                {getCongestionLabel(congestionLevel || 0)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className={`h-2.5 rounded-full ${getCongestionColorClass(congestionLevel || 0)}`}
                  style={{ width: `${congestionLevel || 0}%` }}
                ></div>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">Based on pending transactions</p>
        </div>
      </div>
    </div>
  );
}

function getCongestionLabel(level: number): string {
  if (level < 30) return 'Low';
  if (level < 60) return 'Moderate';
  if (level < 85) return 'High';
  return 'Very High';
}

function getCongestionColorClass(level: number): string {
  if (level < 30) return 'bg-green-500';
  if (level < 60) return 'bg-yellow-500';
  if (level < 85) return 'bg-orange-500';
  return 'bg-red-500';
} 