import express from "express";
import dotenv from "dotenv";
import { connectdb } from "./db/db.js";
import userRoutes from "./routes/user.js";
import messageRoutes from "./routes/message.js";
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
.then(() => console.log("connected to redis"))
.catch(console.error);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}))

app.use("/api/auth/v1", userRoutes);
app.use("/api/message/v1", messageRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
