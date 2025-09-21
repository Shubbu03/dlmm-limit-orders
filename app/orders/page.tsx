'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { OrderStorage, Order } from '@/lib/orders';
import { closePosition } from '@/lib/dlmm';
import Link from 'next/link';
import PriceChart from '@/components/orders/PriceChart';
import PageLayout from '@/components/layout/PageLayout';

export default function OrdersPage() {
    const { wallet, connected } = useWallet();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'filled' | 'executed' | 'canceled'>('all');
    const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'amount' | 'status'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Load orders on component mount
    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = () => {
        const allOrders = OrderStorage.getOrders();
        setOrders(allOrders);
    };

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 5000);
    };

    const handleCancelOrder = async (order: Order) => {
        console.log('Cancel order - Connected:', connected);
        console.log('Cancel order - Wallet:', wallet);
        console.log('Cancel order - Public Key:', wallet?.adapter?.publicKey?.toString());

        if (!connected || !wallet?.adapter?.publicKey) {
            showToast('error', 'Please connect your wallet to cancel orders');
            return;
        }

        setIsLoading(true);
        try {
            if (order.pairAddress) {
                await closePosition({
                    wallet: wallet,
                    positionId: order.id,
                    pairAddress: order.pairAddress
                });
            }
            OrderStorage.updateOrder(order.id, { status: 'canceled' });
            loadOrders();

            showToast('success', `Order ${order.id} canceled successfully`);
        } catch (error) {
            showToast('error', `Failed to cancel order: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReRunOrder = (order: Order) => {
        const orderType = order.type === 'limit' ? 'limit-order' : 'stop-loss';
        const params = new URLSearchParams({
            pair: order.pair,
            side: order.side,
            price: order.price.toString(),
            amount: order.amount.toString(),
            ...(order.type === 'stop-loss' && order.triggerPrice && { triggerPrice: order.triggerPrice.toString() })
        });

        window.location.href = `/${orderType}?${params.toString()}`;
    };

    return (
        <PageLayout
            title="Order Management"
            subtitle="Manage your limit orders and stop-loss orders"
            action={{
                label: "Create New Order",
                href: "/orders/new"
            }}
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
                                Connect your wallet to manage orders and execute trades.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">

                {/* Stats */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {orders.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {orders.filter(o => o.status === 'pending').length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {orders.filter(o => o.status === 'filled').length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Filled</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {orders.filter(o => o.status === 'executed').length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Executed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                {orders.filter(o => o.status === 'canceled').length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Canceled</div>
                        </div>
                    </div>
                </div>

                {/* Filters and Sorting */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Filter by Status
                            </label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'filled' | 'executed' | 'canceled')}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="all">All Orders</option>
                                <option value="pending">Pending</option>
                                <option value="filled">Filled</option>
                                <option value="executed">Executed</option>
                                <option value="canceled">Canceled</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'price' | 'amount' | 'status')}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="createdAt">Created Date</option>
                                <option value="price">Price</option>
                                <option value="amount">Amount</option>
                                <option value="status">Status</option>
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Order
                            </label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>
                        </div>

                        {/* Refresh Button */}
                        <div className="ml-auto">
                            <button
                                onClick={loadOrders}
                                disabled={isLoading}
                                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                {isLoading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Side
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {(() => {
                                const filteredAndSortedOrders = orders
                                    .filter(order => filter === 'all' || order.status === filter)
                                    .sort((a, b) => {
                                        let aValue, bValue;

                                        switch (sortBy) {
                                            case 'createdAt':
                                                aValue = new Date(a.createdAt).getTime();
                                                bValue = new Date(b.createdAt).getTime();
                                                break;
                                            case 'price':
                                                aValue = a.price;
                                                bValue = b.price;
                                                break;
                                            case 'amount':
                                                aValue = a.amount;
                                                bValue = b.amount;
                                                break;
                                            case 'status':
                                                aValue = a.status;
                                                bValue = b.status;
                                                break;
                                            default:
                                                aValue = 0;
                                                bValue = 0;
                                        }

                                        if (sortOrder === 'asc') {
                                            return aValue > bValue ? 1 : -1;
                                        } else {
                                            return aValue < bValue ? 1 : -1;
                                        }
                                    });

                                return filteredAndSortedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No orders found. <Link href="/limit-order" className="text-blue-600 hover:text-blue-700">Create your first order</Link>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {order.id.substring(0, 8)}...
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {order.pair}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.type === 'limit'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                                    }`}>
                                                    {order.type === 'limit' ? 'Limit' : 'Stop-Loss'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.side === 'buy'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}>
                                                    {order.side.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    ${order.price.toFixed(2)}
                                                </div>
                                                {order.type === 'stop-loss' && order.triggerPrice && (
                                                    <div className="text-xs text-orange-600 dark:text-orange-400">
                                                        Trigger: ${order.triggerPrice.toFixed(2)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {order.amount.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    : order.status === 'filled'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : order.status === 'executed'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                    }`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                                <div className="text-xs">
                                                    {new Date(order.createdAt).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {order.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleCancelOrder(order)}
                                                            disabled={isLoading}
                                                            className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleReRunOrder(order)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Re-run
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Price Chart Section */}
            <div className="mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PriceChart pair="SOL/USDC" height={300} />
                    <PriceChart pair="USDC/USD" height={300} />
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${toast.type === 'success'
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