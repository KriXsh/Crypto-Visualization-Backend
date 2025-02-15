import axios from 'axios';
import { retryRequest } from '../middileware/routeTracking.js';
import { standardManageError } from '../controllers/failureHandler.js';

const BYBIT_API_BASE = 'https://api.bybit.com/v5/market/kline';

/**
 * Fetch ByBit Spot OHLCV Data with Pagination
 */
export const getByBitSpotOHLCV = async (req, res) => {
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

        const url = `${BYBIT_API_BASE}?category=spot&symbol=${symbol}&interval=${interval}&limit=${limit}`;
        const response = await retryRequest(() => axios.get(url));

        // Format response
        const formattedData = response.data.result.list.map(([
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
 * Fetch ByBit Futures OHLCV Data with Pagination
 */
export const getByBitFuturesOHLCV = async (req, res) => {
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
        const url = `${BYBIT_API_BASE}?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`;
        const response = await retryRequest(() => axios.get(url));

        // Format response
        const formattedData = response.data.result.list.map(([
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
