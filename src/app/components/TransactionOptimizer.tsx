'use client';

import { useState, useEffect } from 'react';
import { useOptimalGasPrice, useBlockGasPredictions } from '../hooks/useGasData';
import { formatGasPrice } from '../utils/ethereum';

export default function TransactionOptimizer() {
  const [confirmedMinutes, setConfirmedMinutes] = useState<number>(5);
  const [isCalculatingGas, setIsCalculatingGas] = useState(false);
  
  // States to store AI recommendations
  const [gasRecommendation, setGasRecommendation] = useState<any>(null);
  
  const { data: blockPredictions } = useBlockGasPredictions();
  const { data: optimalGasPrice, isLoading: isLoadingGasPrice, refetch: refetchOptimalGas } = useOptimalGasPrice(confirmedMinutes);
  
  const handleCalculateOptimalGas = async () => {
    setIsCalculatingGas(true);
    
    try {
      // Call refetch to get fresh data from API
      await refetchOptimalGas();
      
      // Log to console for debugging
      console.log(`Generating gas price recommendation for confirmation time: ${confirmedMinutes} minutes`);
      
      // Use blocknative predictions if available
      if (blockPredictions && blockPredictions.length > 0) {
        // Find prediction that matches closest to our desired confirmation time
        // Each block takes ~12 seconds, so calculate how many blocks we need for our confirmedMinutes
        const blocksNeeded = Math.max(1, Math.round(confirmedMinutes * 60 / 12));
        const selectedPrediction = blockPredictions[Math.min(blocksNeeded - 1, blockPredictions.length - 1)];
        
        const recommendation = {
          estimatedTimeMinutes: confirmedMinutes,
          blockNumber: selectedPrediction.blockNumber,
          suggestedGasPrice: selectedPrediction.baseFee.medium,
          highConfidenceGasPrice: selectedPrediction.baseFee.high,
          blocknativePrediction: true
        };
        
        setGasRecommendation(recommendation);
      } else if (optimalGasPrice) {
        // Fallback to our optimal gas price calculation
        setGasRecommendation({
          estimatedTimeMinutes: optimalGasPrice.estimatedTimeMinutes,
          suggestedGasPrice: Number(optimalGasPrice.gasPrice) / 1e9, // Convert to Gwei
          blocknativePrediction: false
        });
      }
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error generating gas recommendation:", error);
    } finally {
      setIsCalculatingGas(false);
    }
  };
  
  // Calculate immediately on component mount
  useEffect(() => {
    handleCalculateOptimalGas();
  }, []);
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Transaction Optimizer</h2>
      
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-3">Gas Price Optimization</h3>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="confirmationTime" className="block text-sm font-medium text-gray-700 mb-1">
              Desired Confirmation Time (minutes)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                id="confirmationTime"
                min="1"
                max="15"
                step="1"
                value={confirmedMinutes}
                onChange={(e) => setConfirmedMinutes(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-2 text-gray-700 w-6">{confirmedMinutes}</span>
            </div>
          </div>
          
          <button
            onClick={handleCalculateOptimalGas}
            disabled={isCalculatingGas}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isCalculatingGas ? 'Calculating...' : 'Calculate Optimal Gas'}
          </button>
        </div>
        
        {gasRecommendation && (
          <div className="bg-gray-50 rounded-lg p-4 mb-2">
            <h4 className="font-medium mb-2">Gas Price Recommendation</h4>
            <div className="text-sm text-gray-700 space-y-2">
              {gasRecommendation.blocknativePrediction ? (
                <>
                  <p>
                    <span className="font-semibold">Block number:</span> {gasRecommendation.blockNumber}
                  </p>
                  <p>
                    <span className="font-semibold">Confirmation in:</span> ~{gasRecommendation.estimatedTimeMinutes} minutes
                  </p>
                  <p>
                    <span className="font-semibold">Suggested gas price (medium confidence):</span> {gasRecommendation.suggestedGasPrice} Gwei
                  </p>
                  <p>
                    <span className="font-semibold">High confidence gas price:</span> {gasRecommendation.highConfidenceGasPrice} Gwei
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Data sourced from Blocknative prediction API
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <span className="font-semibold">Estimated confirmation time:</span> ~{gasRecommendation.estimatedTimeMinutes} minutes
                  </p>
                  <p>
                    <span className="font-semibold">Suggested gas price:</span> {gasRecommendation.suggestedGasPrice.toFixed(2)} Gwei
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Based on current network conditions
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2">
          Set your desired confirmation time and our system will recommend an optimal gas price based on Blocknative predictions.
        </div>
      </div>
    </div>
  );
} 