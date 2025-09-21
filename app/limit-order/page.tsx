'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_PAIRS, getPairAddress, getBinForPrice, priceForBin } from '@/lib/orders';
import { getDlmmClient, getPoolInfo, placeLimitOrderWithDLMM } from '@/lib/dlmmClient';
import { OrderStorage, Order } from '@/lib/orders';
import { getPrice } from '@/lib/price';
import PageLayout from '@/components/layout/PageLayout';

export default function LimitOrderPage() {
    const { wallet, connected } = useWallet();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        pair: 'SOL/USDC',
        side: 'buy' as 'buy' | 'sell',
        price: '',
        amount: ''
    });
    const [poolInfo, setPoolInfo] = useState<{ binStep: number;[key: string]: unknown } | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [, setBinInfo] = useState<{ binIndex: number; binPrice: number } | null>(null);
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

    const loadPoolInfo = useCallback(async () => {
        try {
            const pairAddress = await getPairAddress(formData.pair);
            const info = await getPoolInfo(pairAddress);
            setPoolInfo(info);
        } catch (error) {
            console.error('Failed to load pool information:', error);
            showToast('error', 'Failed to load pool information');
        }
    }, [formData.pair]);

    const loadCurrentPrice = useCallback(async () => {
        try {
            const baseToken = formData.pair.split('/')[0];
            const priceKey = `${baseToken}/USD`;
            const price = await getPrice(priceKey);
            setCurrentPrice(price);
        } catch (error) {
            console.error('Failed to load current price:', error);
            // Silent error handling
        }
    }, [formData.pair]);

    const updateBinInfo = useCallback(async () => {
        try {
            const price = parseFloat(formData.price);
            if (isNaN(price) || !poolInfo) return;

            const pairAddress = await getPairAddress(formData.pair);
            const binIndex = await getBinForPrice(formData.pair, price, pairAddress);
            const binPrice = await priceForBin(Number(formData.pair), binIndex.toString(), pairAddress);

            setBinInfo({ binIndex, binPrice });
        } catch (error) {
            console.error('Failed to update bin info:', error);
            // Silent error handling
        }
    }, [formData.price, formData.pair, poolInfo]);

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

            // Get DLMM client (for future use)
            await getDlmmClient(pairAddress);

            const binIndex = await getBinForPrice(formData.pair, price, pairAddress);
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
            showToast('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageLayout
            title="Place Limit Order"
            subtitle="Set a target price and amount for your order"
            showBackButton={true}
            backButtonHref="/orders"
            backButtonLabel="Back to Orders"
        >
            {!connected && (
                <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Wallet Not Connected
                            </h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                Connect your wallet to create limit orders and execute trades.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">


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

                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-xl z-50 transition-all duration-300 ${toast.type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {toast.type === 'success' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            )}
                        </svg>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
