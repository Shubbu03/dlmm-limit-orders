import { getPrice } from "../lib/price";
import { closePosition } from "../lib/dlmm";
import { OrderStorage, Order, closePosition as closePositionSDK } from "../lib/orders";

let stopLossOrders: Order[] = [];

function loadStopLossOrders() {
    const allOrders = OrderStorage.getOrders();
    stopLossOrders = allOrders.filter(order =>
        order.type === 'stop-loss' && order.status === 'pending'
    );
}

async function monitorStopLoss() {
    loadStopLossOrders();

    if (stopLossOrders.length === 0) {
        return;
    }

    const pairs = [...new Set(stopLossOrders.map(order => order.pair))];
    const prices: Record<string, number> = {};

    for (const pair of pairs) {
        try {
            const baseToken = pair.split('/')[0];
            const priceKey = `${baseToken}/USD`;
            prices[pair] = await getPrice(priceKey);
        } catch (error) {
            // Silent error handling
        }
    }

    for (const order of stopLossOrders) {
        try {
            const currentPrice = prices[order.pair];
            if (!currentPrice) continue;

            if (order.triggerPrice && currentPrice <= order.triggerPrice) {
                await executeStopLoss(order);
            }
        } catch (error) {
            // Silent error handling
        }
    }
}

async function executeStopLoss(order: Order) {
    try {
        if (!order.pairAddress) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        OrderStorage.updateOrder(order.id, {
            status: 'executed'
        });

        stopLossOrders = stopLossOrders.filter(o => o.id !== order.id);
    } catch (error) {
        OrderStorage.updateOrder(order.id, {
            status: 'canceled'
        });
    }
}

function startMonitoring(intervalMs: number = 10000) {
    loadStopLossOrders();

    const interval = setInterval(async () => {
        await monitorStopLoss();
    }, intervalMs);

    process.on('SIGINT', () => {
        clearInterval(interval);
        process.exit(0);
    });

    return interval;
}

export { monitorStopLoss, executeStopLoss, startMonitoring, loadStopLossOrders };

if (require.main === module) {
    startMonitoring(10000);
}
