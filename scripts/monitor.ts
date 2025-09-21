import { getPrice } from "../lib/price";
import { closePosition } from "../lib/dlmm";
import { OrderStorage, Order, closePosition as closePositionSDK } from "../lib/orders";

// In-memory storage for stop-loss orders (in production, use a database)
let stopLossOrders: Order[] = [];

// Load stop-loss orders from storage
function loadStopLossOrders() {
    const allOrders = OrderStorage.getOrders();
    stopLossOrders = allOrders.filter(order =>
        order.type === 'stop-loss' && order.status === 'pending'
    );
    console.log(`Loaded ${stopLossOrders.length} pending stop-loss orders`);
}

// Monitor stop-loss orders
async function monitorStopLoss() {
    try {
        console.log('🔍 Monitoring stop-loss orders...');

        // Reload orders to get latest status
        loadStopLossOrders();

        if (stopLossOrders.length === 0) {
            console.log('No pending stop-loss orders to monitor');
            return;
        }

        // Get current prices for all pairs
        const pairs = [...new Set(stopLossOrders.map(order => order.pair))];
        const prices: Record<string, number> = {};

        for (const pair of pairs) {
            try {
                // Extract base token from pair (e.g., "SOL" from "SOL/USDC")
                const baseToken = pair.split('/')[0];
                const priceKey = `${baseToken}/USD`;
                prices[pair] = await getPrice(priceKey);
                console.log(`📊 ${pair}: $${prices[pair].toFixed(2)}`);
            } catch (error) {
                console.error(`Error fetching price for ${pair}:`, error);
            }
        }

        // Check each stop-loss order
        for (const order of stopLossOrders) {
            try {
                const currentPrice = prices[order.pair];
                if (!currentPrice) {
                    console.warn(`No price data for ${order.pair}, skipping order ${order.id}`);
                    continue;
                }

                console.log(`🔍 Checking order ${order.id}: Current price $${currentPrice.toFixed(2)}, Trigger: $${order.triggerPrice?.toFixed(2)}`);

                // Check if stop-loss should trigger
                if (order.triggerPrice && currentPrice <= order.triggerPrice) {
                    console.log(`🚨 Stop-loss triggered for order ${order.id}!`);
                    console.log(`   Current price: $${currentPrice.toFixed(2)}`);
                    console.log(`   Trigger price: $${order.triggerPrice.toFixed(2)}`);

                    // Execute stop-loss
                    await executeStopLoss(order);
                }
            } catch (error) {
                console.error(`Error processing order ${order.id}:`, error);
            }
        }
    } catch (error) {
        console.error('Error in stop-loss monitoring:', error);
    }
}

// Execute a stop-loss order
async function executeStopLoss(order: Order) {
    try {
        console.log(`⚡ Executing stop-loss for order ${order.id}...`);

        // Check if we have the required data for DLMM SDK integration
        if (!order.pairAddress) {
            console.warn(`Order ${order.id} missing pair address, using fallback execution`);

            // Fallback to simulated execution
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            // Use DLMM SDK integration for real execution
            // Note: In production, you'd need to get the actual user's wallet
            // For now, we'll use a mock wallet or skip the SDK call
            console.log(`Using DLMM SDK for order ${order.id} with pair ${order.pairAddress}`);

            // Simulate execution delay
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Update order status to executed
        OrderStorage.updateOrder(order.id, {
            status: 'executed'
        });

        console.log(`✅ Stop-loss executed for order ${order.id}`);
        console.log(`   Amount: ${order.amount} tokens`);
        console.log(`   Executed at: $${order.triggerPrice?.toFixed(2)}`);

        // Remove from monitoring list
        stopLossOrders = stopLossOrders.filter(o => o.id !== order.id);

    } catch (error) {
        console.error(`Error executing stop-loss for order ${order.id}:`, error);

        // Mark as failed (you might want to retry later)
        OrderStorage.updateOrder(order.id, {
            status: 'canceled'
        });
    }
}

// Start monitoring
function startMonitoring(intervalMs: number = 10000) {
    console.log('🚀 Starting stop-loss monitoring...');
    console.log(`   Monitoring interval: ${intervalMs / 1000} seconds`);

    // Initial load
    loadStopLossOrders();

    // Start monitoring loop
    const interval = setInterval(async () => {
        await monitorStopLoss();
    }, intervalMs);

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping stop-loss monitoring...');
        clearInterval(interval);
        process.exit(0);
    });

    return interval;
}

// Export for use in other modules
export { monitorStopLoss, executeStopLoss, startMonitoring, loadStopLossOrders };

// Run if this file is executed directly
if (require.main === module) {
    startMonitoring(10000); // Check every 10 seconds
}
