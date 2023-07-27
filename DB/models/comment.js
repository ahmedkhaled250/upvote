import { Schema, model } from "mongoose";
const commentSchema = new Schema(
  {
    text: {
      type: String,
    },
    image: String,
    imagePublicId: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nameReplayUser: String,
    linkReplayUserId: String,
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    Comment_type: {
      type: String,
      enum: ["reply", "comment"],
      default: "comment",
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    like: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    unLike: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    totalCount: { type: Number, default: 0 },
    date: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
commentSchema.post("findOneAndUpdate", async function () {
  const docToUpdate = await this.model.findOne({ _id: this.getQuery()._id });
  docToUpdate.totalCount = docToUpdate.like.length - docToUpdate.unLike.length;
  docToUpdate.save();
});
const commentModel = model("Comment", commentSchema);
export default commentModel;
