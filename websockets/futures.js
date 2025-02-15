import WebSocket from 'ws';
import { broadcastMessage } from '../utils/socket/socket.js';

const BINANCE_FUTURES_WS = "wss://fstream.binance.com/ws/btcusdt@trade";
const BYBIT_FUTURES_WS = "wss://stream.bybit.com/v5/public/linear";

let futuresSockets = [];

const connectFuturesWebSockets = () => {
    console.log("Connecting to Futures Market WebSocket streams.......");

    // Binance Futures WebSocket
    const binanceSocket = new WebSocket(BINANCE_FUTURES_WS);
    binanceSocket.on('open', () => console.log("Binance Futures WebSocket connected"));
    binanceSocket.on('message', (data) => {
        const trade = JSON.parse(data);
        const formattedTrade = {
            exchange: "Binance",
            market: "Futures",
            symbol: "BTCUSDT",
            price: trade.p,
            volume: trade.q,
            timestamp: trade.T
        };
        // console.log("Binance Futures Trade:", formattedTrade);
        broadcastMessage("futures_trade_update", formattedTrade);
    });
    binanceSocket.on('error', (err) => console.error("Binance WebSocket Error:", err.message));
    binanceSocket.on('close', () => {
        console.log("Binance Futures WebSocket closed, reconnecting in 5s...");
        setTimeout(connectFuturesWebSockets, 5000);
    });
    futuresSockets.push(binanceSocket);

    // ByBit Futures WebSocket
    const bybitSocket = new WebSocket(BYBIT_FUTURES_WS);
    bybitSocket.on('open', () => {
        console.log("ByBit Futures WebSocket connected");
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
                    market: "Futures",
                    symbol: trade.s,
                    price: trade.p,
                    volume: trade.v,
                    timestamp: trade.T
                };
                // console.log("ByBit Futures Trade:", formattedTrade);
                broadcastMessage("futures_trade_update", formattedTrade);
            });
        }
    });
    bybitSocket.on('error', (err) => console.error("ByBit WebSocket Error:", err.message));
    bybitSocket.on('close', () => {
        console.log("ByBit Futures WebSocket closed, reconnecting in 5s...");
        setTimeout(connectFuturesWebSockets, 5000);
    });
    futuresSockets.push(bybitSocket);
};

// Close all WebSocket connections
const closeFuturesWebSockets = () => {
    futuresSockets.forEach(socket => socket.close());
    futuresSockets = [];
};

export { connectFuturesWebSockets, closeFuturesWebSockets };
