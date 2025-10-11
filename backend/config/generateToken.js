import jwt from 'jsonwebtoken';
import { id } from 'zod/v4/locales';
import { redisClient } from '..';

export const generateToken = async(id, res) => {
    const accessToken = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken =jwt.sign({id}, process.env.REFRESH_SECRET, {
        expiresIn: "7d",
    });

    const refreshTokenKey = `refresh_token:${id}`;

    await redisClient.setEx(refreshToken, 7*24*60*60, refreshToken);

    res.cookie("access"{
        httpOnly
    })
}