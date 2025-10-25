import express from "express";
import dotenv from "dotenv";
import { connectdb } from "./db/db.js";
import userRoutes from "./routes/user.js";
import {createClient} from 'redis';
import cookieParser from "cookie-parser";
import cors from 'cors';

dotenv.config();
await connectdb();

const redisUrl = process.env.REDIS_URL;
if(!redisUrl){
  console.log("Missing redis url");
  process.exit(1);  
}

export const redisClient = createClient({
  url: redisUrl,
});

redisClient
.connect()
.then(() => console.log("Connected to Redis"))
.catch((error) => {
    console.error("Failed to connect to Redis:", error.message);
    process.exit(1);
});

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}))

app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'public')));
// Catch all handler: send back React's index.html file for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


