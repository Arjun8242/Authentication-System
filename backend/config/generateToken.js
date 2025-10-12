import jwt from 'jsonwebtoken';
import { redisClient } from '../index.js';

export const generateToken = async(id, res) => {
    const accessToken = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken =jwt.sign({id}, process.env.REFRESH_SECRET, {
        expiresIn: "7d",
    });

    const refreshTokenKey = `refresh_token:${id}`;

    await redisClient.setEx(refreshTokenKey, 7*24*60*60, refreshToken);

    res.cookie("accessToken", {
        httpOnly: true,
        // secure: true,
        sameSite: "strict",// to avoid csrf attck
        maxAge: 1*60*1000,
    })
    res.cookie("refreshToken", {
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
        sameSite: "none",
        //secure: true,
    });

    return { accessToken, refreshToken };
};

export const verifyRefreshToken = async(refreshToken) => {
    try {
        const decode = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        const storedToken = await redisClient.get(`refresh_token:${decode.id}`);

        if(storedToken === refreshToken){
            return decode;
        }
        return null;

    } catch (error) {

        return null;
    }
}

export const generateAccessToken = (id, res) => {
    const accessToken = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "2m",
    })
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        // secure: true,
        sameSite: "strict",// to avoid csrf attck
        maxAge: 1*60*1000,
    })
};

export const revokeRefreshToken = async(userId) => {
    await redisClient.del(`refresh_token:${userId}`);
}