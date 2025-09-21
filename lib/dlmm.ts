import { Wallet } from "@solana/wallet-adapter-react";
import { connection } from "./connection";
import { getBinForPrice, getPairAddress, TOKEN_PAIRS } from "./orders";
import { setWalletProvider } from "./walletProvider";
import { placeLimitOrderWithDLMM, closePositionWithDLMM } from "./dlmmClient";
import { LiquidityBookServices } from "@saros-finance/dlmm-sdk";

let dlmmInstance: LiquidityBookServices | null = null;

export const getDlmmInstance = async () => {
    if (!dlmmInstance) {
        const { LiquidityBookServices, MODE } = await import("@saros-finance/dlmm-sdk");
        dlmmInstance = new LiquidityBookServices({
            mode: MODE.DEVNET,
            options: {
                rpcUrl: process.env.NEXT_PUBLIC_RPC_ENDPOINT!,
                commitmentOrConfig: "confirmed"
            }
        });
    }
    return dlmmInstance;
};

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
    if (!wallet || !wallet.adapter?.publicKey) {
        throw new Error("Wallet not connected");
    }

    const payer = wallet.adapter.publicKey;

    setWalletProvider({
        wallet,
        connection,
        publicKey: payer
    });

    const pairAddress = await getPairAddress(pair);
    const binIndex = await getBinForPrice(pair, price, pairAddress);

    const tokenPair = TOKEN_PAIRS.find(p => p.value === pair);
    if (!tokenPair) {
        throw new Error(`Token pair ${pair} not found`);
    }

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
    if (!wallet || !wallet.adapter?.publicKey) {
        throw new Error("Wallet not connected");
    }

    if (!pairAddress) {
        throw new Error("Pair address is required to close position");
    }

    const payer = wallet.adapter.publicKey;

    setWalletProvider({
        wallet,
        connection,
        publicKey: payer
    });

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
}
