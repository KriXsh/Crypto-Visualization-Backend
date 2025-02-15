import axios from 'axios';
import { retryRequest } from '../middileware/routeTracking.js';
import { standardManageError } from '../controllers/failureHandler.js';

const MEXC_SPOT_API_BASE = 'https://api.mexc.com/api/v3/klines';
const MEXC_FUTURES_API_BASE = 'https://contract.mexc.com/api/v1/contract/kline';

/**
 * Fetch MEXC Spot OHLCV Data with Rate Limit Handling
 */
export const getMEXCSpotOHLCV = async (req, res) => {
    try {
        const { symbol, interval, limit = 100, page = 1, pageSize = 10 } = req.query;
        if (!symbol || !interval) {
            return standardManageError(
                req,
                res,
                `Missing required query parameters: symbol, interval`,
                'validate'
            );
        }
        const url = `${MEXC_SPOT_API_BASE}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        // Retry API call if rate-limited
        const response = await retryRequest(() => axios.get(url));
        const formattedData = response.data.map(([time, open, high, low, close, volume]) => ({
            time, open, high, low, close, volume
        }));

        // Implement Pagination
        const totalItems = formattedData.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedData = formattedData.slice(startIndex, endIndex);

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
        const errorMessage = exception.response?.data?.msg ||
            exception.message ||
            'An unexpected error occurred. Please try again later.';
        return standardManageError(
            req,
            res,
            errorMessage,
            'exception'
        );
    }
};

/**
 * Fetch MEXC Futures OHLCV Data with Rate Limit Handling
 */
export const getMEXCFuturesOHLCV = async (req, res) => {
    try {
        const { symbol, interval, limit = 100, page = 1, pageSize = 10 } = req.query;

        if (!symbol || !interval) {
            return standardManageError(
                req,
                res,
                `Missing required query parameters: symbol, interval`,
                'validate'
            );
        }

        // MEXC Futures uses "Min1" for 1-minute interval
        const url = `${MEXC_FUTURES_API_BASE}/${symbol}?interval=${interval === '1m' ? 'Min1' : interval}&limit=${limit}`;
        // Retry API call if rate-limited
        const response = await retryRequest(() => axios.get(url));
        if (!response.data.success) {
            return standardManageError(
                req, 
                res, 
                'please contact support', 
                'exception', 
                );
        }
        // Extract data properly
        const { time, open, high, low, close, vol } = response.data.data;
        if (!time || !open || !close) {
            return standardManageError(
                req, 
                res, 
                'please contact support', 
                'exception', 
                );
        }
        // Format OHLCV data
        const formattedData = time.map((t, index) => ({
            time: t * 1000, // Convert seconds to milliseconds
            open: open[index],
            high: high[index],
            low: low[index],
            close: close[index],
            volume: vol[index],
        }));

        // Implement Pagination
        const totalItems = formattedData.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedData = formattedData.slice(startIndex, endIndex);

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
        const errorMessage = exception.response?.data?.msg ||
            exception.message ||
            'An unexpected error occurred. Please try again later.';
        return standardManageError(
            req,
            res,
            errorMessage,
            'exception'
        );
    }
};