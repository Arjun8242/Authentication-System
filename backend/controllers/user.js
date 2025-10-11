import TryCatch from "../middleware/TryCatch.js"
import sanitize from "mongo-sanitize";
import { loginSchema, signupSchema } from "../config/zodvalidation.js"
import { redisClient } from "../index.js";
import { User } from "../models/user.model.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
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

    if(!token){
        return res.status(400).json({
            message:"Verification token is required"
        })
    }
    const verifyKey = `verify:${token}`;

    const userDataJson = await redisClient.get(verifyKey);
    if(!userDataJson){
        return res.status(400).json({
            message: "Verification link is expired",
        })
    }
    
    await redisClient.del(verifyKey);

    const UserData = JSON.parse(userDataJson)
    const existingUser = await User.findOne({
        email: UserData.email
    });

     if (existingUser) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  const newUser = await User.create({
    name: UserData.name,
    email: UserData.email,
    password: UserData.password,
  })

  return res.status(201).json({
    message: "Email verified succesfully! your account has been created",
    user: { 
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email
    }
  });
});

export const loginUser = TryCatch(async(req, res) => {
     const sanitizedBody = sanitize(req.body);

    const validation = loginSchema.safeParse(sanitizedBody);

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

    const {email, password} = validation.data;

    //ratelimit for otp

    const rateLimitKey = `login-rate-limit:${req.ip}:${email}`;

    if(await redisClient.get(rateLimitKey)){
        return res.status(429).json({
            message:"too many request, slwo down lil nigga"
        })
    }

    const user = await User.findOne({email});

    if(!user){
        return res.status(400).json({
            message:"Invalid credentials",
        });
    }

    const comparepassword = await bcrypt.compare(password, user.password);

    if(!comparepassword){
        return res.status(400).json({
            message: "Invalid credentials",
        });
    }
    const otp = Math.floor(100000 + Math.random() * 90000).toString();

    const otpkey = `otp${email}`;

    await redisClient.set(otpkey, JSON.stringify(otp), {
        EX: 300,
    });
    const subject = "Otp for verification";

    const html=  getOtpHtml({ email, otp});

    await sendMail({ email, subject, html});

    await redisClient.set(rateLimitKey, "true");
    
    return req.json({
        message: "if your email is vali, and otp has been sent. It will be valid for only 5 mins"
    });
});

export const verifyOtp = TryCatch(async(req, res) => {
    const {email, otp} = req.body;

    if(!email || !otp){
        return res.status(400).json({
            message: "please provide all details",
        })
    }

    const otpkey = `otp${email}`;

    const otpstoredstring = await redisClient.get(otpkey);

    if(otpstoredstring){
        return res.status(400).json({
            message: "Otp is expired",
        })
    }

    const otpstored = JSON.parse(otpstoredstring);

    if(otpstored!==otp){
        return res.status(400).json({
            message:"Wrong Otp",
        })
    }
    await redisClient.del(otpkey);

    let user = await User.findOne({email});
})