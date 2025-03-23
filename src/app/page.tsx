'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CurrentGasInfo from './components/CurrentGasInfo';
import BlockGasPrediction from './components/BlockGasPrediction';
import SmartTransactionAnalyzer from './components/SmartTransactionAnalyzer';

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
              Ethereum Transaction Optimizer
            </h1>
            <p className="text-gray-600 md:w-2/3 lg:w-1/2 mx-auto text-lg">
              AI-powered tool to predict network congestion and recommend optimal transaction timing and parameters
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CurrentGasInfo />
              <BlockGasPrediction />
              <SmartTransactionAnalyzer />
            </div>
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">How It Works</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mr-3">
                      <span className="font-bold text-blue-600 w-5 h-5 flex items-center justify-center">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Real-Time Gas Monitoring</h3>
                      <p className="text-sm text-gray-600">Our system displays current Ethereum gas prices and analyzes network conditions to help you understand transaction costs.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mr-3">
                      <span className="font-bold text-blue-600 w-5 h-5 flex items-center justify-center">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Future Block Predictions</h3>
                      <p className="text-sm text-gray-600">Leveraging Blocknative's API, we predict gas prices for upcoming blocks with high and medium confidence levels.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mr-3">
                      <span className="font-bold text-blue-600 w-5 h-5 flex items-center justify-center">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Cost Analysis in ETH & USD</h3>
                      <p className="text-sm text-gray-600">We calculate transaction costs in both ETH and USD using real-time market rates to help you make informed decisions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mr-3">
                      <span className="font-bold text-blue-600 w-5 h-5 flex items-center justify-center">4</span>
                    </div>
                    <div>
                      <h3 className="font-medium">AI-Powered Recommendations</h3>
                      <p className="text-sm text-gray-600">Our OpenAI integration analyzes your transaction details and provides personalized timing and gas price recommendations.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">About This Project</h2>
                <p className="text-gray-600 mb-3">
                  This application uses AI to optimize Ethereum transactions by predicting network congestion and recommending optimal gas parameters.
                </p>
                <p className="text-gray-600 mb-3">
                  We provide real-time gas price data and block predictions to help you time your transactions efficiently, with potential savings calculated in both ETH and USD.
                </p>
                <p className="text-gray-600 mb-3">
                  Our smart analysis integrates with Blocknative's Gas Platform API for block predictions and OpenAI for personalized transaction recommendations based on current market conditions.
                </p>
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                  <a href="https://github.com/thanmayabharadwajp/ethos" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">GitHub</a>
                  <a href="https://docs.google.com/document/d/1MnO5Fzf2t_zKPM9GuOb0HkVvo28Yw6mKuw75ElXowYA/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">Documentation</a>
                </div>
              </div>
            </div>
          </div>
          
          <footer className="mt-12 text-center text-gray-600 text-sm py-4">
            <p>© 2025 Made with ❤️ by TechnoTubbies</p>
          </footer>
        </div>
      </main>
    </QueryClientProvider>
  );
}
