'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { placeLimitOrder } from '@/lib/dlmm';
import { placeStopLossOrder, getPairAddress, TOKEN_PAIRS, OrderStorage, Order } from '@/lib/orders';

export default function OrderForm() {
    const { wallet, connected } = useWallet();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        pair: 'SOL/USDC',
        type: 'limit' as 'limit' | 'stop-loss',
        side: 'buy' as 'buy' | 'sell',
        price: '',
        triggerPrice: '',
        amount: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!connected || !wallet) {
            alert('Please connect your wallet first');
            return;
        }

        const price = parseFloat(formData.price);
        const triggerPrice = parseFloat(formData.triggerPrice);
        const amount = parseFloat(formData.amount);

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter valid amount');
            return;
        }

        if (formData.type === 'limit' && (isNaN(price) || price <= 0)) {
            alert('Please enter valid target price for limit order');
            return;
        }

        if (formData.type === 'stop-loss' && (isNaN(triggerPrice) || triggerPrice <= 0)) {
            alert('Please enter valid trigger price for stop-loss order');
            return;
        }

        setIsSubmitting(true);

        try {
            let result;

            if (formData.type === 'limit') {
                result = await placeLimitOrder({
                    wallet,
                    pair: formData.pair,
                    price,
                    amount,
                    side: formData.side
                });
            } else {
                if (!wallet.adapter.publicKey) {
                    throw new Error("Wallet public key not available");
                }

                const pairAddress = await getPairAddress(formData.pair);
                result = await placeStopLossOrder({
                    pool: pairAddress,
                    side: formData.side,
                    triggerPrice,
                    size: amount,
                    userPublicKey: wallet.adapter.publicKey
                });
            }

            if (result.success) {
                // Create order object
                const order: Order = {
                    id: 'positionMint' in result ? result.positionMint : result.txId,
                    pair: formData.pair,
                    type: formData.type,
                    side: formData.side,
                    price: formData.type === 'limit' ? price : triggerPrice,
                    amount,
                    status: 'pending',
                    createdAt: new Date(),
                    binIndex: 'binIndex' in result ? result.binIndex : undefined,
                    pairAddress: 'pairAddress' in result ? result.pairAddress : undefined,
                    triggerPrice: formData.type === 'stop-loss' ? triggerPrice : undefined
                };

                OrderStorage.saveOrder(order);
                setFormData({
                    pair: 'SOL/USDC',
                    type: 'limit',
                    side: 'buy',
                    price: '',
                    triggerPrice: '',
                    amount: ''
                });

                alert('Order placed successfully!');
            }
        } catch (error) {
            console.error('Failed to place order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Place Limit Order
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Token Pair Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Token Pair
                    </label>
                    <select
                        value={formData.pair}
                        onChange={(e) => handleInputChange('pair', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                    >
                        {TOKEN_PAIRS.map((pair) => (
                            <option key={pair.value} value={pair.value}>
                                {pair.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Order Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Order Type
                    </label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="limit"
                                checked={formData.type === 'limit'}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-blue-600 dark:text-blue-400 font-medium">Limit Order</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="stop-loss"
                                checked={formData.type === 'stop-loss'}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-orange-600 dark:text-orange-400 font-medium">Stop-Loss</span>
                        </label>
                    </div>
                </div>

                {/* Buy/Sell Selection */}
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

                {/* Price Input - Conditional based on order type */}
                {formData.type === 'limit' && (
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
                )}

                {formData.type === 'stop-loss' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Trigger Price (USDC)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.triggerPrice}
                            onChange={(e) => handleInputChange('triggerPrice', e.target.value)}
                            placeholder="Enter trigger price"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Order will execute when price drops to or below this level
                        </p>
                    </div>
                )}

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount
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
                    className={`w-full py-2 px-4 rounded-md font-medium text-white ${!connected || isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : formData.type === 'stop-loss'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : formData.side === 'buy'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-red-600 hover:bg-red-700'
                        } transition-colors duration-200`}
                >
                    {!connected
                        ? 'Connect Wallet First'
                        : isSubmitting
                            ? 'Placing Order...'
                            : formData.type === 'stop-loss'
                                ? 'Place Stop-Loss Order'
                                : `Place ${formData.side === 'buy' ? 'Buy' : 'Sell'} Limit Order`}
                </button>
            </form>
        </div>
    );
}
