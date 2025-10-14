import express from "express"
import { loginUser, logoutUser, myProfile, refreshToken, signupUser, verifyOtp, verifyUser } from "../controllers/user.js";
import { Auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", signupUser);
router.post("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/verify", verifyOtp);
router.get("/me", Auth, myProfile);
router.post("/refresh", refreshToken);
router.post("/logout", Auth, logoutUser);

export default router;