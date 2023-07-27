import mongoose from "mongoose";
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    caption: { type: String },
    pictures: Array,
    Video: String,
    Likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    Unlikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    TotalCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);
const postModel = mongoose.model("Post", postSchema);
export default postModel
