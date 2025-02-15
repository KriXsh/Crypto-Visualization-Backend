/**
 * @description Generic error handler
 */

const standardManageError = (req, res, msg, type) => {
    switch (type) {
        case 'auth':
            return res.status(401).json({ code: 401, message: msg });
        case 'credits':
            return res.status(402).json({ code: 402, message: msg });
        case 'rateLimit':
            return res.status(400).json({ code: 400, message: msg });
        case 'validate':
            return res.status(400).json({ code: 400, message: msg });
        case 'badRequest':
            return res.status(400).json({ code: 400, message: msg });
        case 'maintenance':
            return res.status(503).json({ code: 503, message: msg });
        case 'notFound':
            return res.status(404).json({ code: 404, message: msg });
        case 'timeOut':
            return res.status(408).json({ code: 408, message: msg });
        case 'notAcceptable':
            return res.status(406).json({ code: 406, message: msg });
        case 'forbidden':
            return res.status(403).json({ code: 403, message: msg });
        case 'exception':
            return res.status(403).json({ code: 403, message: msg });
        case 'server':
            return res.status(500).json({ code: 500, message: msg });
        case 'notImplemented':
            return res.status(501).json({ code: 501, message: msg });
        default:
            return res.status(403).json({ code: 403, message: msg });
    }
};

/**
 * @description Generic error handler for try-catch block
 */
const errorMapping = {
    400: 'Bad Request: Please verify the input.',
    401: 'Unauthorized: Please check your credentials.',
    403: 'Forbidden: You do not have permission to access this resource.',
    404: 'Not Found: The requested resource could not be found.',
    500: 'Internal Server Error: An unexpected error occurred. Please try again later.'
};

export {
    standardManageError,
    errorMapping
};
