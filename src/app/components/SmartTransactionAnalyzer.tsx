'use client';

import React, { useState, useEffect } from 'react';
import { useSmartTransactionAnalysisMutation } from '../hooks/useSmartAnalysis';
import { TransactionData } from '../api/smartTransactionAnalysis';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function SmartTransactionAnalyzer() {
  // Form state for transaction details
  const [value, setValue] = useState<string>('0.1');
  const [gasLimit, setGasLimit] = useState<number>(21000);
  const [isHighPriority, setIsHighPriority] = useState<boolean>(false);
  const [contractInteraction, setContractInteraction] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');

  // Transaction analysis mutation
  const {
    mutate: analyzeTransaction,
    data: analysis,
    isPending,
    isError,
    error,
  } = useSmartTransactionAnalysisMutation();

  // Debug logging
  useEffect(() => {
    console.log('SmartTransactionAnalyzer component mounted');
    return () => {
      console.log('SmartTransactionAnalyzer component unmounted');
    };
  }, []);

  useEffect(() => {
    if (isError) {
      console.error('Transaction analysis error:', error);
    }
  }, [isError, error]);

  useEffect(() => {
    if (analysis) {
      console.log('Transaction analysis received:', analysis);
    }
  }, [analysis]);

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const transactionData: TransactionData = {
      value,
      gasLimit,
      isHighPriority,
      contractInteraction,
      description,
    };

    console.log('Submitting transaction data for analysis:', transactionData);
    analyzeTransaction({ transactionData });
  };

  // Prepare chart data
  const prepareSavingsChart = () => {
    if (!analysis) return [];

    return analysis.aiAnalysis.savingsChart.timeIntervals.map((time, index) => {
      return {
        time,
        gasPrice: analysis.aiAnalysis.savingsChart.gasPrices[index],
        savings: analysis.aiAnalysis.savingsChart.savingsPercent[index],
      };
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Smart Transaction Analysis</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value (ETH)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gas Limit
            </label>
            <input
              type="number"
              min="21000"
              value={gasLimit}
              onChange={(e) => setGasLimit(parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              id="high-priority"
              type="checkbox"
              checked={isHighPriority}
              onChange={(e) => setIsHighPriority(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="high-priority"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              High Priority
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="contract-interaction"
              type="checkbox"
              checked={contractInteraction}
              onChange={(e) => setContractInteraction(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="contract-interaction"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Contract Interaction
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            placeholder="What are you trying to do with this transaction?"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isPending ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isPending ? 'Analyzing...' : 'Analyze Transaction'}
        </button>
      </form>

      {isError && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error analyzing transaction
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{(error as Error)?.message || 'Unknown error occurred'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  AI Recommendation
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="font-medium">{analysis.aiAnalysis.recommendation}</p>
                  <p className="mt-1">{analysis.aiAnalysis.rationale}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-800 mb-3">
                Execute Immediately
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas Price:</span>
                  <span className="font-medium">
                    {analysis.immediateExecution.gasPrice.toFixed(2)} Gwei
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Fee:</span>
                  <span className="font-medium">
                    {analysis.immediateExecution.estimatedFeeInETH} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmation Time:</span>
                  <span className="font-medium">
                    {analysis.immediateExecution.estimatedConfirmationTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence Level:</span>
                  <span className="font-medium">
                    {analysis.immediateExecution.confidence}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-800 mb-3">
                Optimal Timing
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Wait Time:</span>
                  <span className="font-medium">{analysis.optimalTiming.waitTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas Price:</span>
                  <span className="font-medium">
                    {analysis.optimalTiming.gasPrice.toFixed(2)} Gwei
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Fee:</span>
                  <span className="font-medium">
                    {analysis.optimalTiming.estimatedFeeInETH} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Potential Savings:</span>
                  <span className="font-medium text-green-600">
                    {analysis.optimalTiming.potentialSavingsPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-3">
              Potential Savings Over Time
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareSavingsChart()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#82ca9d"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'gasPrice') {
                        return [`${value} Gwei`, 'Gas Price'];
                      }
                      if (name === 'savings') {
                        return [`${value}%`, 'Potential Savings'];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="gasPrice"
                    name="Gas Price"
                    fill="#8884d8"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="savings"
                    name="Potential Savings %"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This chart shows how gas prices may change over time and the potential savings percentage compared to executing immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 