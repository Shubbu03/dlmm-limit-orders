# DLMM Limit Orders - Solana Trading Platform

A modern, production-ready trading platform built on Solana that enables users to place limit orders and stop-loss orders using the Dynamic Liquidity Market Maker (DLMM) protocol. This project integrates with the Saros Finance DLMM SDK to provide advanced trading capabilities on the Solana blockchain.

## 🚀 Features

### Core Trading Features
- **Limit Orders**: Set target prices for buying or selling tokens
- **Stop-Loss Orders**: Automatically execute trades when price reaches trigger levels
- **Real-time Price Monitoring**: Live price feeds from Pyth Network and CoinGecko
- **Order Management**: View, cancel, and re-run existing orders
- **Multi-Token Support**: Trade various Solana token pairs (SOL/USDC, etc.)

### User Experience
- **Modern UI**: Beautiful, responsive design with gradient animations
- **Wallet Integration**: Seamless Solana wallet connection
- **Smart Navigation**: Intuitive routing with breadcrumbs and back buttons
- **Real-time Updates**: Live price charts and order status updates
- **Mobile Responsive**: Optimized for all device sizes

### Technical Features
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Fully typed codebase for better development experience
- **Tailwind CSS**: Modern styling with custom animations
- **Local Storage**: Client-side order persistence
- **Error Handling**: Comprehensive error management and user feedback

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React hooks and context
- **Wallet Integration**: Solana Wallet Adapter

### Blockchain Integration
- **Protocol**: Saros Finance DLMM SDK
- **Network**: Solana Devnet (configurable)
- **Price Feeds**: Pyth Network + CoinGecko fallback
- **Wallet Support**: All Solana wallet adapters

## 🔧 Saros DLMM Integration

### SDK Implementation

This project leverages the `@saros-finance/dlmm-sdk` package to interact with the Dynamic Liquidity Market Maker protocol. Here's how we implemented it:

#### 1. DLMM Service Initialization
```typescript
// lib/dlmm.ts
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

export const dlmm = new LiquidityBookServices({
    mode: MODE.DEVNET,
    options: {
        rpcUrl: process.env.NEXT_PUBLIC_RPC_ENDPOINT!,
        commitmentOrConfig: "confirmed"
    }
});
```

#### 2. Pool Information Retrieval
```typescript
// lib/dlmmClient.ts
export async function getPoolInfo(poolAddress: string) {
    const poolPubkey = new PublicKey(poolAddress);
    const poolInfo = await dlmm.getPoolInfo(poolPubkey);
    return poolInfo;
}
```

#### 3. Order Placement
```typescript
// lib/dlmmClient.ts
export async function placeLimitOrderWithDLMM(params: {
    poolAddress: string;
    side: 'buy' | 'sell';
    price: number;
    size: number;
    userPublicKey: PublicKey;
}) {
    // Convert price to bin index
    const binIndex = await getBinForPrice(pair, price, poolAddress);
    
    // Place order using DLMM SDK
    const result = await dlmm.placeLimitOrder({
        poolAddress: new PublicKey(poolAddress),
        side: params.side,
        binIndex,
        size: params.size,
        userPublicKey: params.userPublicKey
    });
    
    return result;
}
```

#### 4. Position Management
```typescript
// lib/dlmm.ts
export async function closePosition({
    wallet,
    positionId,
    pairAddress
}: {
    wallet: Wallet;
    positionId: string;
    pairAddress: string;
}) {
    const poolPubkey = new PublicKey(pairAddress);
    const positionPubkey = new PublicKey(positionId);
    
    const result = await dlmm.closePosition({
        poolAddress: poolPubkey,
        positionId: positionPubkey,
        userPublicKey: wallet.adapter.publicKey
    });
    
    return result;
}
```

### Key DLMM Concepts Implemented

1. **Bin Mapping**: Converting target prices to DLMM liquidity bin indices
2. **Pool Information**: Retrieving real-time pool data and liquidity
3. **Position Tracking**: Managing user positions and order states
4. **Price Calculation**: Converting between bin indices and actual prices

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- Bun (recommended) or npm
- Solana wallet (Phantom, Solflare, etc.)

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PYTH_PRICE_SERVICE_URL=https://hermes.pyth.network/v2/updates/price/latest
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd dlmm-limit-orders

# Install dependencies
bun install
# or
npm install

# Start development server
bun dev
# or
npm run dev
```

## 📁 Project Structure

```
dlmm-limit-orders/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage with trading overview
│   ├── limit-order/             # Limit order creation page
│   ├── stop-loss/               # Stop-loss order creation page
│   ├── orders/                  # Order management pages
│   │   ├── page.tsx            # Orders list and management
│   │   └── new/                # Order type selection
│   └── globals.css             # Global styles and animations
├── components/                   # Reusable UI components
│   ├── layout/                 # Layout components
│   │   ├── Navbar.tsx         # Main navigation
│   │   ├── PageLayout.tsx     # Page wrapper with breadcrumbs
│   │   └── Breadcrumb.tsx     # Navigation breadcrumbs
│   ├── orders/                 # Order-related components
│   │   ├── OrderForm.tsx      # Reusable order form
│   │   ├── OrderList.tsx      # Order display and management
│   │   ├── PriceChart.tsx     # Price visualization
│   │   ├── PriceMonitor.tsx   # Live price monitoring
│   │   └── StopLossMonitor.tsx # Stop-loss monitoring
│   └── wallet/                 # Wallet integration
│       └── WalletProvider.tsx # Wallet context provider
├── lib/                        # Core business logic
│   ├── dlmm.ts                # DLMM SDK integration
│   ├── dlmmClient.ts          # DLMM client wrapper
│   ├── orders.ts              # Order types and storage
│   ├── price.ts               # Price feed integration
│   ├── connection.ts          # Solana connection setup
│   └── walletProvider.ts      # Wallet provider utilities
└── scripts/                    # Background scripts
    └── monitor.ts             # Stop-loss monitoring script
```

## 🔧 Key Components

### Order Management System
- **Order Types**: Limit orders and stop-loss orders
- **Storage**: Client-side persistence using localStorage
- **Status Tracking**: Pending, filled, canceled, executed states
- **Real-time Updates**: Live price monitoring and order execution

### Price Feed Integration
- **Primary**: Pyth Network for real-time price data
- **Fallback**: CoinGecko API for backup price feeds
- **Multi-token Support**: SOL, USDC, and other Solana tokens
- **Caching**: Efficient price data caching and updates

### Wallet Integration
- **Multi-wallet Support**: All Solana wallet adapters
- **Connection Management**: Automatic wallet detection and connection
- **Transaction Handling**: Seamless transaction signing and confirmation
- **Error Handling**: User-friendly wallet connection errors

## 🎨 UI/UX Features

### Modern Design
- **Gradient Animations**: Beautiful color transitions and effects
- **Responsive Layout**: Mobile-first design approach
- **Dark Mode**: Full dark/light theme support
- **Loading States**: Smooth loading indicators and transitions

### User Experience
- **Intuitive Navigation**: Clear routing and breadcrumb navigation
- **Smart Warnings**: Non-blocking wallet connection prompts
- **Toast Notifications**: Real-time user feedback
- **Form Validation**: Comprehensive input validation and error messages

## 🚀 Deployment

### Build for Production
```bash
bun run build
bun run start
```

### Environment Configuration
- Set `NEXT_PUBLIC_RPC_ENDPOINT` to your Solana RPC endpoint
- Configure `NEXT_PUBLIC_PYTH_PRICE_SERVICE_URL` for price feeds
- Update DLMM mode from `MODE.DEVNET` to `MODE.MAINNET` for production

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🔒 Security Considerations

- **Wallet Security**: All transactions require user wallet approval
- **Input Validation**: Comprehensive validation of all user inputs
- **Error Handling**: Secure error handling without exposing sensitive data
- **Environment Variables**: Sensitive configuration stored in environment variables

## 📊 Performance Optimizations

- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Optimized images and assets
- **Caching**: Efficient price data and pool information caching
- **Bundle Size**: Minimal bundle size with tree shaking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Saros Finance**: For the excellent DLMM SDK
- **Solana Foundation**: For the robust blockchain infrastructure
- **Pyth Network**: For reliable price feeds
- **Next.js Team**: For the amazing React framework
