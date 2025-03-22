import axios from 'axios';

interface GasData {
  low: number;
  average: number;
  high: number;
  timestamp: string;
}

interface PredictionResult {
  bestTimeToTransact: string;
  predictedGasPrice: number;
  confidenceScore: number;
  congestionLevel: number;
}

// In a real app, you'd connect to a backend that uses ML models
// For MVP, we'll use a simplified approach with some randomization to simulate AI predictions

// Get historical gas data from Etherscan
export async function getHistoricalGasData(): Promise<GasData[]> {
  try {
    // Check if we have an Etherscan API key in env variables
    const etherscanApiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    
    if (etherscanApiKey) {
      // Use real Etherscan data if API key is available
      const response = await axios.get(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${etherscanApiKey}`
      );
      
      if (response.data.status === '1') {
        // Etherscan only provides current gas prices, not historical
        // For a production app, you'd need to store this data over time
        // or use a paid API service that provides historical data
        const current = response.data.result;
        const now = new Date().toISOString();
        
        // Since we only have current data from the free API, we'll create synthetic historical data
        // based on the current values with some variation to show trends
        return generateSyntheticHistoricalData(
          parseInt(current.SafeGasPrice), 
          parseInt(current.ProposeGasPrice), 
          parseInt(current.FastGasPrice)
        );
      }
    }
    
    // Fallback to synthetic data if API key is not available or request fails
    return generateSyntheticHistoricalData();
  } catch (error) {
    console.error('Error fetching historical gas data:', error);
    return generateSyntheticHistoricalData();
  }
}

// Helper function to generate synthetic historical data
function generateSyntheticHistoricalData(
  currentLow = 30, 
  currentAverage = 50, 
  currentHigh = 100
): GasData[] {
  const data: GasData[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - i * 3600 * 1000).toISOString();
    const timeOfDay = new Date(timestamp).getHours();
    let baseFactor = 1;
    
    // Simulate higher gas during business hours
    if (timeOfDay >= 9 && timeOfDay <= 17) {
      baseFactor = 1.5;
    }
    
    // Create some variation around the current values
    const variationFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    
    data.push({
      low: Math.round(currentLow * baseFactor * variationFactor),
      average: Math.round(currentAverage * baseFactor * variationFactor),
      high: Math.round(currentHigh * baseFactor * variationFactor),
      timestamp
    });
  }
  
  return data.reverse(); // Most recent first
}

export async function predictOptimalTransactionTime(
  desiredTimeframe: 'next_hour' | 'today' | 'next_24_hours',
  priorityLevel: 'low' | 'medium' | 'high'
): Promise<PredictionResult> {
  try {
    // This would call an AI model in production
    // For MVP, we'll simulate the prediction
    
    // Get current hour
    const currentHour = new Date().getHours();
    let bestHour = currentHour;
    
    // Different logic based on timeframe
    if (desiredTimeframe === 'next_hour') {
      // Simulating prediction for next hour
      bestHour = currentHour;
    } else if (desiredTimeframe === 'today') {
      // Simulating finding lowest gas hour in the next 12 hours
      // Simple model: night times have lower gas prices
      if (currentHour >= 9 && currentHour < 20) {
        bestHour = 22; // Late night
      } else if (currentHour >= 20) {
        bestHour = 2; // Early morning
      } else {
        bestHour = currentHour; // Already in a good time
      }
    } else {
      // For next 24 hours
      // Choosing hours with typically lower gas prices
      bestHour = (currentHour < 3) ? currentHour : 2; // 2 AM typically low
    }
    
    // Format hour for display
    const bestTime = `${bestHour.toString().padStart(2, '0')}:00`;
    
    // Calculate predicted gas price based on priority
    let baseGasPrice = 30; // Gwei
    let confidenceLevel = 0.8;
    let congestionLevel = 40;
    
    switch (priorityLevel) {
      case 'high':
        baseGasPrice = 80;
        confidenceLevel = 0.95;
        congestionLevel = 75;
        break;
      case 'medium':
        baseGasPrice = 50;
        confidenceLevel = 0.85;
        congestionLevel = 60;
        break;
      default:
        baseGasPrice = 30;
        confidenceLevel = 0.75;
        congestionLevel = 40;
    }
    
    // Adjust for predicted time of day
    if (bestHour >= 9 && bestHour <= 17) {
      // Business hours - higher gas
      baseGasPrice *= 1.3;
      congestionLevel *= 1.2;
    } else if (bestHour >= 1 && bestHour <= 5) {
      // Very early morning - lowest gas
      baseGasPrice *= 0.7;
      congestionLevel *= 0.5;
    }
    
    return {
      bestTimeToTransact: bestTime,
      predictedGasPrice: Math.round(baseGasPrice),
      confidenceScore: Math.min(0.99, confidenceLevel),
      congestionLevel: Math.min(100, congestionLevel)
    };
  } catch (error) {
    console.error('Error predicting optimal transaction time:', error);
    throw error;
  }
} 