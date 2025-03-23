import { NextRequest, NextResponse } from 'next/server';
import { analyzeTransaction, TransactionData, TransactionHistory } from '../smartTransactionAnalysis';

export async function POST(request: NextRequest) {
  console.log('Smart Analysis API route called');
  
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body format' },
        { status: 400 }
      );
    }
    
    const { transactionData, transactionHistory } = body;
    console.log('Transaction data received:', JSON.stringify(transactionData));

    // Validate input data
    if (!transactionData) {
      console.error('Missing transaction data');
      return NextResponse.json(
        { error: 'Missing transaction data' },
        { status: 400 }
      );
    }
    
    if (!transactionData.gasLimit) {
      console.error('Missing required gasLimit in transaction data');
      return NextResponse.json(
        { error: 'Missing required gasLimit in transaction data' },
        { status: 400 }
      );
    }

    console.log('Input validation passed, calling analyzeTransaction...');
    
    // Analyze transaction
    try {
      const analysis = await analyzeTransaction(
        transactionData as TransactionData,
        transactionHistory as TransactionHistory | undefined
      );
      
      console.log('Transaction analysis completed successfully');
      
      // Validate result is valid JSON
      try {
        // Test serialization
        JSON.stringify(analysis);
        
        // Return analysis result
        return NextResponse.json(analysis);
      } catch (serializationError) {
        console.error('Error serializing analysis result:', serializationError);
        return NextResponse.json(
          { error: 'Error serializing analysis result' },
          { status: 500 }
        );
      }
    } catch (analysisError: any) {
      console.error('Error during transaction analysis:', analysisError);
      return NextResponse.json(
        { 
          error: analysisError.message || 'Error analyzing transaction',
          details: process.env.NODE_ENV === 'development' ? String(analysisError.stack) : undefined 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unhandled API route error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? String(error.stack) : undefined
      },
      { status: 500 }
    );
  }
} 