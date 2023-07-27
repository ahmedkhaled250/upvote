import { Schema, model } from "mongoose";
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    code: String,
    age: Number,
    phone: String,
    gender: {
      type: String,
      default: "Male",
      enum: ["Male", "Female"],
    },
    profilePic: {
      type: String,
    },
    profilePublicId: {
      type: String,
    },
    coverPics: {
      type: [String],
    },
    covPublicIds: {
      type: [String],
    },
    reqFrinds:{
      type:[Schema.Types.ObjectId],
      ref:'User',
    },
    friends:{
      type:[Schema.Types.ObjectId],
      ref:'User',
    },
    active: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const userModel = model("User", userSchema);
export default userModel;
