import axios from 'axios';
import { retryRequest } from '../middileware/routeTracking.js';
import { standardManageError } from '../controllers/failureHandler.js';

const MEXC_SPOT_API_BASE = 'https://api.mexc.com/api/v3/klines';
const MEXC_FUTURES_API_BASE = 'https://contract.mexc.com/api/v1/contract/kline';

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
 * Fetch MEXC Spot OHLCV Data with Rate Limit Handling & Date Filtering
 */
export const getMEXCSpotOHLCV = async (req, res) => {
    try {
        const { symbol, interval, limit = 100, page = 1, pageSize = 10, fromDate, toDate } = req.query;
        
        if (!symbol || !interval) {
            return standardManageError(req, res, `Missing required query parameters: symbol, interval`, 'validate');
        }

        const url = `${MEXC_SPOT_API_BASE}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        const response = await retryRequest(() => axios.get(url));

        // Parse `fromDate` & `toDate`
        const fromTime = parseDate(fromDate);
        const toTime = parseDate(toDate, true);

        // Convert & Filter Data
        const formattedData = response.data.map(([time, open, high, low, close, volume]) => ({
            createdAt: new Date(time),  // Convert timestamp to date
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
            exchange: 'MEXC',
            market: 'Spot',
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            data: paginatedData
        });

    } catch (exception) {
        console.error('MEXC Spot OHLCV Error:', exception.message);
        return standardManageError(req, res, exception.message || 'An error occurred', 'exception');
    }
};

/**
 * Fetch MEXC Futures OHLCV Data with Rate Limit Handling & Date Filtering
 */
export const getMEXCFuturesOHLCV = async (req, res) => {
    try {
        const { symbol, interval, limit = 100, page = 1, pageSize = 10, fromDate, toDate } = req.query;

        if (!symbol || !interval) {
            return standardManageError(req, res, `Missing required query parameters: symbol, interval`, 'validate');
        }

        // MEXC Futures uses "Min1" for 1-minute interval
        const url = `${MEXC_FUTURES_API_BASE}/${symbol}?interval=${interval === '1m' ? 'Min1' : interval}&limit=${limit}`;
        const response = await retryRequest(() => axios.get(url));

        if (!response.data.success) {
            return standardManageError(req, res, 'please contact support', 'exception');
        }

        // Extract data properly
        const { time, open, high, low, close, vol } = response.data.data;
        if (!time || !open || !close) {
            return standardManageError(req, res, 'please contact support', 'exception');
        }

        // Parse `fromDate` & `toDate`
        const fromTime = parseDate(fromDate);
        const toTime = parseDate(toDate, true);

        // Convert & Filter Data
        const formattedData = time.map((t, index) => ({
            createdAt: new Date(t * 1000),  // Convert seconds to milliseconds
            open: open[index],
            high: high[index],
            low: low[index],
            close: close[index],
            volume: vol[index],
        })).filter(entry => {
            const entryTime = new Date(entry.createdAt);
            return (!fromTime || entryTime >= fromTime) && (!toTime || entryTime <= toTime);
        });

        // Implement Pagination
        const totalItems = formattedData.length;
        const startIndex = (page - 1) * pageSize;
        const paginatedData = formattedData.slice(startIndex, startIndex + parseInt(pageSize));

        return res.json({
            exchange: 'MEXC',
            market: 'Futures',
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            data: paginatedData
        });

    } catch (exception) {
        console.error('MEXC Futures OHLCV Error:', exception.message);
        return standardManageError(req, res, exception.message || 'An error occurred', 'exception');
    }
};
