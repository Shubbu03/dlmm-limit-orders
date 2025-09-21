import { Connection, PublicKey } from "@solana/web3.js";

// Price feed IDs for Pyth Network (mainnet)
const PYTH_PRICE_FEEDS = {
    "SOL/USD": "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG", // SOL/USD
    "USDC/USD": "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD", // USDC/USD
    "USDT/USD": "3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL", // USDT/USD
};

// Fallback prices for development/testing (updated to current market prices)
const FALLBACK_PRICES = {
    "SOL/USD": 240.0, // Updated to current SOL price
    "USDC/USD": 1.0,
    "USDT/USD": 1.0,
};

// Simple rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // 3 second between requests

export interface PriceData {
    price: number;
    confidence: number;
    timestamp: number;
    symbol: string;
}

// Real Pyth Network price fetching
export async function getPrice(symbol: string): Promise<number> {
    try {
        // Simple rate limiting
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
            await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - (now - lastRequestTime)));
        }
        lastRequestTime = Date.now();

        console.log(`Fetching real price for ${symbol} from Pyth Network...`);

        // Try to fetch from Pyth Network first
        try {
            const pythPrice = await getPythPrice(symbol);
            if (pythPrice && pythPrice > 0) {
                console.log(`✅ Real Pyth price for ${symbol}: $${pythPrice.toFixed(2)}`);
                return pythPrice;
            }
        } catch (pythError) {
            console.warn(`Pyth Network unavailable for ${symbol}, trying alternative API:`, pythError);
        }

        // Try alternative free crypto API as secondary option
        try {
            const altPrice = await getAlternativePrice(symbol);
            if (altPrice && altPrice > 0) {
                console.log(`✅ Alternative API price for ${symbol}: $${altPrice.toFixed(2)}`);
                return altPrice;
            }
        } catch (altError) {
            console.warn(`Alternative API unavailable for ${symbol}, using fallback:`, altError);
        }

        // Fallback to mock price with current market values
        const basePrice = FALLBACK_PRICES[symbol as keyof typeof FALLBACK_PRICES] || 100.0;
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation for more realistic simulation
        const price = basePrice * (1 + variation);

        console.log(`📊 Fallback price for ${symbol}: $${price.toFixed(2)}`);

        return price;
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        // Return fallback price
        return FALLBACK_PRICES[symbol as keyof typeof FALLBACK_PRICES] || 100.0;
    }
}

// Get price data with additional information
export async function getPriceData(symbol: string): Promise<PriceData> {
    const price = await getPrice(symbol);

    return {
        price,
        confidence: 0.95, // Mock confidence
        timestamp: Date.now(),
        symbol
    };
}

// Monitor price changes for a specific symbol
export async function monitorPrice(
    symbol: string,
    callback: (priceData: PriceData) => void,
    intervalMs: number = 10000
): Promise<() => void> {
    let isRunning = true;

    const monitor = async () => {
        while (isRunning) {
            try {
                const priceData = await getPriceData(symbol);
                callback(priceData);
            } catch (error) {
                console.error(`Error monitoring price for ${symbol}:`, error);
            }

            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
    };

    // Start monitoring
    monitor();

    // Return stop function
    return () => {
        isRunning = false;
    };
}

// Alternative free crypto API (CoinGecko)
export async function getAlternativePrice(symbol: string): Promise<number> {
    try {
        // Map our symbols to CoinGecko IDs
        const coinGeckoIds: Record<string, string> = {
            "SOL/USD": "solana",
            "USDC/USD": "usd-coin",
            "USDT/USD": "tether"
        };

        const coinId = coinGeckoIds[symbol];
        if (!coinId) {
            throw new Error(`No CoinGecko ID found for ${symbol}`);
        }

        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        if (response.status === 429) {
            // Rate limited, wait a bit and try again
            console.warn('CoinGecko rate limited, waiting 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            throw new Error('Rate limited by CoinGecko');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data[coinId] || !data[coinId].usd) {
            throw new Error('No price data received from CoinGecko');
        }

        const price = data[coinId].usd;
        console.log(`📊 CoinGecko price for ${symbol}: $${price.toFixed(2)}`);

        return price;
    } catch (error) {
        console.error(`Error fetching CoinGecko price for ${symbol}:`, error);
        throw error;
    }
}

// Real Pyth Network integration
export async function getPythPrice(symbol: string): Promise<number> {
    try {
        const priceFeedId = PYTH_PRICE_FEEDS[symbol as keyof typeof PYTH_PRICE_FEEDS];
        if (!priceFeedId) {
            throw new Error(`No price feed ID found for ${symbol}`);
        }

        // Try multiple Pyth Network endpoints with proper headers
        const endpoints = [
            'https://hermes.pyth.network/v1/price_feeds',
            'https://hermes-stable-cyan.dourolabs.app/v1/price_feeds',
            'https://hermes-stable-green.dourolabs.app/v1/price_feeds'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 429) {
                    console.warn(`Rate limited on ${endpoint}, trying next endpoint...`);
                    continue;
                }

                if (!response.ok) {
                    console.warn(`HTTP error on ${endpoint}: ${response.status}, trying next endpoint...`);
                    continue;
                }

                const data = await response.json();

                if (!data || !data.price_feeds || data.price_feeds.length === 0) {
                    console.warn(`No price data from ${endpoint}, trying next endpoint...`);
                    continue;
                }

                // Find the price feed for our symbol
                const priceFeed = data.price_feeds.find((feed: any) => feed.id === priceFeedId);
                if (!priceFeed || !priceFeed.price) {
                    console.warn(`Price feed not found for ${symbol} on ${endpoint}, trying next endpoint...`);
                    continue;
                }

                const price = priceFeed.price.price;
                const expo = priceFeed.price.expo;

                // Convert from the exponential format to actual price
                const actualPrice = price * Math.pow(10, expo);

                console.log(`🔴 Real Pyth Network price for ${symbol}: $${actualPrice.toFixed(2)} (from ${endpoint})`);

                return actualPrice;
            } catch (endpointError) {
                console.warn(`Error with endpoint ${endpoint}:`, endpointError);
                continue;
            }
        }

        throw new Error('All Pyth Network endpoints failed');
    } catch (error) {
        console.error(`Error fetching Pyth price for ${symbol}:`, error);
        throw error;
    }
}

// Get multiple prices at once
export async function getMultiplePrices(symbols: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};

    await Promise.all(
        symbols.map(async (symbol) => {
            try {
                prices[symbol] = await getPrice(symbol);
            } catch (error) {
                console.error(`Error fetching price for ${symbol}:`, error);
                prices[symbol] = FALLBACK_PRICES[symbol as keyof typeof FALLBACK_PRICES] || 0;
            }
        })
    );

    return prices;
}
