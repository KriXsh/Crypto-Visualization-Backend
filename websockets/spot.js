import WebSocket from 'ws';
import { broadcastMessage } from '../utils/socket/socket.js';

const BINANCE_SPOT_WS = "wss://stream.binance.com:9443/ws/btcusdt@trade";
const BYBIT_SPOT_WS = "wss://stream.bybit.com/v5/public/spot";

let spotSockets = [];

const connectSpotWebSockets = () => {
    console.log("Connecting to Spot Market WebSocket streams.........");

    // Binance Spot WebSocket
    const binanceSocket = new WebSocket(BINANCE_SPOT_WS);
    binanceSocket.on('open', () => console.log("Binance Spot WebSocket connected"));
    binanceSocket.on('message', (data) => {
        const trade = JSON.parse(data);
        const formattedTrade = {
            exchange: "Binance",
            market: "Spot",
            symbol: "BTCUSDT",
            price: trade.p,
            volume: trade.q,
            timestamp: new Date(trade.T)
        };
        // console.log("Binance Spot Trade:", formattedTrade);
        broadcastMessage("spot_trade_update", formattedTrade);
    });
    binanceSocket.on('error', (err) => console.error("Binance WebSocket Error:", err.message));
    binanceSocket.on('close', () => {
        console.log("Binance Spot WebSocket closed, reconnecting in 5s...");
        setTimeout(connectSpotWebSockets, 5000);
    });
    spotSockets.push(binanceSocket);

    // ByBit Spot WebSocket
    const bybitSocket = new WebSocket(BYBIT_SPOT_WS);
    bybitSocket.on('open', () => {
        console.log("ByBit Spot WebSocket connected");
        bybitSocket.send(JSON.stringify({
            op: "subscribe",
            args: ["publicTrade.BTCUSDT"]
        }));
    });
    bybitSocket.on('message', (data) => {
        const tradeData = JSON.parse(data);
        if (tradeData.topic && tradeData.data) {
            tradeData.data.forEach(trade => {
                const formattedTrade = {
                    exchange: "ByBit",
                    market: "Spot",
                    symbol: trade.s,
                    price: trade.p,
                    volume: trade.v,
                    timestamp: new Date(trade.T)
                };
                // console.log("ByBit Spot Trade:", formattedTrade);
                broadcastMessage("spot_trade_update", formattedTrade);
            });
        }
    });
    bybitSocket.on('error', (err) => console.error("ByBit WebSocket Error:", err.message));
    bybitSocket.on('close', () => {
        console.log("ByBit Spot WebSocket closed, reconnecting in 5s...");
        setTimeout(connectSpotWebSockets, 5000);
    });
    spotSockets.push(bybitSocket);
};

// Close all WebSocket connections
const closeSpotWebSockets = () => {
    spotSockets.forEach(socket => socket.close());
    spotSockets = [];
};

export { connectSpotWebSockets, closeSpotWebSockets };
