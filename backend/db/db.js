import mongoose from "mongoose"

export const connectdb = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI,{
            dbName: "authentication"
        });
        console.log("mongo db is connected");
        
    } catch (error) {
        console.log("failed to connect database")
    }
}

