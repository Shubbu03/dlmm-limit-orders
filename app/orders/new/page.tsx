'use client';

import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Link from 'next/link';

export default function NewOrderPage() {
    const [selectedOrderType, setSelectedOrderType] = useState<'limit' | 'stop-loss' | null>(null);

    const orderTypes = [
        {
            type: 'limit' as const,
            title: 'Limit Order',
            description: 'Buy or sell at a specific price when the market reaches your target',
            icon: '📈',
            color: 'blue',
            href: '/limit-order',
            features: [
                'Set exact target price',
                'Execute when price is reached',
                'Better price control',
                'Perfect for planned entries'
            ]
        },
        {
            type: 'stop-loss' as const,
            title: 'Stop-Loss Order',
            description: 'Automatically sell when price drops to protect your investment',
            icon: '🛡️',
            color: 'orange',
            href: '/stop-loss',
            features: [
                'Risk management tool',
                'Automatic execution',
                'Protect against losses',
                'Set and forget protection'
            ]
        }
    ];

    return (
        <PageLayout
            title="Create New Order"
            subtitle="Choose the type of order you want to place"
            showBackButton={true}
            backButtonHref="/orders"
            backButtonLabel="Back to Orders"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {orderTypes.map((orderType) => (
                    <div
                        key={orderType.type}
                        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${selectedOrderType === orderType.type
                            ? `border-${orderType.color}-500 ring-2 ring-${orderType.color}-200`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        onClick={() => setSelectedOrderType(orderType.type)}
                    >
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center space-x-4 mb-6">
                                <div className={`w-16 h-16 rounded-full bg-${orderType.color}-100 dark:bg-${orderType.color}-900/20 flex items-center justify-center text-2xl`}>
                                    {orderType.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {orderType.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        {orderType.description}
                                    </p>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 mb-8">
                                {orderType.features.map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full bg-${orderType.color}-500`} />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Button */}
                            <Link
                                href={orderType.href}
                                className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium transition-colors duration-200 ${orderType.color === 'blue'
                                    ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    : 'text-white bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                                    }`}
                            >
                                Create {orderType.title}
                                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>

                        {/* Selection indicator */}
                        {selectedOrderType === orderType.type && (
                            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full bg-${orderType.color}-500 flex items-center justify-center`}>
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick stats or help section */}
            <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Need Help Choosing?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Use Limit Orders When:
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• You want to buy at a lower price</li>
                            <li>• You want to sell at a higher price</li>
                            <li>• You have a specific target in mind</li>
                            <li>• You can wait for the right price</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Use Stop-Loss Orders When:
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• You want to limit potential losses</li>
                            <li>• You can&apos;t monitor prices constantly</li>
                            <li>• You want automatic risk management</li>
                            <li>• You&apos;re protecting existing positions</li>
                        </ul>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}