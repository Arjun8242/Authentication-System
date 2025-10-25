import crypto from "crypto";
import {redisClient} from "../index.js";

export const generateCSRFToken = async (userId, res) => {
    const csrfToken = crypto.randomBytes(32).toString("hex");

    const csrfkey = `csrf:${userId}`;

    await redisClient.setEx(csrfkey, 3600, csrfToken);

    res.cookie("csrfToken", csrfToken, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
        maxAge:60*60*1000,
    });

    return csrfToken;
}

export const verifyCSRFToken = async(req, res, next) => {
    try {
       if(req.method === "GET") {
        return next();
       } 

       const userId = req.user?._id;

       if(!userId){
        return res.status(401).json({
            message: "User not Authenticated",
        });
       }

       const clientToken = 
            req.headers["x-csrf-token"] ||
            req.headers["x-xsrf-token"] ||
            req.headers["csrf-token"];

        if(!clientToken){
            return res.status(403).json({
                message: "CSRF Token missing. Please refresh the page.",
                code:"CSRF_TOKEN_MISSING",
            });
        }

        const csrfKey = `csrf:${userId}`;

        const storedToken = await redisClient.get(csrfKey);

        if(!storedToken) {
            return res.status(403).json({
                message: "CSRF Token Expired. Please try again",
                code: "CSRF_TOKEN_EXPIRED",
            });
        }

        if(storedToken !== clientToken){
            return res.status(403).json({
                message:"Invalid CSRF Token. Please refresh the page.",
                code:"CSRF_TOKEN_INVALID",
            });
        }
        next();
    } catch (error) {
        console.log("CSRF verification error:", error);
        return res.status(500).json({
            message:"CSRF verification failed.",
            code:"CSRF_VERIFICATION_ERROR",
        });
    }
};

export const revokeCSRFToken = async(userId) => {
    const csrfKey = `csrf:${userId}`;

    await redisClient.del(csrfKey);
};

export const refreshCSRFToken = async(userId, res) => {
    await revokeCSRFToken(userId);

    return await generateCSRFToken(userId,res);
}
