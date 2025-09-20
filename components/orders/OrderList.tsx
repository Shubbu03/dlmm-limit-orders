'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Order, OrderStorage } from '@/lib/orders';
import { closePosition } from '@/lib/dlmm';

export default function OrderList() {
    const { wallet, connected } = useWallet();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancelingOrder, setCancelingOrder] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = () => {
        const storedOrders = OrderStorage.getOrders();
        setOrders(storedOrders);
        setIsLoading(false);
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!connected || !wallet) {
            alert('Please connect your wallet first');
            return;
        }

        setCancelingOrder(orderId);

        try {
            const result = await closePosition({
                wallet,
                positionId: orderId
            });

            if (result.success) {
                // Update order status to canceled
                OrderStorage.updateOrder(orderId, { status: 'canceled' });
                loadOrders(); // Refresh the list
                alert('Order canceled successfully!');
            }
        } catch (error) {
            console.error('Error canceling order:', error);
            alert('Failed to cancel order. Please try again.');
        } finally {
            setCancelingOrder(null);
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'filled':
                return 'text-green-600 dark:text-green-400';
            case 'canceled':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getStatusBadge = (status: Order['status']) => {
        const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
        switch (status) {
            case 'pending':
                return `${baseClasses} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200`;
            case 'filled':
                return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`;
            case 'canceled':
                return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
            default:
                return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`;
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    My Orders
                </h2>
                <button
                    onClick={loadOrders}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                >
                    Refresh
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-600 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No orders found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Place your first limit order to get started.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {orders.map((order) => (
                            <li key={order.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.side === 'buy'
                                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                    }`}>
                                                    {order.side.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {order.pair}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {order.amount} tokens at ${order.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {order.createdAt.toLocaleDateString()} {order.createdAt.toLocaleTimeString()}
                                            </p>
                                        </div>

                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={!connected || cancelingOrder === order.id}
                                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${!connected || cancelingOrder === order.id
                                                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                                                    }`}
                                            >
                                                {cancelingOrder === order.id ? 'Canceling...' : 'Cancel'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {order.binIndex !== undefined && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Bin Index: {order.binIndex}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
