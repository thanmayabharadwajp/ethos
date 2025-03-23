'use client';

import { useCurrentGasPrice, useNetworkCongestion } from '../hooks/useGasData';

export default function CurrentGasInfo() {
  const { data: gasPriceData, isLoading: isLoadingGasPrice, error: gasPriceError } = useCurrentGasPrice();
  const { data: congestionLevel, isLoading: isLoadingCongestion, error: congestionError } = useNetworkCongestion();
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Current Network Status</h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Live</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Gas Price</h3>
          {isLoadingGasPrice ? (
            <div className="animate-pulse h-8 w-32 bg-gray-200 rounded mb-2"></div>
          ) : gasPriceError ? (
            <div className="text-red-500 font-medium">Error loading gas price</div>
          ) : (
            <div className="text-2xl font-bold text-gray-900 mb-1">{gasPriceData?.formatted}</div>
          )}
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <p className="text-xs text-gray-500">Updated just now</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Network Congestion</h3>
          {isLoadingCongestion ? (
            <div className="animate-pulse h-8 w-32 bg-gray-200 rounded mb-2"></div>
          ) : congestionError ? (
            <div className="text-red-500 font-medium">Error loading congestion data</div>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {getCongestionLabel(congestionLevel || 0)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${getCongestionColorClass(congestionLevel || 0)}`}
                  style={{ width: `${congestionLevel || 0}%` }}
                ></div>
              </div>
            </>
          )}
          <p className="text-xs text-gray-500">Based on pending transactions</p>
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