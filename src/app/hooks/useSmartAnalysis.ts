import { useQuery, useMutation } from '@tanstack/react-query';
import { TransactionData, TransactionHistory, TransactionRecommendation } from '../api/smartTransactionAnalysis';

/**
 * Hook to get smart transaction analysis recommendations
 */
export function useSmartTransactionAnalysis(
  transactionData: TransactionData,
  transactionHistory?: TransactionHistory,
  enabled = true
) {
  return useQuery({
    queryKey: ['smartAnalysis', transactionData, transactionHistory],
    queryFn: async (): Promise<TransactionRecommendation> => {
      console.log('Making API request to /api/smartAnalysis');
      try {
        const response = await fetch('/api/smartAnalysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionData,
            transactionHistory,
          }),
        });

        console.log('API response status:', response.status);
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
            console.error('API error response:', errorData);
          } catch (e) {
            console.error('Could not parse error response:', e);
            errorData = { error: 'Unknown error' };
          }
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        try {
          const data = await response.json();
          console.log('API request successful');
          return data;
        } catch (e) {
          console.error('Could not parse success response:', e);
          throw new Error('Invalid JSON response from API');
        }
      } catch (error) {
        console.error('Error in smartAnalysis API call:', error);
        throw error;
      }
    },
    enabled: enabled && !!transactionData,
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2,
  });
}

/**
 * Mutation hook for one-off analysis requests
 */
export function useSmartTransactionAnalysisMutation() {
  return useMutation({
    mutationFn: async ({
      transactionData,
      transactionHistory,
    }: {
      transactionData: TransactionData;
      transactionHistory?: TransactionHistory;
    }): Promise<TransactionRecommendation> => {
      console.log('Making mutation API request to /api/smartAnalysis');
      try {
        const response = await fetch('/api/smartAnalysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionData,
            transactionHistory,
          }),
        });

        console.log('Mutation API response status:', response.status);
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
            console.error('Mutation API error response:', errorData);
          } catch (e) {
            console.error('Could not parse error response:', e);
            errorData = { error: 'Unknown error' };
          }
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        try {
          const data = await response.json();
          console.log('Mutation API request successful');
          return data;
        } catch (e) {
          console.error('Could not parse success response:', e);
          throw new Error('Invalid JSON response from API');
        }
      } catch (error) {
        console.error('Error in smartAnalysis mutation API call:', error);
        throw error;
      }
    },
  });
} 