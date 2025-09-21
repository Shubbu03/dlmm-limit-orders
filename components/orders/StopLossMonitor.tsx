'use client';

import { useState, useEffect } from 'react';
import { getPrice } from '@/lib/price';

interface StopLossMonitorProps {
    pair: string;
    triggerPrice: number;
    onTrigger: () => void;
    isActive: boolean;
}

export default function StopLossMonitor({ pair, triggerPrice, onTrigger, isActive }: StopLossMonitorProps) {
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [isTriggered, setIsTriggered] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    useEffect(() => {
        if (!isActive) return;

        const fetchPrice = async () => {
            try {
                const baseToken = pair.split('/')[0];
                const priceKey = `${baseToken}/USD`;
                const price = await getPrice(priceKey);
                setCurrentPrice(price);
                setLastUpdate(new Date());

                if (price <= triggerPrice && !isTriggered) {
                    setIsTriggered(true);
                    onTrigger();
                }
            } catch (error) {
                console.error('Failed to fetch price for stop-loss monitor:', error);
                // Silent error handling
            }
        };

        // Initial fetch
        fetchPrice();

        // Set up interval for price monitoring
        const interval = setInterval(fetchPrice, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, [pair, triggerPrice, isActive, isTriggered, onTrigger]);

    if (!isActive) {
        return null;
    }

    return (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Stop-Loss Monitor
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${isTriggered
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                    {isTriggered ? 'TRIGGERED!' : 'Monitoring...'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-purple-700 dark:text-purple-300">Current Price:</span>
                    <span className="ml-2 font-mono font-bold">
                        {currentPrice ? `$${currentPrice.toFixed(2)}` : 'Loading...'}
                    </span>
                </div>
                <div>
                    <span className="text-purple-700 dark:text-purple-300">Trigger Price:</span>
                    <span className="ml-2 font-mono">${triggerPrice.toFixed(2)}</span>
                </div>
                <div>
                    <span className="text-purple-700 dark:text-purple-300">Pair:</span>
                    <span className="ml-2 font-mono">{pair}</span>
                </div>
                <div>
                    <span className="text-purple-700 dark:text-purple-300">Last Update:</span>
                    <span className="ml-2 font-mono text-xs">
                        {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
                    </span>
                </div>
            </div>

            {currentPrice && (
                <div className="mt-3">
                    <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-300 ${currentPrice <= triggerPrice
                                    ? 'bg-red-500'
                                    : 'bg-green-500'
                                    }`}
                                style={{
                                    width: `${Math.min(100, Math.max(0, (currentPrice / triggerPrice) * 100))}%`
                                }}
                            />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {((currentPrice / triggerPrice) * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
            )}

            {isTriggered && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        Stop-loss triggered! Current price (${currentPrice?.toFixed(2)}) is below trigger price (${triggerPrice.toFixed(2)})
                    </p>
                </div>
            )}
        </div>
    );
}
