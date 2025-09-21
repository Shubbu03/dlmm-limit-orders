'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PAIRS, getPairAddress, getBinForPrice, priceForBin } from '@/lib/orders';
import { getDlmmClient, getPoolInfo, placeLimitOrderWithDLMM } from '@/lib/dlmmClient';
import { OrderStorage, Order } from '@/lib/orders';
import { getPrice } from '@/lib/price';

export default function LimitOrderPage() {
    const { wallet, connected } = useWallet();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        pair: 'SOL/USDC',
        side: 'buy' as 'buy' | 'sell',
        price: '',
        amount: ''
    });
    const [poolInfo, setPoolInfo] = useState<any>(null);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [binInfo, setBinInfo] = useState<{ binIndex: number; binPrice: number } | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Handle URL parameters for pre-filling form
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('pair')) setFormData(prev => ({ ...prev, pair: urlParams.get('pair')! }));
        if (urlParams.get('side')) setFormData(prev => ({ ...prev, side: urlParams.get('side') as 'buy' | 'sell' }));
        if (urlParams.get('price')) setFormData(prev => ({ ...prev, price: urlParams.get('price')! }));
        if (urlParams.get('amount')) setFormData(prev => ({ ...prev, amount: urlParams.get('amount')! }));
    }, []);

    // Load pool info when pair changes
    useEffect(() => {
        if (formData.pair) {
            loadPoolInfo();
        }
    }, [formData.pair]);

    // Load current price
    useEffect(() => {
        if (formData.pair) {
            loadCurrentPrice();
        }
    }, [formData.pair]);

    // Update bin info when price changes
    useEffect(() => {
        if (formData.price && poolInfo) {
            updateBinInfo();
        }
    }, [formData.price, poolInfo]);

    const loadPoolInfo = async () => {
        try {
            const pairAddress = await getPairAddress(formData.pair);
            const info = await getPoolInfo(pairAddress);
            setPoolInfo(info);
            console.log('Pool info loaded:', info);
        } catch (error) {
            console.error('Error loading pool info:', error);
            showToast('error', 'Failed to load pool information');
        }
    };

    const loadCurrentPrice = async () => {
        try {
            const baseToken = formData.pair.split('/')[0];
            const priceKey = `${baseToken}/USD`;
            const price = await getPrice(priceKey);
            setCurrentPrice(price);
        } catch (error) {
            console.error('Error loading current price:', error);
        }
    };

    const updateBinInfo = async () => {
        try {
            const price = parseFloat(formData.price);
            if (isNaN(price) || !poolInfo) return;

            const pairAddress = await getPairAddress(formData.pair);
            const binIndex = await getBinForPrice(formData.pair, price, pairAddress);
            const binPrice = await priceForBin(Number(formData.pair), binIndex.toString(), pairAddress);

            setBinInfo({ binIndex, binPrice });
        } catch (error) {
            console.error('Error updating bin info:', error);
        }
    };

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 5000);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!connected || !wallet?.adapter?.publicKey) {
            showToast('error', 'Please connect your wallet');
            return;
        }

        const price = parseFloat(formData.price);
        const amount = parseFloat(formData.amount);

        if (isNaN(price) || isNaN(amount) || price <= 0 || amount <= 0) {
            showToast('error', 'Please enter valid price and amount');
            return;
        }

        setIsSubmitting(true);

        try {
            const pairAddress = await getPairAddress(formData.pair);

            // Get DLMM client
            const dlmmClient = await getDlmmClient(pairAddress);

            // Get bin index for the target price
            const binIndex = await getBinForPrice(formData.pair, price, pairAddress);

            console.log('Placing limit order:', {
                pair: formData.pair,
                side: formData.side,
                price,
                amount,
                binIndex,
                pairAddress
            });

            // Place the limit order using DLMM SDK
            const result = await placeLimitOrderWithDLMM({
                poolAddress: pairAddress,
                side: formData.side,
                price,
                size: amount,
                userPublicKey: wallet.adapter.publicKey
            });

            if (result.success) {
                // Create order object
                const order: Order = {
                    id: result.positionId || result.txId,
                    pair: formData.pair,
                    type: 'limit',
                    side: formData.side,
                    price,
                    amount,
                    status: 'pending',
                    createdAt: new Date(),
                    binIndex,
                    pairAddress
                };

                // Save to storage
                OrderStorage.saveOrder(order);

                showToast('success', `Limit order placed successfully! TX: ${result.txId}`);

                // Reset form
                setFormData({
                    pair: 'SOL/USDC',
                    side: 'buy',
                    price: '',
                    amount: ''
                });
            } else {
                showToast('error', 'Failed to place limit order');
            }
        } catch (error) {
            console.error('Error placing limit order:', error);
            showToast('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Place Limit Order
                    </h1>

                    {/* Pool Information */}
                    {poolInfo && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                Pool Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-700 dark:text-blue-300">Active Bin:</span>
                                    <span className="ml-2 font-mono">{poolInfo.activeId}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700 dark:text-blue-300">Bin Step:</span>
                                    <span className="ml-2 font-mono">{poolInfo.binStep}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Current Price */}
                    {currentPrice && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                                Current Market Price
                            </h3>
                            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                                ${currentPrice.toFixed(2)}
                            </div>
                        </div>
                    )}

                    {/* Bin Information */}
                    {binInfo && (
                        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <h3 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                                Bin Mapping
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-orange-700 dark:text-orange-300">Target Price:</span>
                                    <span className="ml-2 font-mono">${formData.price}</span>
                                </div>
                                <div>
                                    <span className="text-orange-700 dark:text-orange-300">Bin Index:</span>
                                    <span className="ml-2 font-mono">{binInfo.binIndex}</span>
                                </div>
                                <div>
                                    <span className="text-orange-700 dark:text-orange-300">Bin Price:</span>
                                    <span className="ml-2 font-mono">${binInfo.binPrice.toFixed(4)}</span>
                                </div>
                                <div>
                                    <span className="text-orange-700 dark:text-orange-300">Price Diff:</span>
                                    <span className="ml-2 font-mono">
                                        {((parseFloat(formData.price) - binInfo.binPrice) / binInfo.binPrice * 100).toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Token Pair */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Token Pair
                            </label>
                            <select
                                value={formData.pair}
                                onChange={(e) => handleInputChange('pair', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                {TOKEN_PAIRS.map((pair) => (
                                    <option key={pair.value} value={pair.value}>
                                        {pair.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Side */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Side
                            </label>
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="buy"
                                        checked={formData.side === 'buy'}
                                        onChange={(e) => handleInputChange('side', e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-green-600 dark:text-green-400 font-medium">Buy</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="sell"
                                        checked={formData.side === 'sell'}
                                        onChange={(e) => handleInputChange('side', e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-red-600 dark:text-red-400 font-medium">Sell</span>
                                </label>
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Target Price (USDC)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                placeholder="Enter target price"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Amount (Tokens)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                placeholder="Enter amount"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!connected || isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                            {isSubmitting ? 'Placing Order...' : 'Place Limit Order'}
                        </button>
                    </form>

                    {/* Toast Notification */}
                    {toast && (
                        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${toast.type === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                            }`}>
                            {toast.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
