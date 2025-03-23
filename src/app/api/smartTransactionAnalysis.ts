import { fetchBlocknativeGasPredictions, BlockPrediction } from './blockNativeGasPrediction';
import OpenAI from 'openai';

// Replace fixed ETH-USD conversion with Etherscan API integration
const DEFAULT_ETH_USD_RATE = 3500; // Fallback rate if API call fails

/**
 * Fetch real-time ETH to USD price from Etherscan API
 */
async function fetchETHtoUSDPrice(): Promise<number> {
  try {
    const etherscanApiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    if (!etherscanApiKey) {
      console.warn('Etherscan API key not configured, using default ETH-USD rate');
      return DEFAULT_ETH_USD_RATE;
    }
    
    const response = await fetch(
      `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${etherscanApiKey}`
    );
    
    if (!response.ok) {
      console.error('Etherscan API call failed:', response.status);
      return DEFAULT_ETH_USD_RATE;
    }
    
    const data = await response.json();
    
    if (data.status === '1' && data.result && data.result.ethusd) {
      const ethUsdRate = parseFloat(data.result.ethusd);
      console.log(`Real-time ETH-USD rate: $${ethUsdRate}`);
      return ethUsdRate;
    } else {
      console.error('Invalid response from Etherscan API:', data);
      return DEFAULT_ETH_USD_RATE;
    }
  } catch (error) {
    console.error('Error fetching ETH-USD price:', error);
    return DEFAULT_ETH_USD_RATE;
  }
}

/**
 * Convert ETH amount to USD using real-time rate
 */
async function convertETHtoUSD(ethAmount: number): Promise<number> {
  const rate = await fetchETHtoUSDPrice();
  return ethAmount * rate;
}

// Interface for transaction data
export interface TransactionData {
  value: string; // in ETH
  gasLimit: number;
  isHighPriority: boolean;
  contractInteraction: boolean;
  description?: string;
}

// User transaction history
export interface TransactionHistory {
  pastTransactions: {
    timestamp: string;
    gasPrice: number;
    value: string;
    success: boolean;
  }[];
}

// Recommendation result
export interface TransactionRecommendation {
  immediateExecution: {
    gasPrice: number;
    estimatedFeeInETH: string;
    estimatedFeeInUSD: string;
    estimatedConfirmationTime: string;
    confidence: number;
  };
  optimalTiming: {
    waitTime: string;
    gasPrice: number;
    estimatedFeeInETH: string;
    estimatedFeeInUSD: string;
    estimatedConfirmationTime: string;
    potentialSavingsPercent: number;
    confidence: number;
  };
  aiAnalysis: {
    recommendation: string;
    rationale: string;
    savingsChart: {
      timeIntervals: string[];
      gasPrices: number[];
      savingsPercent: number[];
    };
  };
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY || '',
});

// Log if OpenAI API key is available
if (!process.env.OPEN_API_KEY) {
  console.warn('OpenAI API key not configured. AI analysis will use fallback responses.');
} else {
  console.log('OpenAI API key is configured.');
}

/**
 * Analyzes transaction data and provides smart recommendations
 */
export async function analyzeTransaction(
  transactionData: TransactionData,
  transactionHistory?: TransactionHistory
): Promise<TransactionRecommendation> {
  try {
    // 1. Get Blocknative predictions for upcoming blocks
    const blockPredictions = await fetchBlocknativeGasPredictions();
    
    if (!blockPredictions || blockPredictions.length === 0) {
      throw new Error('Failed to fetch gas predictions');
    }
    
    // 2. Calculate immediate execution recommendation
    const immediateGasPrice = blockPredictions[0].baseFee.medium;
    const immediateHighConfidence = blockPredictions[0].baseFee.high;
    const estimatedFeeInETH = calculateGasFee(transactionData.gasLimit, immediateGasPrice);
    const estimatedFeeInUSD = (await convertETHtoUSD(parseFloat(estimatedFeeInETH))).toFixed(2);
    
    // 3. Find optimal timing by analyzing future predictions
    const { optimalPrediction, optimalIndex, savingsPercent } = findOptimalTiming(
      blockPredictions,
      immediateGasPrice,
      transactionData.isHighPriority
    );
    
    // 4. Calculate wait time based on optimal block
    const waitTime = calculateWaitTime(optimalIndex);
    
    // 5. Generate savings chart data for different time intervals
    const savingsChart = generateSavingsChart(blockPredictions, immediateGasPrice, transactionData.gasLimit);
    
    // Calculate optimal fee in ETH and USD
    const optimalFeeInETH = calculateGasFee(transactionData.gasLimit, optimalPrediction.baseFee.medium);
    const optimalFeeInUSD = (await convertETHtoUSD(parseFloat(optimalFeeInETH))).toFixed(2);
    
    // Get current ETH-USD rate for logging
    const ethUsdRate = await fetchETHtoUSDPrice();
    
    // Log gas costs for monitoring
    console.log(`Current ETH-USD Rate: $${ethUsdRate}`);
    console.log(`Gas cost calculation: ${transactionData.gasLimit} gas * ${immediateGasPrice} Gwei = ${estimatedFeeInETH} ETH (${estimatedFeeInUSD} USD)`);
    console.log(`Optimal gas cost: ${transactionData.gasLimit} gas * ${optimalPrediction.baseFee.medium} Gwei = ${optimalFeeInETH} ETH (${optimalFeeInUSD} USD)`);
    
    // 6. Generate AI analysis based on all the data
    const aiAnalysis = await generateAIAnalysis(
      transactionData,
      transactionHistory,
      blockPredictions,
      immediateGasPrice,
      optimalPrediction,
      savingsPercent,
      waitTime,
      estimatedFeeInETH,
      estimatedFeeInUSD,
      optimalFeeInETH,
      optimalFeeInUSD
    );
    
    // 7. Construct and return the recommendation
    return {
      immediateExecution: {
        gasPrice: immediateGasPrice,
        estimatedFeeInETH: estimatedFeeInETH,
        estimatedFeeInUSD: estimatedFeeInUSD,
        estimatedConfirmationTime: "~12 seconds (next block)",
        confidence: 70, // Medium confidence level
      },
      optimalTiming: {
        waitTime: waitTime,
        gasPrice: optimalPrediction.baseFee.medium,
        estimatedFeeInETH: optimalFeeInETH,
        estimatedFeeInUSD: optimalFeeInUSD,
        estimatedConfirmationTime: `~${(optimalIndex + 1) * 12} seconds`,
        potentialSavingsPercent: savingsPercent,
        confidence: 70, // Medium confidence level
      },
      aiAnalysis: {
        recommendation: aiAnalysis.recommendation,
        rationale: aiAnalysis.rationale,
        savingsChart: savingsChart,
      },
    };
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    throw error;
  }
}

/**
 * Calculate gas fee in ETH
 */
function calculateGasFee(gasLimit: number, gasPriceGwei: number): string {
  // Convert gas price from Gwei to ETH: 1 Gwei = 10^-9 ETH
  const gasPriceETH = gasPriceGwei * 1e-9;
  const feeETH = gasLimit * gasPriceETH;
  return feeETH.toFixed(6);
}

/**
 * Find the optimal timing based on block predictions
 */
function findOptimalTiming(
  predictions: BlockPrediction[], 
  currentGasPrice: number,
  isHighPriority: boolean
): { 
  optimalPrediction: BlockPrediction, 
  optimalIndex: number,
  savingsPercent: number
} {
  // For high priority transactions, we might want to be more conservative
  if (isHighPriority) {
    return {
      optimalPrediction: predictions[0],
      optimalIndex: 0,
      savingsPercent: 0
    };
  }
  
  let lowestGasPrice = currentGasPrice;
  let optimalPrediction = predictions[0];
  let optimalIndex = 0;
  
  // Find the block with lowest gas price in the prediction window
  predictions.forEach((prediction, index) => {
    // Use medium confidence level for standard transactions
    const predictedGasPrice = prediction.baseFee.medium;
    
    if (predictedGasPrice < lowestGasPrice) {
      lowestGasPrice = predictedGasPrice;
      optimalPrediction = prediction;
      optimalIndex = index;
    }
  });
  
  // Calculate savings percentage
  const savingsPercent = ((currentGasPrice - lowestGasPrice) / currentGasPrice) * 100;
  
  return {
    optimalPrediction,
    optimalIndex,
    savingsPercent: parseFloat(savingsPercent.toFixed(2))
  };
}

/**
 * Calculate human-readable wait time
 */
function calculateWaitTime(blockIndex: number): string {
  const seconds = (blockIndex + 1) * 12; // Assuming 12 seconds per block
  
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Generate savings chart data for visualization
 */
function generateSavingsChart(
  predictions: BlockPrediction[],
  immediateGasPrice: number,
  gasLimit: number
): {
  timeIntervals: string[];
  gasPrices: number[];
  savingsPercent: number[];
} {
  const timeIntervals: string[] = [];
  const gasPrices: number[] = [];
  const savingsPercent: number[] = [];
  
  // Generate data for each prediction
  predictions.forEach((prediction, index) => {
    const blockTime = (index + 1) * 12; // seconds
    const gasPrice = prediction.baseFee.medium;
    const savingPct = ((immediateGasPrice - gasPrice) / immediateGasPrice) * 100;
    
    // Format time interval
    let timeLabel;
    if (blockTime < 60) {
      timeLabel = `${blockTime}s`;
    } else {
      const minutes = Math.floor(blockTime / 60);
      const seconds = blockTime % 60;
      timeLabel = `${minutes}m ${seconds}s`;
    }
    
    timeIntervals.push(timeLabel);
    gasPrices.push(parseFloat(gasPrice.toFixed(2)));
    savingsPercent.push(parseFloat(savingPct.toFixed(2)));
  });
  
  return {
    timeIntervals,
    gasPrices,
    savingsPercent,
  };
}

/**
 * Generate AI analysis using OpenAI API
 */
async function generateAIAnalysis(
  transactionData: TransactionData,
  transactionHistory: TransactionHistory | undefined,
  predictions: BlockPrediction[],
  immediateGasPrice: number,
  optimalPrediction: BlockPrediction,
  savingsPercent: number,
  waitTime: string,
  immediateETH: string,
  immediateUSD: string,
  optimalETH: string,
  optimalUSD: string
): Promise<{
  recommendation: string;
  rationale: string;
}> {
  try {
    console.log('Starting AI analysis generation');
    
    // Check if OpenAI API key is available
    const apiKey = process.env.OPEN_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.log('OpenAI API key not configured, using fallback response');
      return generateFallbackAnalysis(
        transactionData, 
        immediateGasPrice, 
        optimalPrediction.baseFee.medium, 
        savingsPercent, 
        waitTime,
        immediateETH,
        immediateUSD,
        optimalETH,
        optimalUSD
      );
    }
    
    console.log('OpenAI API key is configured, proceeding with API call');

    // Create a context for the AI analysis
    const context = {
      transaction: transactionData,
      history: transactionHistory,
      currentGasPrice: immediateGasPrice,
      optimalGasPrice: optimalPrediction.baseFee.medium,
      savingsPercent: savingsPercent,
      waitTime: waitTime,
      isHighPriority: transactionData.isHighPriority,
      predictions: predictions.map((p, i) => ({
        blockNumber: p.blockNumber,
        timeFromNow: `${(i + 1) * 12} seconds`,
        gasPrice: p.baseFee.medium,
        highConfidence: p.baseFee.high
      }))
    };
    
    // Generate analysis using OpenAI
    try {
      console.log('Calling OpenAI API');
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert Ethereum gas price analyst. You provide concise, helpful recommendations about when users should execute their Ethereum transactions based on gas price predictions. Focus on being practical, direct, and explaining your reasoning briefly.`
          },
          {
            role: "user",
            content: `Analyze this Ethereum transaction and gas price data and provide a recommendation on whether the user should execute immediately or wait. Include a brief rationale for your recommendation.
            
            Transaction: ${JSON.stringify(transactionData)}
            Current Gas Price: ${immediateGasPrice} Gwei
            Current Gas Cost: ${immediateETH} ETH (${immediateUSD} USD)
            Optimal Future Gas Price: ${optimalPrediction.baseFee.medium} Gwei in ${waitTime}
            Optimal Gas Cost: ${optimalETH} ETH (${optimalUSD} USD)
            Potential Savings: ${savingsPercent.toFixed(2)}%
            Is High Priority: ${transactionData.isHighPriority}
            
            Future Predictions: ${JSON.stringify(predictions.map((p, i) => ({
              timeFromNow: `${(i + 1) * 12} seconds`,
              gasPrice: p.baseFee.medium
            })))}
            
            Return your analysis as JSON with two fields: 
            - recommendation: A single sentence recommendation (max 150 chars)
            - rationale: Brief explanation of your reasoning (max 250 chars)`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 500
      });
      
      console.log('OpenAI API response received');
      
      // Parse the AI response
      const analysisText = completion.choices[0]?.message?.content;
      if (!analysisText) {
        console.log('No content in OpenAI response, using fallback');
        return generateFallbackAnalysis(
          transactionData, 
          immediateGasPrice, 
          optimalPrediction.baseFee.medium, 
          savingsPercent, 
          waitTime,
          immediateETH,
          immediateUSD,
          optimalETH,
          optimalUSD
        );
      }
      
      try {
        const analysis = JSON.parse(analysisText);
        console.log('Successfully parsed OpenAI response');
        return {
          recommendation: analysis.recommendation,
          rationale: analysis.rationale
        };
      } catch (parseError) {
        console.error('Error parsing OpenAI JSON response:', parseError);
        console.log('Raw response:', analysisText);
        return generateFallbackAnalysis(
          transactionData, 
          immediateGasPrice, 
          optimalPrediction.baseFee.medium, 
          savingsPercent, 
          waitTime,
          immediateETH,
          immediateUSD,
          optimalETH,
          optimalUSD
        );
      }
    } catch (apiError: any) {
      console.error('OpenAI API call failed:', apiError.message);
      console.error('Error details:', apiError);
      return generateFallbackAnalysis(
        transactionData, 
        immediateGasPrice, 
        optimalPrediction.baseFee.medium, 
        savingsPercent, 
        waitTime,
        immediateETH,
        immediateUSD,
        optimalETH,
        optimalUSD
      );
    }
  } catch (error) {
    console.error('Error in generateAIAnalysis:', error);
    return generateFallbackAnalysis(
      transactionData, 
      immediateGasPrice, 
      optimalPrediction.baseFee.medium, 
      savingsPercent, 
      waitTime,
      immediateETH,
      immediateUSD,
      optimalETH,
      optimalUSD
    );
  }
}

/**
 * Generate fallback analysis when OpenAI is unavailable
 */
function generateFallbackAnalysis(
  transactionData: TransactionData,
  currentGasPrice: number,
  optimalGasPrice: number,
  savingsPercent: number,
  waitTime: string,
  immediateETH: string,
  immediateUSD: string,
  optimalETH: string,
  optimalUSD: string
): {
  recommendation: string;
  rationale: string;
} {
  // Generate a simple rule-based recommendation
  if (transactionData.isHighPriority) {
    return {
      recommendation: "Execute this high-priority transaction immediately.",
      rationale: `High priority transaction should be executed promptly at current gas cost of ${immediateETH} ETH ($${immediateUSD}), regardless of small potential gas savings.`
    };
  }
  
  // For regular transactions, base it on potential savings
  if (savingsPercent > 10) {
    const ethSavings = (parseFloat(immediateETH) - parseFloat(optimalETH)).toFixed(6);
    const usdSavings = (parseFloat(immediateUSD) - parseFloat(optimalUSD)).toFixed(2);
    
    return {
      recommendation: `Wait ${waitTime} for optimal gas price.`,
      rationale: `Waiting ${waitTime} saves ${savingsPercent.toFixed(1)}% (${ethSavings} ETH / $${usdSavings}) in gas fees (${currentGasPrice.toFixed(2)} → ${optimalGasPrice.toFixed(2)} Gwei), which is significant enough to justify the delay.`
    };
  } else if (savingsPercent > 5) {
    return {
      recommendation: `Consider waiting ${waitTime} if not time-sensitive.`,
      rationale: `A moderate ${savingsPercent.toFixed(1)}% gas savings possible by waiting. Current cost: ${immediateETH} ETH ($${immediateUSD}), Optimal cost: ${optimalETH} ETH ($${optimalUSD}).`
    };
  } else {
    return {
      recommendation: "Execute at current gas price.",
      rationale: `The potential savings of ${savingsPercent.toFixed(1)}% (current: ${immediateETH} ETH / $${immediateUSD}) are minimal and may not justify the ${waitTime} wait time.`
    };
  }
} 