import axios from 'axios';
import { retryRequest } from '../middileware/routeTracking.js';
import { standardManageError } from '../controllers/failureHandler.js';

const BINANCE_API_BASE = 'https://api.binance.com';
const BINANCE_FUTURES_API_BASE = 'https://fapi.binance.com';

/**
 * Fetch Binance Spot OHLCV Data with Rate Limit Handling
 */
export const getBinanceSpotOHLCV = async (req, res) => {
    try {
        const { symbol, interval, limit = 100, page = 1, pageSize = 10 } = req.query;
        if (!symbol || !interval) {
            return standardManageError(
                req,
                res,
                'Missing required query parameters: symbol, interval',
                'validate'
            );
        }
        const url = `${BINANCE_API_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

        // Retry API call if rate-limited
        const response = await retryRequest(() => axios.get(url));
        const formattedData = response.data.map(([
            time,
            open,
            high,
            low,
            close,
            volume
        ]) => ({
            time, open, high, low, close, volume
        }));

        // Implement Pagination
        const totalItems = formattedData.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedData = formattedData.slice(startIndex, endIndex);

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
 * Fetch Binance Futures OHLCV Data with Rate Limit Handling
 */
export const getBinanceFuturesOHLCV = async (req, res) => {
    try {
        const { symbol, interval, limit = 100, page = 1, pageSize = 10 } = req.query;
        if (!symbol || !interval) {
            return standardManageError(
                req,
                res,
                'Missing required query parameters: symbol, interval',
                'validate'
            );
        }
        const url = `${BINANCE_FUTURES_API_BASE}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        // Retry API call if rate-limited
        const response = await retryRequest(() => axios.get(url));
        const formattedData = response.data.map(([
            time,
            open,
            high,
            low,
            close,
            volume
        ]) => ({
            time, open, high, low, close, volume
        }));

        // Implement Pagination
        const totalItems = formattedData.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedData = formattedData.slice(startIndex, endIndex);

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
