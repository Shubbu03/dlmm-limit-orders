'use client';

import { useState, useEffect } from 'react';
import { getPrice, PriceData } from '@/lib/price';

interface PriceMonitorProps {
    symbols: string[];
    refreshInterval?: number;
}

export default function PriceMonitor({ symbols, refreshInterval = 10000 }: PriceMonitorProps) {
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchPrices = async () => {
        try {
            const pricePromises = symbols.map(async (symbol) => {
                const priceData = await getPrice(symbol);
                return {
                    symbol,
                    priceData: {
                        price: priceData,
                        confidence: 0.95,
                        timestamp: Date.now(),
                        symbol
                    }
                };
            });

            const results = await Promise.all(pricePromises);
            const newPrices: Record<string, PriceData> = {};

            results.forEach(({ symbol, priceData }) => {
                newPrices[symbol] = priceData;
            });

            setPrices(newPrices);
            setLastUpdate(new Date());
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchPrices();

        // Set up interval
        const interval = setInterval(fetchPrices, refreshInterval);

        return () => clearInterval(interval);
    }, [symbols, refreshInterval]);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Loading prices...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live Prices
                </h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={fetchPrices}
                        className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
                    >
                        Refresh
                    </button>
                    {lastUpdate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {lastUpdate.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {symbols.map((symbol) => {
                    const priceData = prices[symbol];
                    if (!priceData) return null;

                    return (
                        <div key={symbol} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {symbol}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(priceData.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="mt-1">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    ${priceData.price.toFixed(2)}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    ±{(priceData.confidence * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-green-800 dark:text-green-200 text-sm">
                    <strong>Live Price Data:</strong> Prices update every {refreshInterval / 1000} seconds. Stop-loss orders execute automatically when trigger prices are reached.
                </div>
            </div>
        </div>
    );
}
