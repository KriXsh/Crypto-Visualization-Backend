# **Crypto Market Data Visualization**

## **📌 Project Overview**
This project is a **real-time cryptocurrency market data visualization** tool that fetches historical OHLCV data and streams live trade updates from **Binance** and **ByBit** using WebSockets. The backend is built with **Node.js & Express.js**, while the frontend is developed using **Next.js & React**.

---

## **📌 Features**
✅ Fetch **Spot & Futures OHLCV data** from Binance & ByBit (REST APIs).  
✅ Subscribe to **real-time trade updates** via WebSockets.  
✅ Handle **pagination & rate limits** in the backend.  
✅ Display **historical OHLCV data** in tables and charts.  
✅ Stream **live trade updates** to the UI.  
✅ Implement **ESLint & Prettier** for clean code formatting.  

---

## **📌 Backend Setup (Node.js + Express)**

### **1️⃣ Install Dependencies**
Run the following command in the **backend project root**:
```bash
npm install
```

### **2️⃣ Create Environment Variables**
Create a **`.env`** file in the backend root directory and add:
```env
NODE_ENV = "development"
PORT = "2025"
TOKEN = "xvJ8Pz2gTa5LnR8KxD6FsG9PtV1WsQy3BvZ4JcG7JmKoYnA"
VERSIONS = "v1, v2"
```

### **3️⃣ Start the Backend Server**
```bash
npm run start
```
The backend will be available at:  
**http://localhost:2025**

### **4️⃣ Run ESLint & Prettier (Code Formatting & Linting)**
Check for linting issues:
```bash
npm run lint
```
Fix linting issues automatically:
```bash
npm run lint:fix
```
Format code using Prettier:
```bash
npm run format
```

---

## **📌 Frontend Setup (Next.js + React)**

### **1️⃣ Install Dependencies**
Navigate to the frontend project root and run:
```bash
npm install
```

### **2️⃣ Create Environment Variables**
Create a **`.env.local`** file in the frontend root directory and add:
```env
NEXT_PUBLIC_API_URL="http://localhost:2025/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:2025"
```

### **3️⃣ Start the Frontend Server**
```bash
npm run dev
```
The frontend will be available at:  
**http://localhost:3000**

### **4️⃣ Run ESLint & Prettier**
```bash
npm run lint
npm run lint:fix
npm run format
```

---

## **📌 API Endpoints (Backend)**

### **🔹 Historical OHLCV Data (REST APIs)**
| Method | Endpoint | Description |
|--------|------------|-------------|
| `GET` | `/api/binance/spot?symbol=BTCUSDT&interval=1m&page=1&pageSize=10` | Fetch Binance Spot OHLCV data |
| `GET` | `/api/binance/futures?symbol=BTCUSDT&interval=1m&page=1&pageSize=10` | Fetch Binance Futures OHLCV data |
| `GET` | `/api/bybit/spot?symbol=BTCUSDT&interval=1m&page=1&pageSize=10` | Fetch ByBit Spot OHLCV data |
| `GET` | `/api/bybit/futures?symbol=BTCUSDT&interval=1m&page=1&pageSize=10` | Fetch ByBit Futures OHLCV data |

### **🔹 Real-Time WebSocket Events**
| Event | Description |
|--------|-------------|
| `spot_trade_update` | Receives live Spot market trades |
| `futures_trade_update` | Receives live Futures market trades |

---

## **📌 Project Process (What Has Been Done)**

✅ **Backend Setup (Express + Node.js)**  
✅ **Created REST APIs for OHLCV data** (Binance & ByBit)  
✅ **Integrated WebSockets for real-time market updates**  
✅ **Implemented WebSocket reconnections & error handling**  
✅ **Developed a Next.js frontend** to display data  
✅ **Implemented WebSocket client in React for live trades**  
✅ **Added ESLint & Prettier for code formatting & linting**  

---

## **📌 Final Notes**
- This project provides a **real-time crypto market dashboard** with **historical data, live trades, and WebSocket streaming**.  
- Future improvements may include **more exchanges**, **more cryptocurrencies**, and **custom charting features**.  
- Contributions and improvements are welcome! 🚀