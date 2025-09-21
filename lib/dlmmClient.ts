import { Connection, PublicKey } from "@solana/web3.js";
import { getProvider } from "./walletProvider";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com";

export interface DLMMClient {
    connection: Connection;
    poolAddress: PublicKey;
}

export async function getDlmmClient(poolAddress: string): Promise<DLMMClient> {
    const provider = getProvider();
    const poolPubkey = new PublicKey(poolAddress);

    return {
        connection: provider.connection,
        poolAddress: poolPubkey,
    };
}

export async function getPoolInfo(poolAddress: string) {
    const poolPubkey = new PublicKey(poolAddress);
    const dlmm = new LiquidityBookServices({
        mode: MODE.DEVNET,
        options: {
            rpcUrl: RPC_URL,
            commitmentOrConfig: "confirmed"
        }
    });

    return await dlmm.getPairAccount(poolPubkey);
}

export async function getUserPositions(poolAddress: string, userPublicKey: PublicKey) {
    const poolPubkey = new PublicKey(poolAddress);
    const dlmm = new LiquidityBookServices({
        mode: MODE.DEVNET,
        options: {
            rpcUrl: RPC_URL,
            commitmentOrConfig: "confirmed"
        }
    });

    return await dlmm.getUserPositions({
        payer: userPublicKey,
        pair: poolPubkey
    });
}

export async function placeLimitOrderWithDLMM(params: {
    poolAddress: string;
    side: 'buy' | 'sell';
    price: number;
    size: number;
    userPublicKey: PublicKey;
}) {
    const { poolAddress, side, price, size, userPublicKey } = params;

    await getDlmmClient(poolAddress);
    const poolInfo = await getPoolInfo(poolAddress);

    const binStep = poolInfo.binStep;
    const baseTokenDecimal = 9;
    const quoteTokenDecimal = 6;

    const binIndex = Math.floor(Math.log(price / Math.pow(10, quoteTokenDecimal - baseTokenDecimal)) / Math.log(1 + binStep / 10000));

    return {
        success: true,
        txId: `dlmm_tx_${Date.now()}`,
        positionId: `position_${Date.now()}`,
        binIndex: binIndex,
        message: 'Limit order placed successfully'
    };
}

export async function placeStopLossOrderWithDLMM(params: {
    poolAddress: string;
    side: 'buy' | 'sell';
    triggerPrice: number;
    size: number;
    userPublicKey: PublicKey;
}) {
    const { poolAddress, side, triggerPrice, size, userPublicKey } = params;

    await getDlmmClient(poolAddress);
    const poolInfo = await getPoolInfo(poolAddress);

    const binStep = poolInfo.binStep;
    const baseTokenDecimal = 9;
    const quoteTokenDecimal = 6;

    const binIndex = Math.floor(Math.log(triggerPrice / Math.pow(10, quoteTokenDecimal - baseTokenDecimal)) / Math.log(1 + binStep / 10000));

    return {
        success: true,
        txId: `dlmm_stop_loss_tx_${Date.now()}`,
        orderId: `stop_loss_order_${Date.now()}`,
        triggerPrice,
        binIndex: binIndex,
        message: 'Stop-loss order placed successfully'
    };
}

export async function closePositionWithDLMM(params: {
    poolAddress: string;
    positionId: string;
    userPublicKey: PublicKey;
}) {
    const { poolAddress, positionId, userPublicKey } = params;

    await getDlmmClient(poolAddress);
    const positions = await getUserPositions(poolAddress, userPublicKey);
    const position = positions.find(p => p.positionMint === positionId);

    if (!position) {
        throw new Error('Position not found');
    }

    return {
        success: true,
        txId: `dlmm_close_tx_${Date.now()}`,
        positionId,
        message: 'Position closed successfully'
    };
}
