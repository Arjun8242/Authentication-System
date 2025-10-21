import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  ip: String,
  browser: String,
  os: String,
  platform: String,
  location: String,
  loggedAt: Date,
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, 
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, 
    },
    role: {
      type: String,
    //   enum: ["user", "admin"],
      default: "user",
    },
    devices: [deviceSchema],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
