import { dlmm } from './dlmm';
import { PublicKey } from '@solana/web3.js';
import {
    placeLimitOrderWithDLMM,
    placeStopLossOrderWithDLMM,
    closePositionWithDLMM
} from './dlmmClient';

export type Order = {
    id: string;
    pair: string;
    type: "limit" | "stop-loss";
    side: "buy" | "sell";
    price: number;
    amount: number;
    status: "pending" | "filled" | "canceled" | "executed";
    createdAt: Date;
    binIndex?: number;
    pairAddress?: string;
    triggerPrice?: number; // For stop-loss orders
};

export type StopLossOrder = {
    id: string;
    pair: string;
    type: "stop-loss";
    triggerPrice: number;
    amount: number;
    status: "pending" | "executed" | "canceled";
    createdAt: Date;
    pairAddress?: string;
};

// Token pairs configuration with actual token addresses
export const TOKEN_PAIRS = [
    {
        value: "SOL/USDC",
        label: "SOL/USDC",
        baseToken: {
            mint: "So11111111111111111111111111111111111111112", // SOL
            decimals: 9
        },
        quoteToken: {
            mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
            decimals: 6
        }
    },
    {
        value: "SOL/USDT",
        label: "SOL/USDT",
        baseToken: {
            mint: "So11111111111111111111111111111111111111112", // SOL
            decimals: 9
        },
        quoteToken: {
            mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
            decimals: 6
        }
    }
];

export interface TokenPair {
    value: string;
    label: string;
    baseToken: {
        mint: string;
        decimals: number;
    };
    quoteToken: {
        mint: string;
        decimals: number;
    };
}

// Helper functions for price-to-bin conversion (simplified for now)
function getPriceFromId(binStep: number, binId: number, baseTokenDecimal: number, quoteTokenDecimal: number): number {
    const binStepFactor = 1 + binStep / 10000;
    const price = Math.pow(binStepFactor, binId);
    return price * Math.pow(10, quoteTokenDecimal - baseTokenDecimal);
}

function getIdFromPrice(price: number, binStep: number, baseTokenDecimal: number, quoteTokenDecimal: number): number {
    const adjustedPrice = price / Math.pow(10, quoteTokenDecimal - baseTokenDecimal);
    const binStepFactor = 1 + binStep / 10000;
    return Math.floor(Math.log(adjustedPrice) / Math.log(binStepFactor));
}

// Get bin index for a given price using real DLMM SDK
export async function getBinForPrice(pairValue: string, price: number, pairAddress?: string): Promise<number> {
    try {
        const tokenPair = TOKEN_PAIRS.find(p => p.value === pairValue);
        if (!tokenPair) {
            throw new Error(`Token pair ${pairValue} not found`);
        }

        let pair: any;

        if (pairAddress) {
            // Use provided pair address
            pair = await dlmm.getPairAccount(new PublicKey(pairAddress));
        } else {
            // Fetch available pools and find matching pair
            const poolAddresses = await dlmm.fetchPoolAddresses();

            // For now, use the first available pool of this token pair
            // In production, you'd want to filter by token mints
            if (poolAddresses.length === 0) {
                throw new Error('No pools available');
            }

            pair = await dlmm.getPairAccount(new PublicKey(poolAddresses[0]));
        }

        // Use helper function to convert price to bin ID
        const binId = getIdFromPrice(
            price,
            pair.binStep,
            tokenPair.baseToken.decimals,
            tokenPair.quoteToken.decimals
        );

        return binId;
    } catch (error) {
        console.error('Error calculating bin for price:', error);
        throw new Error(`Failed to calculate bin for price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Get price for a given bin index using real DLMM SDK
export async function priceForBin(binIndex: number, pairValue: string, pairAddress?: string): Promise<number> {
    try {
        const tokenPair = TOKEN_PAIRS.find(p => p.value === pairValue);
        if (!tokenPair) {
            throw new Error(`Token pair ${pairValue} not found`);
        }

        let pair: any;

        if (pairAddress) {
            // Use provided pair address
            pair = await dlmm.getPairAccount(new PublicKey(pairAddress));
        } else {
            // Fetch available pools and find matching pair
            const poolAddresses = await dlmm.fetchPoolAddresses();

            if (poolAddresses.length === 0) {
                throw new Error('No pools available');
            }

            pair = await dlmm.getPairAccount(new PublicKey(poolAddresses[0]));
        }

        // Use helper function to convert bin ID to price
        const price = getPriceFromId(
            pair.binStep,
            binIndex,
            tokenPair.baseToken.decimals,
            tokenPair.quoteToken.decimals
        );

        return price;
    } catch (error) {
        console.error('Error calculating price for bin:', error);
        throw new Error(`Failed to calculate price for bin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Get pair address for a token pair
export async function getPairAddress(pairValue: string): Promise<string> {
    try {
        const tokenPair = TOKEN_PAIRS.find(p => p.value === pairValue);
        if (!tokenPair) {
            throw new Error(`Token pair ${pairValue} not found`);
        }

        // Fetch available pools
        const poolAddresses = await dlmm.fetchPoolAddresses();

        if (poolAddresses.length === 0) {
            throw new Error('No pools available');
        }

        // For now, return the first available pool
        // In production, you'd want to filter by token mints to find the exact pair
        return poolAddresses[0];
    } catch (error) {
        console.error('Error fetching pair address:', error);
        throw new Error(`Failed to fetch pair address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// DLMM SDK Integration Functions

// Place a limit order using DLMM SDK
export async function placeLimitOrder(params: {
    pool: string;
    side: 'buy' | 'sell';
    price: number;
    size: number;
    userPublicKey: PublicKey;
}) {
    try {
        const { pool, side, price, size, userPublicKey } = params;

        console.log('Placing limit order:', { pool, side, price, size });

        // Use DLMM SDK to place the order
        const result = await placeLimitOrderWithDLMM({
            poolAddress: pool,
            side,
            price,
            size,
            userPublicKey
        });

        return result;
    } catch (error) {
        console.error('Error placing limit order:', error);
        throw error;
    }
}

// Place a stop-loss order using DLMM SDK
export async function placeStopLossOrder(params: {
    pool: string;
    side: 'buy' | 'sell';
    triggerPrice: number;
    size: number;
    userPublicKey: PublicKey;
}) {
    try {
        const { pool, side, triggerPrice, size, userPublicKey } = params;

        console.log('Placing stop-loss order:', { pool, side, triggerPrice, size });

        // Use DLMM SDK to place the stop-loss order
        const result = await placeStopLossOrderWithDLMM({
            poolAddress: pool,
            side,
            triggerPrice,
            size,
            userPublicKey
        });

        return result;
    } catch (error) {
        console.error('Error placing stop-loss order:', error);
        throw error;
    }
}

// Close a position using DLMM SDK
export async function closePosition(params: {
    pool: string;
    positionId: string;
    userPublicKey: PublicKey;
}) {
    try {
        const { pool, positionId, userPublicKey } = params;

        console.log('Closing position:', { pool, positionId });

        // Use DLMM SDK to close the position
        const result = await closePositionWithDLMM({
            poolAddress: pool,
            positionId,
            userPublicKey
        });

        return result;
    } catch (error) {
        console.error('Error closing position:', error);
        throw error;
    }
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
