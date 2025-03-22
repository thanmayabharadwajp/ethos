import { useQuery } from '@tanstack/react-query';
import { getCurrentGasPrice, getNetworkCongestion, predictFutureCongestion, formatGasPrice, estimateOptimalGasPrice } from '../utils/ethereum';
import { getHistoricalGasData, predictOptimalTransactionTime } from '../api/gasPriceService';

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

export function usePredictFutureCongestion() {
  return useQuery({
    queryKey: ['futureCongestion'],
    queryFn: predictFutureCongestion,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useHistoricalGasData() {
  return useQuery({
    queryKey: ['historicalGasData'],
    queryFn: getHistoricalGasData,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useOptimalTransactionTime(
  desiredTimeframe: 'next_hour' | 'today' | 'next_24_hours',
  priorityLevel: 'low' | 'medium' | 'high'
) {
  return useQuery({
    queryKey: ['optimalTransactionTime', desiredTimeframe, priorityLevel],
    queryFn: () => predictOptimalTransactionTime(desiredTimeframe, priorityLevel),
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

export function useOptimalGasPrice(desiredConfirmationTimeMinutes: number) {
  return useQuery({
    queryKey: ['optimalGasPrice', desiredConfirmationTimeMinutes],
    queryFn: () => estimateOptimalGasPrice(desiredConfirmationTimeMinutes),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
} 