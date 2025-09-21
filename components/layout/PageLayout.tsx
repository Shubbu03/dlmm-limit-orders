"use client";

import { ReactNode } from "react";
import Breadcrumb from "./Breadcrumb";
import Link from "next/link";

interface PageLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    action?: {
        label: string;
        href: string;
        variant?: 'primary' | 'secondary';
    };
    showBackButton?: boolean;
    backButtonHref?: string;
    backButtonLabel?: string;
}

export default function PageLayout({
    children,
    title,
    subtitle,
    breadcrumbs,
    action,
    showBackButton = false,
    backButtonHref = "/orders",
    backButtonLabel = "Back to Orders"
}: PageLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <Breadcrumb items={breadcrumbs} />

                {/* Back button */}
                {showBackButton && (
                    <div className="mb-6">
                        <Link
                            href={backButtonHref}
                            className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>{backButtonLabel}</span>
                        </Link>
                    </div>
                )}

                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {action && (
                        <div className="mt-4 sm:mt-0">
                            <Link
                                href={action.href}
                                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium transition-colors duration-200 ${action.variant === 'secondary'
                                    ? 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    }`}
                            >
                                {action.label}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Page content */}
                <div className="space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
}