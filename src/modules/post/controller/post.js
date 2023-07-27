import postModel from "../../../../DB/models/post.js";
import cloudinary from "../../../services/cloudinary.js";

export const addPostByPic = async (req, res) => {
  try {
    const { user } = req;
    const { caption } = req.body;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    if (!caption && !req.files.length) {
      return res.status(400).json({ message: "You to send any thing" });
    }
    const images = [];
    const imagesPublicIds = [];
    let post;
    if (req.files.length) {
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          {
            folder: `Posts/post/photos/${user._id}`,
          }
        );
        images.push(secure_url);
        imagesPublicIds.push(public_id);
      }
      post = await postModel.create({
        images,
        imagesPublicIds,
        date: new Date(),
        caption,
        userId: user._id,
      });
    } else if (!req.files.length) {
      post = await postModel.create({
        date: new Date(),
        caption,
        userId: user._id,
      });
    }
    if (post) {
      return res.status(201).json({ message: "Done", post });
    } else {
      if (req.files.length) {
        for (const id of imagesPublicIds) {
          await cloudinary.uploader.destroy(id);
        }
        return res.status(400).json({ message: "Fail to create new post" });
      }
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const updatePost = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { caption, imagesId } = req.body;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your account" });
    }
    const checkId = await postModel.findOne({ _id: id, userId: user._id });
    if (!checkId) {
      return res.status(404).json({ message: "In-valid post" });
    }
    if (checkId.deleted) {
      return res.status(400).json({ message: "You deleted this post" });
    }
    const finalImages = checkId.images;
    const finalImagesId = checkId.imagesPublicIds;
    const length = [];
    if (imagesId) {
      for (const image of finalImagesId) {
        for (const file of imagesId) {
          if (image === file) {
            if (length.includes(image)) {
              return res
                .status(400)
                .json({ message: "You sent the same id towice" });
            }
            length.push(image);
          }
        }
      }
      if (length.length === finalImagesId.length) {
        finalImages.splice(0);
        finalImagesId.splice(0);
      } else {
        return res.status(400).json({ message: "In-valid this imagesId" });
      }
    }
    const newImagesId = [];
    if (req.files.length) {
      if (finalImages.length + req.files.length > 8) {
        return res
          .status(400)
          .json({ message: "The max number of images is 8" });
      }
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          {
            folder: `Posts/post/photos/${user._id}`,
          }
        );
        finalImages.push(secure_url);
        finalImagesId.push(public_id);
        newImagesId.push(public_id);
      }
    }
    req.body.date = new Date();
    req.body.images = finalImages;
    req.body.imagesPublicIds = finalImagesId;
    if (caption) {
      req.body.caption = caption;
    } else {
      req.body.caption = checkId.caption;
    }
    const post = await postModel.findByIdAndUpdate(checkId._id, req.body, {
      new: true,
    });
    if (!post) {
      if (req.files.length) {
        for (const id of newImagesId) {
          await cloudinary.uploader.destroy(id);
        }
      }
      return res.status(400).json({ message: "Fail to update post" });
    } else {
      if (imagesId) {
        for (const image of imagesId) {
          await cloudinary.uploader.destroy(image);
        }
      }
      return res.status(200).json({ message: "Done", post });
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const softDelete = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    const checkId = await postModel.findOne({ _id: id, userId: user._id });
    if (!checkId) {
      return res.status(404).json({ message: "In-valid this post" });
    }
    let softDeletePost;
    if (checkId.deleted) {
      softDeletePost = await postModel.updateOne(
        { _id: checkId._id },
        { deleted: false }
      );
    } else {
      softDeletePost = await postModel.updateOne(
        { _id: checkId._id },
        { deleted: true }
      );
    }
    if (softDeletePost.modifiedCount) {
      return res.status(200).json({ message: "Done" });
    } else {
      return res.status(400).json({ message: "Fail to soft delete post" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const deletePost = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    if (user.deleted) {
      return req.status(400).json({ message: "You deeted your profile" });
    }
    const checkId = await postModel.findOne({ _id: id, userId: user._id });
    if (!checkId) {
      return res.status(404).json({ message: "In-valid this post" });
    }
    const deletePost = await postModel.deleteOne({ _id: checkId._id });
    if (deletePost.deletedCount) {
      for (const id of checkId.imagesPublicIds) {
        await cloudinary.uploader.destroy(id);
      }
      return res.status(200).json({ message: "Done" });
    } else {
      return res.status(400).json({ message: "Fail to delete post" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const like = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    const checkId = await postModel.findById(id);
    if (!checkId) {
      return res.status(404).json({ message: "In-valid post" });
    }
    if (checkId.deleted) {
      return res.status(400).json({ message: "This post has been deleted" });
    }
    const updatePost = await postModel.findOneAndUpdate(
      {
        _id: id,
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
    if (!updatePost) {
      return res.status(404).json({ message: "Already you liked this post" });
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
    const { id } = req.params;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    const checkId = await postModel.findById(id);
    if (!checkId) {
      return res.status(404).json({ message: "In-valid post" });
    }
    if (checkId.deleted) {
      return res.status(400).json({ message: "This post has been deleted" });
    }
    const updatePost = await postModel.findOneAndUpdate(
      {
        _id: id,
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
    if (!updatePost) {
      return res.status(404).json({ message: "Already you unliked this post" });
    } else {
      return res.status(200).json({ message: "Done" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const checkId = await postModel.findById(id);
    if (!checkId) {
      return res.status(404).json({ message: "In-valid post" });
    }
    if (checkId.deleted) {
      return res.status(404).json({ message: "This post has beet deleted" });
    }
    const url = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/post/${checkId._id}/sharelinkPost`;
    return res.status(200).json({ message: "Done", url });
  } catch (error) {
    res.json({ message: "Catch error", error });
  }
};
export const sharelinkPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postModel.findById(id);
    post
      ? res.json({ message: "Done", post })
      : res.json({ message: "In-valid post" });
  } catch (error) {
    res.json({ message: "Catch error", error });
  }
};
