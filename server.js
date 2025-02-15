import 'dotenv/config';
import http from 'http';
import responseTime from 'response-time';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import config from './config/index.js';
import { middleware } from './middileware/index.js';
import { initialize } from './utils/socket/socket.js';
import { handler as routesHandler } from './routes/routes.js';
import { connectSpotWebSockets, closeSpotWebSockets } from './websockets/spot.js';
import { connectFuturesWebSockets, closeFuturesWebSockets } from './websockets/futures.js';

const { application } = config;
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: process.env.BASE_URL,
      methods: ["GET", "POST"],
      credentials: true
    }
  });


app.use(middleware.preventClickjacking);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseTime((req, res, time) => console.log(req.method, req.url, time.toFixed(2))));
app.use((error, req, res, next) => middleware.trackRequest(error, req, res, next));
app.use(middleware.logRequest);

routesHandler(app);
initialize(io);

// Start WebSocket connections
connectSpotWebSockets();
connectFuturesWebSockets();

io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Gracefully close WebSocket connections when the server stops
const shutdownServer = () => {
  console.log("Shutting down WebSocket connections...");
  closeSpotWebSockets();
  closeFuturesWebSockets();
  server.close(() => {
      console.log("Server has been stopped.");
      process.exit(0);
  });
};

// Capture termination signals (Ctrl+C or Docker stop)
process.on("SIGINT", shutdownServer);
process.on("SIGTERM", shutdownServer);

server.listen(application.port, () => {
  console.log(`Curd App server started at ${new Date().toLocaleString()}`);
  console.log(`PID: ${process.pid}.`);
  console.log(`HTTP Port: ${application.port}`);
});

server.timeout = 30000;