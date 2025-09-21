'use client';

import { useState, useEffect } from 'react';
import { getPrice } from '@/lib/price';

interface PriceData {
    time: string;
    price: number;
}

interface PriceChartProps {
    pair: string;
    height?: number;
}

export default function PriceChart({ pair, height = 200 }: PriceChartProps) {
    const [priceData, setPriceData] = useState<PriceData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPriceData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const baseToken = pair.split('/')[0];
                const priceKey = `${baseToken}/USD`;
                const price = await getPrice(priceKey);

                const newDataPoint: PriceData = {
                    time: new Date().toLocaleTimeString(),
                    price: price
                };

                setPriceData(prev => {
                    const updated = [...prev, newDataPoint];
                    // Keep only last 20 data points
                    return updated.slice(-20);
                });
            } catch (err) {
                setError('Failed to fetch price data');
                console.error('Error fetching price data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        // Initial fetch
        fetchPriceData();

        // Set up interval for price updates
        const interval = setInterval(fetchPriceData, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [pair]);

    if (isLoading && priceData.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400">Loading price data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-48 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-red-500 dark:text-red-400">{error}</div>
            </div>
        );
    }

    if (priceData.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400">No price data available</div>
            </div>
        );
    }

    // Simple line chart using SVG
    const maxPrice = Math.max(...priceData.map(d => d.price));
    const minPrice = Math.min(...priceData.map(d => d.price));
    const priceRange = maxPrice - minPrice;
    const padding = 20;
    const chartWidth = 400;
    const chartHeight = height - padding * 2;

    const getX = (index: number) => (index / (priceData.length - 1)) * chartWidth;
    const getY = (price: number) => chartHeight - ((price - minPrice) / priceRange) * chartHeight;

    const pathData = priceData
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.price)}`)
        .join(' ');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pair} Price Chart
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {priceData[priceData.length - 1]?.time}
                </div>
            </div>

            <div className="relative">
                <svg width={chartWidth + padding * 2} height={height} className="w-full">
                    {/* Grid lines */}
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" className="dark:stroke-gray-700" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Price line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        className="drop-shadow-sm"
                    />

                    {/* Data points */}
                    {priceData.map((point, index) => (
                        <circle
                            key={index}
                            cx={getX(index)}
                            cy={getY(point.price)}
                            r="3"
                            fill="#3b82f6"
                            className="drop-shadow-sm"
                        />
                    ))}

                    {/* Price labels */}
                    <text
                        x={chartWidth + padding + 5}
                        y={padding}
                        className="text-xs fill-gray-600 dark:fill-gray-400"
                    >
                        ${maxPrice.toFixed(2)}
                    </text>
                    <text
                        x={chartWidth + padding + 5}
                        y={chartHeight + padding}
                        className="text-xs fill-gray-600 dark:fill-gray-400"
                    >
                        ${minPrice.toFixed(2)}
                    </text>
                </svg>

                {/* Current price display */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                    ${priceData[priceData.length - 1]?.price.toFixed(2)}
                </div>
            </div>

            {/* Price change indicator */}
            {priceData.length > 1 && (
                <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">24h Change:</span>
                    <span className={`text-sm font-medium ${priceData[priceData.length - 1].price >= priceData[0].price
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}>
                        {priceData[priceData.length - 1].price >= priceData[0].price ? '+' : ''}
                        {((priceData[priceData.length - 1].price - priceData[0].price) / priceData[0].price * 100).toFixed(2)}%
                    </span>
                </div>
            )}
        </div>
    );
}
