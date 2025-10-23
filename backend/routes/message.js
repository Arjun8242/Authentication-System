import express from "express";
import { sendMessage } from "../controllers/message.js";

const router = express.Router();

router.get("/send", sendMessage);

export default router;