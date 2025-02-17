import axios from 'axios';
import { retryRequest } from '../middileware/routeTracking.js';
import { standardManageError } from '../controllers/failureHandler.js';

const BYBIT_API_BASE = 'https://api.bybit.com/v5/market/kline';

/**
 * Convert `fromDate` and `toDate` into proper timestamp range
 */
const parseDate = (dateString, isEnd = false) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    
    // If only `YYYY-MM-DD` is provided, adjust time to full-day range
    if (dateString.length === 10) {
        return isEnd
            ? new Date(date.setHours(23, 59, 59, 999)) // Set end of the day
            : new Date(date.setHours(0, 0, 0, 0));    // Set start of the day
    }
    return date; // If full timestamp is provided, use as is
};

/**
 * Fetch ByBit Spot OHLCV Data with Date Filtering & Pagination
 */
export const getByBitSpotOHLCV = async (req, res) => {
    try {
        const { symbol, interval, limit = 100, page = 1, pageSize = 10, fromDate, toDate } = req.query;

        if (!symbol || !interval) {
            return standardManageError(req, res, `Missing required query parameters: symbol, interval`, 'validate');
        }

        const url = `${BYBIT_API_BASE}?category=spot&symbol=${symbol}&interval=${interval}&limit=${limit}`;
        const response = await retryRequest(() => axios.get(url));

        // Parse fromDate & toDate properly
        const fromTime = parseDate(fromDate);
        const toTime = parseDate(toDate, true);

        // Convert & Filter Data
        const formattedData = response.data.result.list.map(([
            time, open, high, low, close, volume
        ]) => ({
            createdAt: new Date(parseInt(time)),  // Convert timestamp to a date
            open, high, low, close, volume
        })).filter(entry => {
            const entryTime = new Date(entry.createdAt);
            return (!fromTime || entryTime >= fromTime) && (!toTime || entryTime <= toTime);
        });

        // Implement Pagination
        const totalItems = formattedData.length;
        const startIndex = (page - 1) * pageSize;
        const paginatedData = formattedData.slice(startIndex, startIndex + parseInt(pageSize));

        return res.json({
            exchange: 'ByBit',
            market: 'Spot',
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            data: paginatedData
        });

    } catch (exception) {
        console.error('ByBit Spot OHLCV Error:', exception.message);
        return standardManageError(req, res, exception.message || 'An error occurred', 'exception');
    }
};

/**
 * Fetch ByBit Futures OHLCV Data with Date Filtering & Pagination
 */
export const getByBitFuturesOHLCV = async (req, res) => {
    try {
        const { symbol, interval, limit = 100, page = 1, pageSize = 10, fromDate, toDate } = req.query;

        if (!symbol || !interval) {
            return standardManageError(req, res, `Missing required query parameters: symbol, interval`, 'validate');
        }

        const url = `${BYBIT_API_BASE}?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`;
        const response = await retryRequest(() => axios.get(url));

        // Parse fromDate & toDate properly
        const fromTime = parseDate(fromDate);
        const toTime = parseDate(toDate, true);

        // Convert & Filter Data
        const formattedData = response.data.result.list.map(([
            time, open, high, low, close, volume
        ]) => ({
            createdAt: new Date(parseInt(time)),  // Convert timestamp to a date
            open, high, low, close, volume
        })).filter(entry => {
            const entryTime = new Date(entry.createdAt);
            return (!fromTime || entryTime >= fromTime) && (!toTime || entryTime <= toTime);
        });

        // Implement Pagination
        const totalItems = formattedData.length;
        const startIndex = (page - 1) * pageSize;
        const paginatedData = formattedData.slice(startIndex, startIndex + parseInt(pageSize));

        return res.json({
            exchange: 'ByBit',
            market: 'Futures',
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            data: paginatedData
        });

    } catch (exception) {
        console.error('ByBit Futures OHLCV Error:', exception.message);
        return standardManageError(req, res, exception.message || 'An error occurred', 'exception');
    }
};
