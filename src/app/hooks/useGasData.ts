import { useQuery } from '@tanstack/react-query';
import { getCurrentGasPrice, getNetworkCongestion, formatGasPrice, estimateOptimalGasPrice } from '../utils/ethereum';
import { getHistoricalGasData } from '../api/gasPriceService';
import { fetchBlocknativeGasPredictions } from '../api/blockNativeGasPrediction';

export function useCurrentGasPrice() {
  return useQuery({
    queryKey: ['gasPrice'],
    queryFn: async () => {
      const gasPrice = await getCurrentGasPrice();
      return {
        rawPrice: gasPrice,
        formatted: formatGasPrice(gasPrice)
      };
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useNetworkCongestion() {
  return useQuery({
    queryKey: ['networkCongestion'],
    queryFn: getNetworkCongestion,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useHistoricalGasData() {
  return useQuery({
    queryKey: ['historicalGasData'],
    queryFn: getHistoricalGasData,
    refetchInterval: 0, // Disable auto refetch as we handle it manually in the component
    staleTime: 0, // Consider data stale immediately to ensure latest data on manual refetch
  });
}

export function useOptimalGasPrice(desiredConfirmationTimeMinutes: number) {
  return useQuery({
    queryKey: ['optimalGasPrice', desiredConfirmationTimeMinutes],
    queryFn: () => estimateOptimalGasPrice(desiredConfirmationTimeMinutes),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// New hook for block-based gas predictions using Blocknative API
export function useBlockGasPredictions() {
  return useQuery({
    queryKey: ['blockGasPredictions'],
    queryFn: async () => {
      try {
        return await fetchBlocknativeGasPredictions();
      } catch (error) {
        console.error('Error fetching block gas predictions:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds as blocks change
    staleTime: 12000,      // Consider data stale after ~1 block time (12 sec)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Shorter retry for block predictions
  });
} 