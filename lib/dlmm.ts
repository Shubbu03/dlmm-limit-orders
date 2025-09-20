import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { Wallet } from "@solana/wallet-adapter-react";
import { connection } from "./connection";
import { getBinForPrice } from "./orders";

export const dlmm = new LiquidityBookServices({
    mode: MODE.DEVNET,
    options: {
        rpcUrl: process.env.NEXT_PUBLIC_RPC_ENDPOINT!,
        commitmentOrConfig: "confirmed"
    }
});

export interface PlaceLimitOrderParams {
    wallet: Wallet;
    pair: string;
    price: number;
    amount: number;
    side: "buy" | "sell";
}

export async function placeLimitOrder({
    wallet,
    pair,
    price,
    amount,
    side
}: PlaceLimitOrderParams) {
    try {
        if (!wallet || !wallet.adapter?.publicKey) {
            throw new Error("Wallet not connected");
        }

        // Get bin index for the target price
        const binIndex = await getBinForPrice(pair, price);

        // For now, we'll simulate the transaction
        // In production, you'd build the actual openPosition instruction
        console.log(`Placing ${side} limit order:`, {
            pair,
            price,
            amount,
            binIndex
        });

        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In production, you would:
        // 1. Get the pool address for the pair
        // 2. Build the openPosition instruction with the calculated bin
        // 3. Send the transaction using wallet.sendTransaction

        return {
            success: true,
            txId: "simulated_tx_" + Date.now(),
            binIndex
        };
    } catch (error) {
        console.error("Error placing limit order:", error);
        throw error;
    }
}

export async function closePosition({
    wallet,
    positionId
}: {
    wallet: Wallet;
    positionId: string;
}) {
    try {
        if (!wallet || !wallet.adapter?.publicKey) {
            throw new Error("Wallet not connected");
        }

        // Simulate closing position
        console.log(`Closing position:`, { positionId });

        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In production, you would:
        // 1. Build the closePosition instruction
        // 2. Send the transaction using wallet.sendTransaction

        return {
            success: true,
            txId: "simulated_close_tx_" + Date.now()
        };
    } catch (error) {
        console.error("Error closing position:", error);
        throw error;
    }
}
