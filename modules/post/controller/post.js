import postModel from "../../../DB/model/post.model.js";
import { userModel } from "../../../DB/model/user.model.js";
import cloudinary from "../../../service/cloudinary.js";

export const addPost = async (req, res) => {
  try {
    const { title, caption } = req.body;
    if (!req.files) {
      res.status(400).json({ message: "image is required" });
    } else {
      const user = await userModel.findById(req.user._id);
      if (!user) {
        res.status(404).json({ message: "In-valid user" });
      } else {
        if (user.isDeleted) {
          res.status(400).json({ message: "your account is deleted" });
        } else {
          const images = [];
          for (const file of req.files) {
            const { secure_url } = await cloudinary.uploader.upload(file.path, {
              folder: `upvote/post/${user._id}`,
            });
            images.push(secure_url);
          }
          const post = new postModel({
            title,
            caption,
            pictures: images,
            createdBy: user._id,
          });
          const savedPost = await post.save();
          res.status(201).json({ message: "Done", savedPost });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Catch error", error });
  }
};
export const getAllPosts = async (req, res) => {
try {
  const users = await userModel.find({ isDeleted: false });
  const usersId = [];
  const posts = [];
  users.forEach((user) => {
    usersId.push(user._id);
  });
  if (usersId.length > 0) {
    for (let i = 0; i < usersId.length; i++) {
      const post = await postModel.find({ createdBy: usersId[i] }).populate({
        path:'createdBy',
        select:'-password'
      });
      posts.push(post);
      res.status(200).json({ message: "Done", posts });
    }
  } else {
    res.status(400).json({ message: "In-valid users have isDeleted = false" });
  }
} catch (error) {
  res.status(500).json({message:"Catch error",error})
}
};
export const likePost = async (req, res) => {
  const { id } = req.params;

  const post = await postModel.updateOne(
    { _id: id, likes: { $nin: req.user._id } },
    {
      $push: { likes: req.user._id },
      $pull: { unlike: req.user._id },
      $inc: { TotalCount: +1 },
    }
  );
  res.status(200).json({ message: "Done", post });
};
export const unlikePost = async (req, res) => {
  const { id } = req.params;

  const findPost = await postModel.findOne({
    _id: id,
    unlike: { $nin: req.user._id },
  });
  if (!findPost) {
    res.json({ message: "Alrady unlike" });
  } else {
    const post = await postModel.updateOne(
      { _id: id, unlike: { $nin: req.user._id } },
      {
        $push: { unlike: req.user._id },
        $pull: { likes: req.user._id },
        $inc: { TotalCount: -1 },
      }
    );

    res.status(200).json({ message: "Done", post });
  }
};
export const addVideo = async (req, res) => {
  try {
    const { title, caption } = req.body;
    if (!req.file) {
      res.status(400).json({ message: "video is required" });
    } else {
      const user = await userModel.findById(req.user._id);
      if (!user) {
        res.status(404).json({ message: "In-valid user" });
      } else {
        if (user.isDeleted) {
          res.status(400).json({ message: "your account is deleted" });
        } else {
            const  {secure_url} = await cloudinary.uploader.upload(req.file.path, {
              folder: `upvot/posts/video/${user._id}`,
            });
          const post = new postModel({
            title,
            caption,
            Video: secure_url,
            createdBy: user._id,
          });
          const savedPost = await post.save();
          res.status(201).json({ message: "Done", savedPost });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Catch error", error });
  }
};