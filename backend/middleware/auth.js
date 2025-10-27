import jwt from 'jsonwebtoken';
import { redisClient } from '../index.js';
import { User } from "../models/user.model.js";
import { generateAccessToken, isSessionActive, verifyRefreshToken } from '../config/generateToken.js';

export const Auth = async(req, res, next) => {
    try {
        let token = req.cookies.accessToken;

        if (!token) {
            const refreshToken = req.cookies.refreshToken;
            
            if (refreshToken) {
                const decodedRefresh = await verifyRefreshToken(refreshToken);
                if (decodedRefresh) {
                    generateAccessToken(decodedRefresh.id, decodedRefresh.sessionId, res);
                    token = req.cookies.accessToken;                    
                }
            }
        }

        if(!token){
            return res.status(401).json({
                message: "Please Login - no token?"
            });
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        if(!decodedData){
            return res.status(400).json({
                message:"token expired",
            });
        }

        const sessionActive = await isSessionActive(
            decodedData.id,
            decodedData.sessionId
        );

        if(!sessionActive){
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            res.clearCookie("csrfToken");

            return res.status(401).json({
                message: "Session Expired. You have been logged in from another device",
            });
        }
        
        const cacheUser = await redisClient.get(`user:${decodedData.id}`);

        if(cacheUser){
            req.user = JSON.parse(cacheUser);
            req.sessionId = decodedData.sessionId;
            return next();
        }

        const user = await User.findById(decodedData.id).select("-password");

        if(!user){
            return res.status(400).json({
                message:"No User with this id",
            });
        }

        await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user));

        req.user = user;
        next();

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        })
    }
}
export const authorizedAdmin = async( req, res, next) => {
    const user = req.user;

    if(user.role!== "admin"){
        return res.status(401).json({
            message: "You are not allowed for this acitvity",
        })
    }

    next();
}