'use client';

import { useEffect, useState } from 'react';
import { useHistoricalGasData } from '../hooks/useGasData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/toggleSwitch.css';

export default function GasPriceHistory() {
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // Default 30 seconds
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState<number>(refreshInterval);
  const [apiStatus, setApiStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  
  const { data, isLoading, error, refetch, isRefetching } = useHistoricalGasData();
  
  // Handle automatic refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refetch()
            .then(() => {
              setApiStatus('connected');
              setLastUpdated(new Date());
            })
            .catch(() => {
              setApiStatus('error');
            });
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, refetch]);
  
  // Reset countdown when refresh interval changes
  useEffect(() => {
    setCountdown(refreshInterval);
  }, [refreshInterval]);
  
  // Set API status on initial load
  useEffect(() => {
    if (error) {
      setApiStatus('error');
    } else if (data) {
      setApiStatus('connected');
    }
  }, [data, error]);
  
  const handleManualRefresh = () => {
    setApiStatus('connecting');
    refetch()
      .then(() => {
        setApiStatus('connected');
        setLastUpdated(new Date());
      })
      .catch(() => {
        setApiStatus('error');
      });
    setCountdown(refreshInterval);
  };
  
  const formattedLastUpdated = lastUpdated.toLocaleTimeString();
  
  const getApiStatusIndicator = () => {
    switch (apiStatus) {
      case 'connected':
        return (
          <div className="flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
            <span>API Connected</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
            <div className="w-2 h-2 bg-blue-500 animate-pulse rounded-full mr-1.5"></div>
            <span>Connecting to API...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></div>
            <span>API Error</span>
          </div>
        );
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
        <div className="h-4 w-64 bg-gray-100 rounded"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
        <div className="h-4 w-full bg-gray-100 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-900">Gas Price History</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Error loading Etherscan gas data</p>
            <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Failed to connect to Etherscan API'}</p>
            <button 
              onClick={handleManualRefresh}
              className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
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
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-900">Ethereum Gas Price History</h2>
        <div className="flex items-center space-x-2">
          {getApiStatusIndicator()}
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center">
            <div className={`w-2 h-2 ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'} rounded-full mr-1.5`}></div>
            {autoRefresh ? `Auto-refresh: ${countdown}s` : 'Auto-refresh off'}
          </div>
          <button 
            onClick={handleManualRefresh}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Refresh now"
            disabled={isRefetching}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-600 ${isRefetching ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-600 text-sm">
          Real-time gas prices from Etherscan API. Track historical data to identify patterns and find optimal transaction windows.
        </p>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <label htmlFor="autoRefresh" className="text-xs text-gray-600 mr-2">Auto</label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none toggle-switch">
              <input 
                type="checkbox" 
                id="autoRefresh" 
                checked={autoRefresh}
                onChange={() => setAutoRefresh(prev => !prev)}
                className="toggle-checkbox"
              />
              <label 
                htmlFor="autoRefresh" 
                className={`toggle-label ${autoRefresh ? 'bg-blue-500' : 'bg-gray-300'}`}
              ></label>
            </div>
          </div>
          
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-xs border border-gray-300 rounded p-1"
            disabled={!autoRefresh}
          >
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>1m</option>
            <option value={300}>5m</option>
          </select>
        </div>
      </div>
      
      <div className={`h-64 mb-6 ${isRefetching ? 'opacity-60' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="time" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tickMargin={15}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Gas Price (Gwei)', angle: -90, position: 'insideLeft', fill: '#6B7280', fontSize: 12 }}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip
              labelFormatter={(time) => `Time: ${time}`}
              formatter={(value) => [`${value} Gwei`, undefined]}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '0.375rem', borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: 15 }} 
              iconType="circle" 
              iconSize={8}
            />
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
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-medium text-gray-800">Analysis</h3>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Source: Etherscan API</span>
            <span className="text-xs text-gray-500">Last updated: {formattedLastUpdated}</span>
          </div>
        </div>
        <p className="text-gray-700 text-sm">
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