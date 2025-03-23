# Ethereum Transaction Optimizer
[Slide Deck:](https://www.canva.com/design/DAGicYmWQWs/QXDoWqrnQrMxNwT9XZKFLg/edit?utm_content=DAGicYmWQWs&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)
[Documentation:](https://docs.google.com/document/d/1MnO5Fzf2t_zKPM9GuOb0HkVvo28Yw6mKuw75ElXowYA/edit?usp=sharing)
An AI-powered tool to predict Ethereum network congestion and recommend optimal transaction timing and parameters.

## 🚀 Overview

This hackathon project demonstrates how AI can be used to optimize Ethereum transactions by:

- Monitoring real-time gas prices and network congestion
- Predicting future congestion patterns using AI models
- Recommending optimal transaction times and gas prices
- Analyzing historical gas data to identify patterns
- Providing personalized transaction recommendations with OpenAI

## ✨ Features

- **Current Network Status**: Real-time gas prices and network congestion levels
- **AI-Powered Transaction Optimization**: Get personalized recommendations for transaction timing and gas prices
- **Congestion Forecast**: Visualize predicted network congestion for the next 24 hours
- **Real-time Gas Price Chart**: Live Etherscan API integration with auto-refresh capabilities
- **Historical Gas Analysis**: Track gas price trends with AI-generated insights
- **Smart Transaction Analysis**: OpenAI-powered transaction analysis that recommends optimal timing and calculates potential savings
- **Savings Visualization**: Interactive charts showing potential savings from waiting for lower gas prices

## 🔧 Technical Implementation

This project can connect to real Ethereum network data or simulate predictions using synthetic data. For full functionality with real-time Ethereum data, it integrates with:

- Ethereum blockchain via Infura API
- Gas price data via Etherscan API
- Block-based gas predictions via Blocknative API
- Natural language recommendations via OpenAI API
- Pattern detection algorithms for price prediction
- Time-based congestion forecast models

## 📋 Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Data Visualization**: Recharts for interactive charts
- **Ethereum Interaction**: ethers.js for blockchain connectivity
- **State Management**: React Query for data fetching and caching
- **AI Integration**: OpenAI API for personalized recommendations and analysis

## 🛠️ Setup & Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ethereum-transaction-optimizer.git
cd ethereum-transaction-optimizer
```

2. Install dependencies:
```bash
npm install
```

3. Set up your API keys:
   - Sign up for an Infura account at https://infura.io/ and create a new project to get an API key
   - Sign up for an Etherscan account at https://etherscan.io/apis and create a new API key
   - Sign up for a Blocknative account at https://www.blocknative.com/ and get an API key
   - Sign up for an OpenAI account at https://platform.openai.com/ and create an API key

4. Create a `.env.local` file and add your API keys:
```
NEXT_PUBLIC_INFURA_API_KEY=your_infura_key
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_key
NEXT_PUBLIC_BLOCKNATIVE_API_KEY=your_blocknative_key
OPENAI_API_KEY=your_openai_key
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Smart Transaction Analysis with OpenAI

The Smart Transaction Analyzer component uses OpenAI to provide intelligent recommendations:

- **Personalized Analysis**: Analyzes transaction details to provide tailored recommendations
- **Wait vs. Execute**: Comparison of executing immediately vs. waiting for better gas prices
- **Potential Savings Calculation**: Shows how much you could save by waiting
- **Visual Savings Chart**: Interactive chart showing potential savings over time
- **Natural Language Recommendations**: Easy-to-understand explanations of complex gas data

To use this feature, ensure you have added your OpenAI API key to the `.env.local` file:

```
OPENAI_API_KEY=your_openai_key
```

Note that OpenAI API usage incurs costs based on your usage. The application uses the GPT-4o model which is optimized for this type of analysis.

### Real-time Gas Price Chart

The Gas Price History component features real-time data integration with Etherscan:

- **Live API Connection**: Fetches current gas prices directly from Etherscan
- **Auto-refresh Capability**: Configurable refresh intervals (10s, 30s, 1m, 5m)
- **Manual Refresh**: Force refresh data at any time with a single click
- **Connection Status**: Visual indicators for API connection status
- **API Error Handling**: Graceful fallback to synthetic data if API limits are reached

To use this feature, ensure you have added your Etherscan API key to the `.env.local` file:

```
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_key
```

The free Etherscan API has rate limits (currently 5 calls per second, up to 100,000 calls per day). The application respects these limits through reasonable refresh intervals and fallback mechanisms.

### Block-based Gas Predictions with Blocknative

The Block Gas Prediction component uses Blocknative's API to provide accurate predictions:

- **Next 5 Blocks Forecast**: Shows predicted gas prices for upcoming Ethereum blocks
- **Confidence Levels**: Both high (99%) and medium (70%) confidence predictions
- **Visual Block Timeline**: Easy-to-understand visualization of future gas prices
- **Automatic Updates**: Refreshes when new blocks are mined

To use this feature, ensure you have added your Blocknative API key to the `.env.local` file:

```
NEXT_PUBLIC_BLOCKNATIVE_API_KEY=your_blocknative_key
```

### Note on API Usage

- Without API keys, the app will fall back to synthetic data to demonstrate functionality
- With valid API keys, you'll get real-time data and intelligent recommendations:
  - Infura API: Real-time Ethereum network data
  - Etherscan API: Real current gas price data
  - Blocknative API: Accurate block-by-block gas predictions
  - OpenAI API: Personalized transaction recommendations and savings analysis

## 📈 Future Enhancements

For a production version, we would implement:

- **Real AI/ML Backend**: Train models on historical Ethereum data
- **Historical Data Storage**: Store gas price data over time for better predictions
- **User Accounts**: Save preferences and transaction history
- **Transaction Execution**: Allow users to directly execute transactions at optimal times
- **Multi-Chain Support**: Extend to other EVM-compatible blockchains
- **Mobile App**: Native mobile experience with push notifications for optimal transaction windows
- **Advanced AI Features**: Even more sophisticated analysis and predictions leveraging larger context windows

## 👥 Contribution

This is a hackathon project, but contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

MIT License - see LICENSE file for details.

---

Built for the 2024 Ethereum Hackathon. This is a Minimum Viable Product designed to demonstrate the concept of AI-optimized Ethereum transactions.
