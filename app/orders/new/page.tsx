import OrderForm from '@/components/orders/OrderForm';
import LivePoolData from '@/components/orders/LivePoolData';

export default function NewOrderPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Place New Limit Order
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Set your target price and amount for automated trading
                    </p>
                </div>

                <LivePoolData />
                <OrderForm />
            </div>
        </div>
    );
}
