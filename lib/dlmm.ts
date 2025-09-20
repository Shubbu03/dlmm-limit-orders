import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

export const dlmm = new LiquidityBookServices({
    mode: MODE.DEVNET,
    options: {
        rpcUrl: process.env.NEXT_PUBLIC_RPC_ENDPOINT!,
        commitmentOrConfig: "confirmed"
    }
});
