import { Schema, model } from "mongoose";
const postSchema = new Schema(
  {
    caption: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
    },
    imagesPublicIds: {
      type: [String],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
postSchema.post("findOneAndUpdate", async function () {
  const docToUpdate = await this.model.findOne({ _id: this.getQuery()._id });
  docToUpdate.totalCount = docToUpdate.like.length - docToUpdate.unLike.length;
  docToUpdate.save();
});
const postModel = model("Post", postSchema);
export default postModel;
