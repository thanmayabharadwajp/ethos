'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CurrentGasInfo from './components/CurrentGasInfo';
import CongestionForecast from './components/CongestionForecast';
import TransactionOptimizer from './components/TransactionOptimizer';
import GasPriceHistory from './components/GasPriceHistory';

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
              Ethereum Transaction Optimizer
            </h1>
            <p className="text-gray-600 md:w-3/4 mx-auto">
              AI-powered tool to predict network congestion and recommend optimal transaction timing and parameters on Ethereum
            </p>
          </header>

          <div className="md:flex md:gap-6">
            <div className="md:w-2/3">
              <CurrentGasInfo />
              <TransactionOptimizer />
              <GasPriceHistory />
            </div>
            <div className="md:w-1/3">
              <CongestionForecast />
              <div className="bg-white shadow rounded-lg p-4 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">How It Works</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <span className="font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Data Collection</h3>
                      <p className="text-sm text-gray-600">Our system continuously monitors Ethereum network metrics including gas prices, pending transactions, and block times.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <span className="font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">AI Analysis</h3>
                      <p className="text-sm text-gray-600">Advanced machine learning models analyze historical patterns to predict future congestion and optimal transaction parameters.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <span className="font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Smart Recommendations</h3>
                      <p className="text-sm text-gray-600">Get personalized guidance on when to transact and what gas price to use based on your specific needs.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg p-4 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">About This Project</h2>
                <p className="text-gray-600 mb-3">
                  This MVP was built for a hackathon to demonstrate how AI can optimize Ethereum transactions by predicting network congestion and recommending optimal parameters.
                </p>
                <p className="text-gray-600 mb-3">
                  In a production version, this would connect to a proper AI/ML backend trained on historical data from the Ethereum network.
                </p>
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                  <a href="#" className="text-black hover:underline">GitHub</a>
                  <a href="#" className="text-black hover:underline">Documentation</a>
                </div>
              </div>
            </div>
          </div>
          
          <footer className="mt-12 text-center text-black text-sm">
            <p> © 2025 Made with ❤️ by TechnoTubbies</p>
          </footer>
        </div>
      </main>
    </QueryClientProvider>
  );
}
