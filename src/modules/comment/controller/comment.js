import commentModel from "../../../../DB/models/comment.js";
import postModel from "../../../../DB/models/post.js";
import userModel from "../../../../DB/models/user.js";
import cloudinary from "../../../services/cloudinary.js";

export const addComment = async (req, res) => {
  try {
    const { user } = req;
    const { postId } = req.params;
    const { text } = req.body;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    const checkPostId = await postModel.findById(postId);
    if (!checkPostId) {
      return res.status(404).json({ message: "In-valid post" });
    } else if (checkPostId.deleted) {
      return res.status(400).json({ message: "this post is already deleted" });
    }
    if (!text && !req.file) {
      return res.status(400).json({ message: "You've to send any thing" });
    }
    let comment;
    let publicId;
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `Posts/comment/${user._id}/post/${checkPostId._id}`,
        }
      );
      publicId = public_id;
      comment = await commentModel.create({
        image: secure_url,
        imagePublicId: public_id,
        date: new Date(),
        text,
        userId: user._id,
        postId: checkPostId._id,
      });
    } else if (!req.file) {
      comment = await commentModel.create({
        date: new Date(),
        text,
        userId: user._id,
        postId: checkPostId._id,
      });
    }
    if (comment) {
      return res.status(201).json({ message: "Done", comment });
    } else {
      if (req.file) {
        await cloudinary.uploader.destroy(publicId);
        return res.status(400).json({ message: "Fail to create new comment" });
      }
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const updateComment = async (req, res) => {
  try {
    const { user } = req;
    const { commentId, postId } = req.params;
    const { text, imageId } = req.body;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your account" });
    }
    const checkCommentId = await commentModel.findOne({
      _id: commentId,
      userId: user._id,
      postId,
    });
    if (!checkCommentId) {
      return res.status(404).json({ message: "In-valid post" });
    }
    if (checkCommentId.deleted) {
      return res.status(400).json({ message: "You deleted this comment" });
    }
    if (checkCommentId.imagePublicId != imageId) {
      return res.stat(400).json({ message: "In-valid this imageId" });
    }
    let publicId;
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `Posts/comment/${user._id}/post/${postId}`,
        }
      );
      req.body.image = secure_url;
      req.body.imagePublicId = public_id;
      publicId = public_id;
    } else if (imageId) {
      req.body.image = null;
      req.body.imagePublicId = null;
    }
    if (text) {
      req.body.text = text;
    }
    req.body.date = new Date();
    const updateComment = await commentModel.findByIdAndUpdate(
      checkCommentId._id,
      req.body,
      {
        new: true,
      }
    );
    if (!updateComment) {
      if (req.file) {
        await cloudinary.uploader.destroy(publicId);
      }
      return res.status(400).json({ message: "Fail to update comment" });
    } else {
      if (req.file) {
        await cloudinary.uploader.destroy(checkCommentId.imagePublicId);
      }
      if (imageId) {
        await cloudinary.uploader.destroy(imageId);
      }
      return res.status(200).json({ message: "Done", updateComment });
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const softDelete = async (req, res) => {
  try {
    const { user } = req;
    const { postId, commentId } = req.params;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    const checkCommentId = await commentModel.findOne({
      _id: commentId,
      postId,
      userId: user._id,
    });
    if (!checkCommentId) {
      return res.status(404).json({ message: "In-valid this comment" });
    }
    let softDeletePost;
    if (checkCommentId.deleted) {
      softDeletePost = await commentModel.updateOne(
        { _id: checkCommentId._id },
        { deleted: false }
      );
    } else {
      softDeletePost = await commentModel.updateOne(
        { _id: checkCommentId._id },
        { deleted: true }
      );
    }
    if (softDeletePost.modifiedCount) {
      return res.status(200).json({ message: "Done" });
    } else {
      return res.status(400).json({ message: "Fail to soft delete comment" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const deleteComment = async (req, res) => {
  try {
    const { user } = req;
    const { commentId } = req.params;
    if (user.deleted) {
      return req.status(400).json({ message: "You deeted your profile" });
    }
    const checkCommentId = await commentModel.findOne({
      _id: commentId,
      userId: user._id,
    });
    if (!checkCommentId) {
      return res.status(404).json({ message: "In-valid this comment" });
    }
    const deleteComment = await commentModel.deleteOne({
      _id: checkCommentId._id,
    });
    if (deleteComment.deletedCount) {
      await cloudinary.uploader.destroy(checkCommentId.imagePublicId);
      return res.status(200).json({ message: "Done" });
    } else {
      return res.status(400).json({ message: "Fail to delete comment" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const like = async (req, res) => {
  try {
    const { user } = req;
    const { commentId } = req.params;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    const checkCommentId = await commentModel.findOne({
      _id: commentId,
    });
    if (!checkCommentId) {
      return res.status(404).json({ message: "In-valid comment" });
    }
    if (checkCommentId.deleted) {
      return res.status(400).json({ message: "This comment has been deleted" });
    }
    const updateComment = await commentModel.findOneAndUpdate(
      {
        _id: checkCommentId._id,
        like: { $nin: user._id },
      },
      {
        $addToSet: { like: user._id },
        $pull: { unLike: user._id },
      },
      {
        new: true,
      }
    );
    if (!updateComment) {
      return res
        .status(404)
        .json({ message: "Already you liked this comment" });
    } else {
      return res.status(200).json({ message: "Done" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const unLike = async (req, res) => {
  try {
    const { user } = req;
    const { commentId } = req.params;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    const checkCommentId = await commentModel.findOne({
      _id: commentId,
    });
    if (!checkCommentId) {
      return res.status(404).json({ message: "In-valid comment" });
    }
    if (checkCommentId.deleted) {
      return res.status(400).json({ message: "This comment has been deleted" });
    }
    const updateComment = await commentModel.findOneAndUpdate(
      {
        _id: checkCommentId._id,
        unLike: { $nin: user._id },
      },
      {
        $addToSet: { unLike: user._id },
        $pull: { like: user._id },
      },
      {
        new: true,
      }
    );
    if (!updateComment) {
      return res
        .status(404)
        .json({ message: "Already you liked this comment " });
    } else {
      return res.status(200).json({ message: "Done" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const addReply = async (req, res) => {
  try {
    const { user } = req;
    const { text, commentId } = req.body;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    const checkCommentId = await commentModel.findById(commentId);
    if (!checkCommentId) {
      return res.status(404).json({ message: "In-valid comment" });
    } else if (checkCommentId.deleted) {
      return res
        .status(400)
        .json({ message: "this comment is already deleted" });
    }
    const getReplyUserId = await userModel
      .findById(checkCommentId.userId)
      .select("userName");
    const nameReplyUser = getReplyUserId.userName;
    const linkReplyUserId = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/user/sharelinkprofile/${checkCommentId.userId}`;
    if (!text && !req.file) {
      return res.status(400).json({ message: "You've to send any thing" });
    }
    let reply;
    let publicId;
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `Posts/reply/${user._id}/${checkCommentId._id}`,
        }
      );
      publicId = public_id;
      reply = await commentModel.create({
        image: secure_url,
        imagePublicId: public_id,
        date: new Date(),
        text,
        nameReplyUser,
        linkReplyUserId,
        userId: user._id,
        commentId: checkCommentId._id,
        Comment_type: "reply",
      });
    } else if (!req.file) {
      reply = await commentModel.create({
        date: new Date(),
        text,
        nameReplyUser,
        linkReplyUserId,
        userId: user._id,
        commentId: checkCommentId._id,
        Comment_type: "reply",
      });
    }
    if (reply) {
      return res.status(201).json({ message: "Done", reply });
    } else {
      if (req.file) {
        await cloudinary.uploader.destroy(publicId);
        return res.status(400).json({ message: "Fail to create new reply" });
      }
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const updateReply = async (req, res) => {
  try {
    const { user } = req;
    const { replyId } = req.params;
    const { text, commentId, imageId } = req.body;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    const checkReplyId = await commentModel.findOne({
      _id: replyId,
      commentId,
      userId: user._id,
    });
    if (!checkReplyId) {
      return res.status(404).json({ message: "In-valid reply" });
    } else if (checkReplyId.deleted) {
      return res.status(400).json({ message: "You deleted this reply" });
    }
    if (imageId) {
      if (checkReplyId.imagePublicId != imageId) {
        return res.status(400).json({ message: "In-valid this imageId" });
      }
    }
    let publicId;
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `Posts/reply/${user._id}/${commentId}`,
        }
      );
      publicId = public_id;
      req.body.image = secure_url;
      req.body.imagePublicId = public_id;
    } else if (imageId) {
      req.body.image = null;
      req.body.imagePublicId = null;
    }
    if (text) {
      req.body.text = text;
    }
    req.body.date = new Date();
    const reply = await commentModel.findByIdAndUpdate(
      checkReplyId._id,
      req.body,
      { new: true }
    );
    if (reply) {
      if (req.file || imageId) {
        cloudinary.uploader.destroy(checkReplyId.imagePublicId);
      }
      return res.status(201).json({ message: "Done", reply });
    } else {
      if (req.file) {
        await cloudinary.uploader.destroy(publicId);
      }
      return res.status(400).json({ message: "Fail to create new reply" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
