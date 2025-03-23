import { ethers } from 'ethers';

// Function to get current gas price from Ethereum
export async function getCurrentGasPrice(): Promise<ethers.BigNumberish> {
  try {
    // Connect to Ethereum network using Infura with API key from env
    const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`);
    
    // Get current gas price
    const gasPrice = await provider.getFeeData();
    return gasPrice.gasPrice || 0;
  } catch (error) {
    console.error('Error fetching gas price:', error);
    throw error;
  }
}

// Function to get network congestion based on pending transactions
export async function getNetworkCongestion(): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`);
    
    // Infura doesn't support txpool_status, so we'll use a different approach:
    // 1. Get current gas price as an indicator of network congestion
    const feeData = await provider.getFeeData();
    
    // 2. Get recent block info to estimate network activity
    const latestBlock = await provider.getBlock('latest');
    const gasUsed = latestBlock?.gasUsed || BigInt(0);
    const gasLimit = latestBlock?.gasLimit || BigInt(15000000); // Default mainnet gas limit
    
    // 3. Calculate utilization percentage (0-100)
    const utilization = Number((gasUsed * BigInt(100)) / gasLimit);
    
    // 4. Factor in gas prices (higher gas = more congestion)
    // Convert gas price to Gwei for easier math
    const gasPriceGwei = Number(feeData.gasPrice || BigInt(0)) / 1e9;
    
    // Calculate congestion based on gas price:
    // - <20 Gwei: Low congestion
    // - 20-50 Gwei: Moderate congestion
    // - 50-100 Gwei: High congestion
    // - >100 Gwei: Very high congestion
    let gasPriceFactor = 0;
    if (gasPriceGwei < 20) {
      gasPriceFactor = gasPriceGwei * 1.5; // 0-30 scale
    } else if (gasPriceGwei < 50) {
      gasPriceFactor = 30 + (gasPriceGwei - 20) * 1; // 30-60 scale
    } else if (gasPriceGwei < 100) {
      gasPriceFactor = 60 + (gasPriceGwei - 50) * 0.5; // 60-85 scale
    } else {
      gasPriceFactor = 85 + Math.min(15, (gasPriceGwei - 100) * 0.1); // 85-100 scale
    }
    
    // Combine utilization and gas price factors (weighted)
    const congestionLevel = Math.min(100, Math.max(0, 
      utilization * 0.3 + gasPriceFactor * 0.7
    ));
    
    return congestionLevel;
  } catch (error) {
    console.error('Error fetching network congestion:', error);
    // Return moderate congestion as fallback
    return 50;
  }
}

// Function to estimate optimal gas price based on desired confirmation time
export async function estimateOptimalGasPrice(desiredConfirmationTimeMinutes: number): Promise<{
  gasPrice: ethers.BigNumberish,
  estimatedTimeMinutes: number
}> {
  try {
    const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`);
    const feeData = await provider.getFeeData();
    
    // Get current gas prices at different priority levels
    const lowPriorityGas = feeData.gasPrice || 0;
    const mediumPriorityGas = feeData.maxFeePerGas || lowPriorityGas;
    const highPriorityGas = feeData.maxPriorityFeePerGas 
      ? BigInt(feeData.maxPriorityFeePerGas) * BigInt(2) 
      : BigInt(lowPriorityGas) * BigInt(15) / BigInt(10);
    
    // Based on desired confirmation time, suggest gas price
    let gasPrice: ethers.BigNumberish;
    let estimatedTimeMinutes: number;
    
    if (desiredConfirmationTimeMinutes <= 1) {
      // Need very fast confirmation (< 1 min)
      gasPrice = highPriorityGas;
      estimatedTimeMinutes = 0.5;
    } else if (desiredConfirmationTimeMinutes <= 5) {
      // Need medium speed (< 5 min)
      gasPrice = mediumPriorityGas;
      estimatedTimeMinutes = 2;
    } else {
      // Can wait longer (> 5 min)
      gasPrice = lowPriorityGas;
      estimatedTimeMinutes = 7;
    }
    
    return { gasPrice, estimatedTimeMinutes };
  } catch (error) {
    console.error('Error estimating optimal gas price:', error);
    throw error;
  }
}

// Helper to convert gas price to human readable format in Gwei
export function formatGasPrice(gasPrice: ethers.BigNumberish): string {
  const gasPriceBigInt = BigInt(gasPrice.toString());
  const gweiValue = Number(gasPriceBigInt) / 1e9;
  return `${gweiValue.toFixed(2)} Gwei`;
} 