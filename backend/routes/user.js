import express from "express"
import { loginUser, signupUser, verifyUser } from "../controllers/user.js";

const router = express.Router();

router.post("/register", signupUser);
router.post("/verify/:token", verifyUser);
router.post("login", loginUser);

export default router;