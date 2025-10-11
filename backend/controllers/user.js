import TryCatch from "../middleware/TryCatch.js"
import sanitize from "mongo-sanitize";
import { signupSchema } from "../config/zodvalidation.js"
import { redisClient } from "../index.js";
import { User } from "../models/user.model.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getVerifyEmailHtml } from "../config/html.js";
import sendMail from "../config/sendmail.js";

export const signupUser = TryCatch(async (req, res) => {
    
    const sanitizedBody = sanitize(req.body);

    const validation = signupSchema.safeParse(sanitizedBody);

    if(!validation.success){

        //////////////
        const zodError = validation.error;
        let firstErrorMessage = "Validation failed";
        let allerrors=[];
        if(zodError?.issues && Array.isArray(zodError.issues)){
            allerrors = zodError.issues.map((issue) => ({
                field: issue.path ? issue.path.join("."):"unknown",
                message: issue.message || "Validation Error",
                code:issue.code,
            }));
            firstErrorMessage = allerrors[0]?.message || "Validation Error";
        }
        return res.status(400).json({
            message: firstErrorMessage,
            error: allerrors
        })
        /////////////// 👉 This code formats and returns validation errors from Zod in a clean JSON format for frontend or API clients to easily display to users.
    }

    const {name, email, password} = validation.data;

    const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

    if(await redisClient.get(rateLimitKey)){
        return res.status(429).json({
            message:"too many request, slwo down lil nigga"
        })
    }

    const existingUser = await User.findOne({email})
    if(existingUser){
        return res.status(400).json({
            message:"User already exist"
        });
    }

    const hashPassword = await bcrypt.hash(password, 15);

    const verifyToken = crypto.randomBytes(32).toString("hex");
    
    const verifyKey = `verify:${verifyToken}`
    
    const dataToStore = JSON.stringify({
        name, 
        email,
        password: hashPassword,
    });

    await redisClient.set(verifyKey, dataToStore, {EX: 300});

    const subject = "verify your email for Acoount creation";
    const html = getVerifyEmailHtml({email, verifyToken});

    await sendMail({ email, subject, html});
    await redisClient.set(rateLimitKey, "true", {EX : 60});

    res.json({
        message: "If your email is vald, a verification link has been sent. It will expire in 5 minutes",
    });
});

export const verifyUser = TryCatch(async(req, res) => {
    const { token } = req.params;
})