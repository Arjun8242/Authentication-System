import express from "express"
import { loginUser, logoutUser, myProfile, refreshCSRF, refreshToken, signupUser, verifyOtp, verifyUser } from "../controllers/user.js";
import { Auth } from "../middleware/auth.js";
import {verifyCSRFToken} from "../config/csrfMiddleware.js;"

const router = express.Router();

router.post("/register", signupUser);
router.post("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/verify", verifyOtp);
router.get("/me", Auth, myProfile);
router.post("/refresh", refreshToken);
router.post("/logout", Auth, verifyCSRFToken, logoutUser);
router.post("/refresh-csrf", Auth, refreshCSRF);

export default router;