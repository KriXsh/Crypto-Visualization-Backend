import axios from 'axios';
import { retryRequest } from '../middileware/routeTracking.js';
import { standardManageError } from '../controllers/failureHandler.js';

const BINANCE_API_BASE = 'https://api.binance.com';

/**
 * Fetch Binance Spot OHLCV Data with Proper Date Filtering
 */
export const getBinanceSpotOHLCV = async (req, res) => {
    try {
        const { symbol, interval, limit = 100, page = 1, pageSize = 10, fromDate, toDate } = req.query;

        if (!symbol || !interval) {
            return standardManageError(req, res, 'Missing required query parameters: symbol, interval', 'validate');
        }

        const url = `${BINANCE_API_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        const response = await retryRequest(() => axios.get(url));

        // Convert Date Filtering Input
        const fromTimestamp = fromDate ? new Date(fromDate).setUTCHours(0, 0, 0, 0) : null;
        const toTimestamp = toDate ? new Date(toDate).setUTCHours(23, 59, 59, 999) : null;

        // Convert & Filter Data
        const formattedData = response.data.map(([
            time, open, high, low, close, volume
        ]) => ({
            createdAt: new Date(time).toISOString(),  // Convert timestamp to readable date
            open, high, low, close, volume
        })).filter(entry => {
            const entryTime = new Date(entry.createdAt).getTime();
            return (!fromTimestamp || entryTime >= fromTimestamp) && (!toTimestamp || entryTime <= toTimestamp);
        });

        // Implement Pagination
        const totalItems = formattedData.length;
        const startIndex = (page - 1) * pageSize;
        const paginatedData = formattedData.slice(startIndex, startIndex + parseInt(pageSize));

        return res.json({
            exchange: 'Binance',
            market: 'Spot',
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            data: paginatedData
        });

    } catch (exception) {
        console.error('Binance Spot OHLCV Error:', exception.message);
        return standardManageError(req, res, exception.message || 'An error occurred', 'exception');
    }
};



const BINANCE_FUTURES_API_BASE = 'https://fapi.binance.com';

/**
 * Fetch Binance Futures OHLCV Data with Proper Date Filtering
 */
export const getBinanceFuturesOHLCV = async (req, res) => {
    try {
        const { symbol, interval, limit = 100, page = 1, pageSize = 10, fromDate, toDate } = req.query;

        if (!symbol || !interval) {
            return standardManageError(req, res, 'Missing required query parameters: symbol, interval', 'validate');
        }

        const url = `${BINANCE_FUTURES_API_BASE}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        const response = await retryRequest(() => axios.get(url));

        // Convert Date Filtering Input
        const fromTimestamp = fromDate ? new Date(fromDate).setUTCHours(0, 0, 0, 0) : null;
        const toTimestamp = toDate ? new Date(toDate).setUTCHours(23, 59, 59, 999) : null;

        // Convert & Filter Data
        const formattedData = response.data.map(([
            time, open, high, low, close, volume
        ]) => ({
            createdAt: new Date(time).toISOString(),  // Convert timestamp to readable date
            open, high, low, close, volume
        })).filter(entry => {
            const entryTime = new Date(entry.createdAt).getTime();
            return (!fromTimestamp || entryTime >= fromTimestamp) && (!toTimestamp || entryTime <= toTimestamp);
        });

        // Implement Pagination
        const totalItems = formattedData.length;
        const startIndex = (page - 1) * pageSize;
        const paginatedData = formattedData.slice(startIndex, startIndex + parseInt(pageSize));

        return res.json({
            exchange: 'Binance',
            market: 'Futures',
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            data: paginatedData
        });

    } catch (exception) {
        console.error('Binance Futures OHLCV Error:', exception.message);
        return standardManageError(req, res, exception.message || 'An error occurred', 'exception');
    }
};
