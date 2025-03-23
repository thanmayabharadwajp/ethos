'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CurrentGasInfo from './components/CurrentGasInfo';
import TransactionOptimizer from './components/TransactionOptimizer';
import GasPriceHistory from './components/GasPriceHistory';
import BlockGasPrediction from './components/BlockGasPrediction';

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
              <TransactionOptimizer />
              <GasPriceHistory />
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
                      <h3 className="font-medium">Data Collection</h3>
                      <p className="text-sm text-gray-600">Our system continuously monitors Ethereum network metrics including gas prices, pending transactions, and block times.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mr-3">
                      <span className="font-bold text-blue-600 w-5 h-5 flex items-center justify-center">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Blocknative Integration</h3>
                      <p className="text-sm text-gray-600">We use Blocknative's gas prediction API to provide accurate gas price forecasts for upcoming blocks.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 mr-3">
                      <span className="font-bold text-blue-600 w-5 h-5 flex items-center justify-center">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Smart Recommendations</h3>
                      <p className="text-sm text-gray-600">Get personalized guidance on when to transact and what gas price to use based on your specific needs.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">About This Project</h2>
                <p className="text-gray-600 mb-3">
                  This MVP was built to demonstrate how AI can optimize Ethereum transactions by predicting network congestion and recommending optimal parameters.
                </p>
                <p className="text-gray-600 mb-3">
                  Our AI model uses Gaussian Process regression to predict gas prices with confidence intervals, providing more accurate forecasts for upcoming blocks.
                </p>
                <p className="text-gray-600 mb-3">
                  We also integrate with Blocknative's Gas Platform API to provide accurate block-by-block gas predictions for upcoming Ethereum blocks.
                </p>
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                  <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">GitHub</a>
                  <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">Documentation</a>
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
