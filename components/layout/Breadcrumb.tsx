"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    const pathname = usePathname();

    // Auto-generate breadcrumbs if not provided
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        const pathSegments = pathname.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            let label = segment.charAt(0).toUpperCase() + segment.slice(1);

            // Custom labels for better UX
            switch (segment) {
                case 'limit-order':
                    label = 'New Limit Order';
                    break;
                case 'stop-loss':
                    label = 'New Stop Loss';
                    break;
                case 'orders':
                    label = 'Orders';
                    break;
                case 'new':
                    label = 'New Order';
                    break;
            }

            breadcrumbs.push({
                label,
                href: index === pathSegments.length - 1 ? undefined : currentPath
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = items || generateBreadcrumbs();

    if (breadcrumbs.length <= 1) return null;

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                    {index > 0 && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 dark:text-white font-medium">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
