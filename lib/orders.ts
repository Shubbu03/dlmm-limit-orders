import { dlmm } from './dlmm';

export type Order = {
    id: string;
    pair: string;
    type: "limit";
    side: "buy" | "sell";
    price: number;
    amount: number;
    status: "pending" | "filled" | "canceled";
    createdAt: Date;
    binIndex?: number;
};

// Token pairs configuration
export const TOKEN_PAIRS = [
    { value: "SOL/USDC", label: "SOL/USDC" },
    { value: "SOL/USDT", label: "SOL/USDT" },
    { value: "USDC/USDT", label: "USDC/USDT" },
];

// Get bin index for a given price
export async function getBinForPrice(pair: string, price: number): Promise<number> {
    try {
        // For now, we'll use a simplified calculation
        // In production, you'd fetch the actual pool info and calculate the bin
        const basePrice = 100; // This should come from pool data
        const binStep = 0.01; // This should come from pool configuration

        // Simplified bin calculation - in reality, you'd use the pool's bin step
        const binIndex = Math.floor(Math.log(price / basePrice) / Math.log(1 + binStep));
        return binIndex;
    } catch (error) {
        console.error('Error calculating bin for price:', error);
        throw new Error('Failed to calculate bin for price');
    }
}

// Get price for a given bin index
export function priceForBin(binIndex: number): number {
    const basePrice = 100; // This should come from pool data
    const binStep = 0.01; // This should come from pool configuration

    // Simplified price calculation - in reality, you'd use the pool's bin step
    return basePrice * Math.pow(1 + binStep, binIndex);
}

// Client-side order storage (using localStorage for persistence)
export class OrderStorage {
    private static STORAGE_KEY = 'dlmm_limit_orders';

    static getOrders(): Order[] {
        if (typeof window === 'undefined') return [];

        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored).map((order: any) => ({
                ...order,
                createdAt: new Date(order.createdAt)
            })) : [];
        } catch (error) {
            console.error('Error loading orders from storage:', error);
            return [];
        }
    }

    static saveOrder(order: Order): void {
        if (typeof window === 'undefined') return;

        try {
            const orders = this.getOrders();
            orders.push(order);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
        } catch (error) {
            console.error('Error saving order to storage:', error);
        }
    }

    static updateOrder(orderId: string, updates: Partial<Order>): void {
        if (typeof window === 'undefined') return;

        try {
            const orders = this.getOrders();
            const index = orders.findIndex(order => order.id === orderId);
            if (index !== -1) {
                orders[index] = { ...orders[index], ...updates };
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
            }
        } catch (error) {
            console.error('Error updating order in storage:', error);
        }
    }

    static removeOrder(orderId: string): void {
        if (typeof window === 'undefined') return;

        try {
            const orders = this.getOrders();
            const filteredOrders = orders.filter(order => order.id !== orderId);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredOrders));
        } catch (error) {
            console.error('Error removing order from storage:', error);
        }
    }
}
