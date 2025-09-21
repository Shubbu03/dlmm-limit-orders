import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { Wallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { connection } from "./connection";
import { getBinForPrice, getPairAddress, TOKEN_PAIRS } from "./orders";
import { setWalletProvider } from "./walletProvider";
import { placeLimitOrderWithDLMM, closePositionWithDLMM } from "./dlmmClient";

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

        const payer = wallet.adapter.publicKey;

        // Set up wallet provider for DLMM client
        setWalletProvider({
            wallet,
            connection,
            publicKey: payer
        });

        // Get pair address and pool data
        const pairAddress = await getPairAddress(pair);

        // Get bin index for the target price
        const binIndex = await getBinForPrice(pair, price, pairAddress);

        // Get token pair configuration
        const tokenPair = TOKEN_PAIRS.find(p => p.value === pair);
        if (!tokenPair) {
            throw new Error(`Token pair ${pair} not found`);
        }

        console.log(`Placing ${side} limit order with DLMM SDK:`, {
            pair,
            price,
            amount,
            binIndex,
            pairAddress
        });

        // Use the new DLMM SDK integration
        const result = await placeLimitOrderWithDLMM({
            poolAddress: pairAddress,
            side,
            price,
            size: amount,
            userPublicKey: payer
        });

        return {
            success: result.success,
            txId: result.txId,
            binIndex,
            positionMint: result.positionId,
            pairAddress,
            message: result.message
        };

    } catch (error) {
        console.error("Error placing limit order:", error);
        throw error;
    }
}

export async function closePosition({
    wallet,
    positionId,
    pairAddress
}: {
    wallet: Wallet;
    positionId: string;
    pairAddress?: string;
}) {
    try {
        if (!wallet || !wallet.adapter?.publicKey) {
            throw new Error("Wallet not connected");
        }

        const payer = wallet.adapter.publicKey;

        console.log(`Closing position with DLMM SDK:`, { positionId, pairAddress });

        if (!pairAddress) {
            throw new Error("Pair address is required to close position");
        }

        // Set up wallet provider for DLMM client
        setWalletProvider({
            wallet,
            connection,
            publicKey: payer
        });

        // Use the new DLMM SDK integration
        const result = await closePositionWithDLMM({
            poolAddress: pairAddress,
            positionId,
            userPublicKey: payer
        });

        return {
            success: result.success,
            txId: result.txId,
            message: result.message
        };

    } catch (error) {
        console.error("Error closing position:", error);
        throw error;
    }
}
