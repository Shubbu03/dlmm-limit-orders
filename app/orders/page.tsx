import OrderList from '@/components/orders/OrderList';
import Link from 'next/link';

export default function OrdersPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Orders Dashboard
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage your limit orders and track their status
                        </p>
                    </div>

                    <Link
                        href="/orders/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Order
                    </Link>
                </div>

                <OrderList />
            </div>
        </div>
    );
}
