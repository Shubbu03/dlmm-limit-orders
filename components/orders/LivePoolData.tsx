'use client';

import { useState, useEffect } from 'react';
import { TOKEN_PAIRS, getPairAddress } from '@/lib/orders';

interface PoolInfo {
    pair: string;
    pairAddress: string;
    activeId: number;
    binStep: number;
    tokenMintX: string;
    tokenMintY: string;
    loading: boolean;
    error?: string;
}


export default function LivePoolData() {
    const [poolsInfo, setPoolsInfo] = useState<PoolInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPoolData();
    }, []);

    const loadPoolData = async () => {
        setIsLoading(true);
        const poolData: PoolInfo[] = [];

        for (const tokenPair of TOKEN_PAIRS) {
            const poolInfo: PoolInfo = {
                pair: tokenPair.value,
                pairAddress: '',
                activeId: 0,
                binStep: 0,
                tokenMintX: '',
                tokenMintY: '',
                loading: true
            };

            try {
                const pairAddress = await getPairAddress(tokenPair.value);
                const { getDlmmInstance } = await import('@/lib/dlmm');
                const dlmm = await getDlmmInstance();
                const { PublicKey } = await import('@solana/web3.js');
                const pairAccount = await dlmm.getPairAccount(new PublicKey(pairAddress));

                poolInfo.pairAddress = pairAddress;
                const account = pairAccount;
                poolInfo.activeId = account.activeId || 0;
                poolInfo.binStep = account.binStep || 0;
                poolInfo.tokenMintX = typeof account.tokenMintX === 'string' ? account.tokenMintX : String(account.tokenMintX || '');
                poolInfo.tokenMintY = typeof account.tokenMintY === 'string' ? account.tokenMintY : String(account.tokenMintY || '');
                poolInfo.loading = false;
            } catch (error) {
                poolInfo.error = error instanceof Error ? error.message : 'Failed to load pool data';
                poolInfo.loading = false;
            }

            poolData.push(poolInfo);
        }

        setPoolsInfo(poolData);
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Loading Live Pool Data...
                    </h3>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    🔴 Live Pool Data
                </h3>
                <button
                    onClick={loadPoolData}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                >
                    Refresh
                </button>
            </div>

            <div className="space-y-4">
                {poolsInfo.map((pool) => (
                    <div key={pool.pair} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{pool.pair}</h4>
                            {pool.loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            )}
                        </div>

                        {pool.error ? (
                            <div className="text-red-600 dark:text-red-400 text-sm">
                                Error: {pool.error}
                            </div>
                        ) : !pool.loading ? (
                            <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Active Bin ID:</span>
                                        <span className="ml-2 font-mono text-gray-900 dark:text-white">{pool.activeId}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Bin Step:</span>
                                        <span className="ml-2 font-mono text-gray-900 dark:text-white">{pool.binStep}</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Pair Address:</span>
                                    <span className="ml-2 font-mono text-xs text-gray-900 dark:text-white break-all">
                                        {pool.pairAddress}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-2 text-xs">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Token X:</span>
                                        <span className="ml-2 font-mono text-gray-900 dark:text-white break-all">
                                            {pool.tokenMintX}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Token Y:</span>
                                        <span className="ml-2 font-mono text-gray-900 dark:text-white break-all">
                                            {pool.tokenMintY}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-green-800 dark:text-green-200 text-sm">
                    ✅ <strong>Live Integration Active:</strong> The application is now fetching real pool data from the DLMM SDK,
                    including actual bin steps, active bin IDs, and pair addresses. Price-to-bin calculations use live pool parameters.
                </div>
            </div>
        </div>
    );
}
