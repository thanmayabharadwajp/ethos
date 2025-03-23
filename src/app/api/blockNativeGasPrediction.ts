import axios from 'axios';

interface BlocknativeConfidenceLevel {
  confidence: number;
  baseFee: number;
  blobBaseFee: number;
}

interface BlockEstimate {
  [key: string]: BlocknativeConfidenceLevel[];
}

export interface BlocknativeGasEstimate {
  system: string;
  network: string;
  unit: string;
  currentBlockNumber: number;
  msSinceLastBlock: number;
  baseFeePerGas: number;
  blobBaseFeePerGas: number;
  estimatedBaseFees: {
    [key: string]: BlocknativeConfidenceLevel[];
  }[];
}

export interface BlockPrediction {
  blockNumber: string;
  baseFee: {
    high: number;  // 99% confidence
    medium: number; // 70% confidence
  };
  timeEstimate: string;
  _isFallback?: boolean; // Flag to indicate this is fallback data
}

// Function to fetch gas price estimates from Blocknative
export async function fetchBlocknativeGasPredictions(): Promise<BlockPrediction[]> {
  try {
    console.log('Starting fetchBlocknativeGasPredictions');
    // Retrieve API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_BLOCKNATIVE_API_KEY;
    
    console.log('Blocknative API Key available:', !!apiKey);
    
    if (!apiKey) {
      console.error('Blocknative API key is not configured');
      console.log('Falling back to generated predictions');
      return generateFallbackPredictions();
    }
    
    // Make request to Blocknative API
    console.log('Making request to Blocknative API');
    try {
      const response = await axios.get('https://api.blocknative.com/gasprices/basefee-estimates', {
        headers: {
          'X-Api-Key': apiKey
        }
      });
      
      console.log('Blocknative API response status:', response.status);
      
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      console.log('Processing Blocknative API response data');
      const data: BlocknativeGasEstimate = response.data;
      
      // Transform the data into our application format
      const predictions: BlockPrediction[] = [];
      
      // Current block info
      const currentBlock = data.currentBlockNumber;
      const timeSinceLastBlock = data.msSinceLastBlock;
      
      console.log('Current block:', currentBlock, 'Time since last block:', timeSinceLastBlock);
      
      // Process each block prediction
      if (!data.estimatedBaseFees || data.estimatedBaseFees.length === 0) {
        console.error('No estimated base fees in the API response');
        return generateFallbackPredictions();
      }
      
      // Log the full structure of estimatedBaseFees for debugging
      console.log('API response structure:', JSON.stringify(data.estimatedBaseFees));
      
      data.estimatedBaseFees.forEach((blockEstimate, index) => {
        // Get the block number label (e.g., "pending+1")
        const blockKey = Object.keys(blockEstimate)[0];
        const confidenceLevels = blockEstimate[blockKey];
        
        console.log(`Processing block ${index + 1}, key:`, blockKey);
        console.log('Confidence levels available:', confidenceLevels?.length || 0);
        
        if (confidenceLevels && confidenceLevels.length > 0) {
          console.log('Sample confidence level:', JSON.stringify(confidenceLevels[0]));
        }
        
        // Extract the number from "pending+X"
        const blockOffset = parseInt(blockKey.replace('pending+', ''));
        const predictedBlockNumber = `${currentBlock + blockOffset}`;
        
        // Estimate time - assuming average block time of 12 seconds
        const blockTimeMs = 12000; // 12 seconds in milliseconds
        const estimatedTimeMs = Date.now() + ((blockOffset * blockTimeMs) - timeSinceLastBlock);
        
        // Find the high confidence (99%) and medium confidence (70%) levels
        let highConfidence = confidenceLevels.find(level => level.confidence === 99);
        let mediumConfidence = confidenceLevels.find(level => level.confidence === 70);
        
        console.log('Raw high confidence:', highConfidence ? JSON.stringify(highConfidence) : 'not found');
        console.log('Raw medium confidence:', mediumConfidence ? JSON.stringify(mediumConfidence) : 'not found');
        
        // If we can't find the exact confidence levels, use alternatives or the first entries
        if (!highConfidence && confidenceLevels.length > 0) {
          // Try to get the highest confidence available
          confidenceLevels.sort((a, b) => b.confidence - a.confidence);
          highConfidence = confidenceLevels[0];
          console.log('Using alternative high confidence:', JSON.stringify(highConfidence));
        }
        
        if (!mediumConfidence && confidenceLevels.length > 1) {
          // Use the second highest confidence or just a slightly lower value
          mediumConfidence = confidenceLevels[1];
          console.log('Using alternative medium confidence:', JSON.stringify(mediumConfidence));
        } else if (!mediumConfidence && highConfidence) {
          // Create a fake medium confidence based on high confidence
          mediumConfidence = {
            ...highConfidence,
            confidence: 70,
            baseFee: highConfidence.baseFee * 0.9, // 10% lower than high
          };
          console.log('Using generated medium confidence:', JSON.stringify(mediumConfidence));
        }
        
        if (highConfidence && mediumConfidence) {
          predictions.push({
            blockNumber: predictedBlockNumber,
            baseFee: {
              high: highConfidence.baseFee,
              medium: mediumConfidence.baseFee
            },
            timeEstimate: new Date(estimatedTimeMs).toISOString()
          });
        } else {
          console.log('Could not create prediction for block - falling back to generated data');
          
          // Add a fallback prediction for this block
          const baseValue = data.baseFeePerGas || (30 + (Math.random() * 15));
          const blockFactor = 1 + (blockOffset * 0.02); // 2% increase per block
          
          predictions.push({
            blockNumber: predictedBlockNumber,
            baseFee: {
              high: Math.round(baseValue * blockFactor * 1.1 * 100) / 100,
              medium: Math.round(baseValue * blockFactor * 100) / 100
            },
            timeEstimate: new Date(estimatedTimeMs).toISOString(),
            _isFallback: true
          });
        }
      });
      
      console.log(`Finished processing API data, generated ${predictions.length} predictions`);
      return predictions;
    } catch (apiError) {
      console.error('API request error:', apiError);
      console.log('Falling back to generated predictions due to API error');
      return generateFallbackPredictions();
    }
  } catch (error) {
    console.error('Error fetching Blocknative gas predictions:', error);
    console.log('Falling back to generated predictions');
    return generateFallbackPredictions();
  }
}

// Function to generate fallback predictions when API is unavailable
function generateFallbackPredictions(): BlockPrediction[] {
  console.log('Generating fallback predictions');
  const predictions: BlockPrediction[] = [];
  const currentBlockNumber = Math.floor(Date.now() / 12000); // Rough estimate based on current time
  
  // Generate predictions for 5 blocks
  for (let i = 1; i <= 5; i++) {
    const blockNumber = currentBlockNumber + i;
    const baseTime = Date.now() + (i * 12000); // 12 seconds per block
    
    // Generate realistic baseFee values
    // Ethereum base fees typically range from 20-100 Gwei
    const baseValue = 30 + (Math.random() * 15); // Base value between 30-45 Gwei
    
    // Small increase for each subsequent block (simulating network activity)
    const blockFactor = 1 + (i * 0.02); // 2% increase per block
    
    // Add slight randomness for each confidence level
    const highConfidence = Math.round(baseValue * blockFactor * 1.1 * 100) / 100; // 10% higher for 99% confidence
    const mediumConfidence = Math.round(baseValue * blockFactor * 100) / 100;
    
    predictions.push({
      blockNumber: blockNumber.toString(),
      baseFee: {
        high: highConfidence,
        medium: mediumConfidence
      },
      timeEstimate: new Date(baseTime).toISOString(),
      _isFallback: true
    });
  }
  
  console.log(`Generated ${predictions.length} fallback predictions`);
  return predictions;
} 