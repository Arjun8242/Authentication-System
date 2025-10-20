import express from "express"
import { adminController, forgotPassword, loginUser, logoutUser, myProfile, refreshCSRF, refreshToken, resetPassword, signupUser, verifyOtp, verifyUser } from "../controllers/user.js";
import { Auth, authorizedAdmin } from "../middleware/auth.js";
import {verifyCSRFToken} from "../config/csrfMiddleware.js"

const router = express.Router();

router.post("/register", signupUser);
router.post("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/verify", verifyOtp);
router.post("/user/forgot-password", forgotPassword);
router.post("/user/reset-password/:token", resetPassword);
router.get("/me", Auth, myProfile);
router.post("/refresh", refreshToken);
router.post("/logout", Auth, verifyCSRFToken, logoutUser);
router.post("/refresh-csrf", Auth, refreshCSRF);
router.get("/admin", Auth, authorizedAdmin, adminController);

export default router;