import jwt from 'jsonwebtoken';
import { redisClient } from '../index.js';
import { generateCSRFToken, revokeCSRFToken } from './csrfMiddleware.js';
import crypto from "crypto"

export const generateToken = async(id, res) => {
    const sessionId = crypto.randomBytes(16).toString("hex");

    const accessToken = jwt.sign({id, sessionId }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken =jwt.sign({id, sessionId }, process.env.REFRESH_SECRET, {
        expiresIn: "7d",
    });

    const refreshTokenKey = `refresh_token:${id}`;
    const activeSessionKey = `active_session:${id}`;
    const sessionDataKey = `session:${sessionId}`;

    const existingSessionId = await redisClient.get(activeSessionKey);
    if(existingSessionId){
        await redisClient.del(`session:${existingSessionId}`);
        await redisClient.del(`refresh_token:${id}`);
    }

    const sessionData = {
        userId: id,
        sessionId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
    };

    await redisClient.setEx(refreshTokenKey, 7*24*60*60, refreshToken);
    await redisClient.setEx(sessionDataKey,
        7*24*60*60,
        JSON.stringify(sessionData)
    );
    await redisClient.setEx(activeSessionKey, 7*24*60*60,
    sessionId);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction, // Only secure in production (HTTPS)
        sameSite: isProduction ? "none" : "lax", // "none" for production, "lax" for local
        maxAge: 15*60*1000,
        path: '/',
    })
    res.cookie("refreshToken", refreshToken, {
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        path: '/',
    });

    const csrfToken = await generateCSRFToken(id, res);

    return { accessToken, refreshToken, csrfToken, sessionId};
};

export const verifyRefreshToken = async(refreshToken) => {
    try {
        const decode = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        const storedToken = await redisClient.get(`refresh_token:${decode.id}`);

        if(storedToken !== refreshToken){
            return null;
        }

        const activeSessionId = await redisClient.get(`active_session:${decode.sessionId}`);

        if(activeSessionId !== decode.sessionId){
            return null;
        }
        
        const sessionData = await redisClient.get(`session:${decode.sessionId}`);

        if(!sessionData){
            return null;
        }

        const parsedSessionData = JSON.parse(sessionData);
        parsedSessionData.lastActivity = new Date().toISOString();

        await redisClient.setEx(`session:${decode.sessionId}`,
        7*24*60*60,
        JSON.stringify(parsedSessionData));

        return decode;

    } catch (error) {
        return null;
    }
}

export const generateAccessToken = (id, sessionId, res) => {
    const isProduction = process.env.NODE_ENV === 'production';

    const accessToken = jwt.sign({id, sessionId}, process.env.JWT_SECRET, {
        expiresIn: "15m",
    })
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 15*60*1000,
        path: '/',
    })
};

export const revokeRefreshToken = async(userId) => {
    const activeSessionId = await redisClient.get(`active_session:${userId}`)
    await redisClient.del(`refresh_token:${userId}`);
    await redisClient.del(`active_session:${userId}`);

    if(activeSessionId){
        await redisClient.del(`session:${activeSessionId}`);
    }
    await revokeCSRFToken(userId);
}

export const isSessionActive = async(userId, sessionId) => {
    const activeSessionId = await redisClient.get(`active_session:${userId}`);
    return activeSessionId === sessionId;
};
