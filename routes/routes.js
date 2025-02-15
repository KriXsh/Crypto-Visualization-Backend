import  { standardManageError }  from '../controllers/failureHandler.js';
import { trackMaintenanceActivity } from '../middileware/routeTracking.js';
import { binance, bybit, mexc }  from '../services/index.js';


const handler = (app) => {
    app.all('*', (req, res, next) => {
        trackMaintenanceActivity(req, res, next);
    });

    //binance apis
    app.get('/binance/spotOhLcv', (req, res) => {
        binance.getBinanceSpotOHLCV(req, res);
    });

    app.get('/binance/futuresOhLcv', (req, res) => {
        binance.getBinanceFuturesOHLCV(req, res);
    });

    //byit apis
    app.get('/bybit/spotOhLcv', (req, res) => {
        bybit.getByBitSpotOHLCV(req, res);
    });

    app.get('/bybit/futuresOhLcv', (req, res) => {
        bybit.getByBitFuturesOHLCV(req, res);
    });

    //mexe apis
    app.get('/mexc/spotOhLcv', (req, res) => {
        mexc.getMEXCSpotOHLCV(req, res)
    });
    
    app.get('/mexe/futuresOhLcv', (req, res) => {
        mexc.getMEXCFuturesOHLCV(req, res)
    });
 


    app.all('*', (req, res) => {
        return standardManageError(req, res, `Endpoint - ${req.url} not found`, 'notImplemented');
    });
}

export { handler };
