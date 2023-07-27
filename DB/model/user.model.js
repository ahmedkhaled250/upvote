import { Schema, model } from "mongoose";
const userSchema = new Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, default: "Male", enum: ["Male", "Female"] },
    online: { type: Boolean, default: false },
    confirmEmail: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    profilePic: String,
    coverPics: Array,
  },
  {
    timestamps: true,
  }
);
export const userModel = model("User", userSchema);
