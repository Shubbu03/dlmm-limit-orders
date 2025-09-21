'use client';
import Image from "next/image";
import Link from "next/link";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Home() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-8">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-6 py-3 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-800">
                <span className="text-lg">⚡</span>
                <span>Powered by DLMM Technology</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              Smart Trading
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
                Made Simple
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Automate your trading with advanced limit orders and stop-loss protection using
              <span className="text-blue-600 dark:text-blue-400 font-semibold"> Dynamic Liquidity Market Maker</span> technology.
            </p>

            {/* CTA Buttons */}
            {connected ? (
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/orders/new"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <span className="mr-3 text-xl">🚀</span>
                  <span>Start Trading</span>
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/orders"
                  className="group inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="mr-3 text-xl">📋</span>
                  <span>View Orders</span>
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !hover:from-blue-700 !hover:to-purple-700 !rounded-2xl !py-4 !px-8 !text-lg !font-semibold !transition-all !duration-300 !transform !hover:scale-105 !shadow-lg !hover:shadow-xl" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect your wallet to access all trading features
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Automated Trading</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">0.1%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Low Fees</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">∞</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unlimited Orders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">⚡</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Instant Execution</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Advanced features designed for both beginners and professional traders
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Limit Orders Feature */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-blue-100 dark:border-blue-800/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
              <div className="relative p-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl text-white">📈</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Limit Orders
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Execute trades at your exact target price with precision timing and optimal market entry strategies.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Set exact target prices</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Automatic execution</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Better price control</span>
                  </div>
                </div>
                {connected ? (
                  <Link
                    href="/limit-order"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
                  >
                    Create Limit Order
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    Connect wallet to access
                  </div>
                )}
              </div>
            </div>

            {/* Stop-Loss Feature */}
            <div className="group relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-orange-100 dark:border-orange-800/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 group-hover:from-orange-500/10 group-hover:to-red-500/10 transition-all duration-500"></div>
              <div className="relative p-8">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl text-white">🛡️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Stop-Loss Orders
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Protect your investments with automatic risk management and intelligent loss prevention systems.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Risk management tool</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Automatic execution</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Protect against losses</span>
                  </div>
                </div>
                {connected ? (
                  <Link
                    href="/stop-loss"
                    className="inline-flex items-center text-orange-600 dark:text-orange-400 font-semibold hover:text-orange-700 dark:hover:text-orange-300 transition-colors group"
                  >
                    Create Stop-Loss
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    Connect wallet to access
                  </div>
                )}
              </div>
            </div>

            {/* Order Management Feature */}
            <div className="group relative bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-green-100 dark:border-green-800/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 group-hover:from-green-500/10 group-hover:to-teal-500/10 transition-all duration-500"></div>
              <div className="relative p-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl text-white">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Monitor, modify, and manage all your active orders from a unified, intuitive dashboard.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Unified dashboard</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Real-time monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Easy management</span>
                  </div>
                </div>
                {connected ? (
                  <Link
                    href="/orders"
                    className="inline-flex items-center text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300 transition-colors group"
                  >
                    View Orders
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    Connect wallet to access
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Advanced Trading Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-lg">Real-time price monitoring</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-lg">Automated execution</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-lg">Dynamic liquidity</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-lg">Multiple token pairs</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-lg">Risk protection</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-lg">Wallet integration</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 text-white border border-white/20">
                <h3 className="text-3xl font-bold mb-6">Ready to Start?</h3>
                <p className="text-xl mb-8 opacity-90 leading-relaxed">
                  Join thousands of traders using our advanced DLMM technology for smarter trading decisions.
                </p>
                {connected ? (
                  <Link
                    href="/orders/new"
                    className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Get Started Now
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                ) : (
                  <WalletMultiButton className="!bg-white !text-purple-600 !hover:bg-gray-100 !rounded-2xl !py-4 !px-8 !text-lg !font-semibold !transition-all !duration-300 !transform !hover:scale-105 !shadow-lg" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-8 md:mb-0">
              <span className="text-3xl">⚡</span>
              <span className="text-2xl font-bold text-white">
                DLMM Orders
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <a
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                href="https://github.com/saros-finance/dlmm-sdk"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/file.svg"
                  alt="File icon"
                  width={20}
                  height={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>DLMM SDK</span>
              </a>
              <a
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                href="https://saros.finance"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/globe.svg"
                  alt="Globe icon"
                  width={20}
                  height={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>Saros Finance</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}