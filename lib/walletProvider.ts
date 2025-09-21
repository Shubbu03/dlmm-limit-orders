import { Wallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';

export interface WalletProvider {
    wallet: Wallet;
    connection: Connection;
    publicKey: PublicKey | null;
}

// This will be used to get the current wallet context
// In a real implementation, this would integrate with your wallet context
let currentWalletProvider: WalletProvider | null = null;

export function setWalletProvider(provider: WalletProvider | null) {
    currentWalletProvider = provider;
}

export function getWalletProvider(): WalletProvider | null {
    return currentWalletProvider;
}

// Helper function to get provider from wallet context
export function getProvider(): WalletProvider {
    if (!currentWalletProvider) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
    }
    return currentWalletProvider;
}

// Helper function to check if wallet is connected
export function isWalletConnected(): boolean {
    return currentWalletProvider !== null && currentWalletProvider.publicKey !== null;
}

// Helper function to get the current public key
export function getCurrentPublicKey(): PublicKey {
    const provider = getProvider();
    if (!provider.publicKey) {
        throw new Error('Wallet public key not available');
    }
    return provider.publicKey;
}
