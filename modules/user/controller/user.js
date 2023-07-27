import { userModel } from "../../../DB/model/user.model.js";
import cloudinary from "../../../service/cloudinary.js";
import { nodeEmail } from "../../../service/sendemail.js";
export const updateProfile = async (req, res) => {
  try {
    const { userName, email, password, gender } = req.body;
    const hashPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.SaltRound)
    );
    const user = await userModel.updateOne(
      { _id: req.user._id },
      {
        userName,
        email,
        password: hashPassword,
        gender,
      }
    );
    user?.modifiedCount
      ? res.status(201).json({ message: "Done", user })
      : res
          .status(400)
          .json({ message: "In-valid user token or this token expired" });
  } catch (error) {
    res.status(500).json({ message: "Catch error", error });
  }
};
export const softdelete = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user) {
      if (user.isDeleted) {
        const account = await userModel
          .findByIdAndUpdate(
            user._id,
            { isDeleted: false, online: true },
            { new: true }
          )
          .select("-password");
        res.status(200).json({ message: "Done", account });
      } else {
        const account = await userModel
          .findByIdAndUpdate(
            req.user._id,
            { isDeleted: true, online: false },
            { new: true }
          )
          .select("-password");
        res.status(200).json({ message: "Done", account });
      }
    } else {
      res
        .status(404)
        .json({ message: "In-valid user token or this token expired" });
    }
  } catch (error) {
    res.status(500).json({ message: "Catch error", error });
  }
};
export const profilePic = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "plz upload u file" });
    } else {
      const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `upvote/user/${req.user._id}/profile`,
      });
      const user = await userModel.findByIdAndUpdate(
        req.user._id,
        { profilePic: secure_url },
        {new:true}
      );
      if(user){
        res.status(200).json({message:"Done",user})
      }else{
        res.status(404).json({message:"In-valid user"})
      }
      res.json({ message: "User Module", user });
    }
  } catch (error) {
    res.status(500).json({ message: "Catch error", error });
  }
};
export const coverPics = async (req, res) => {
  try {
    if (!req.files) {
      res.status(400).json({ message: "plz upload u files" });
    } else {
      const images = [];
      for (const file of req.files) {
        const { secure_url } = await cloudinary.uploader.upload(file.path, {
          folder: `upvote/user/${req.user._id}/coverPic`,
        });
        images.push(secure_url);
      }
      const user = await userModel.findByIdAndUpdate(
        req.user._id,
        { coverPics: images },
        { new: true }
      );
      res.json({ message: "User Module", user });
    }
  } catch (error) {
    res.status(500).json({ message: "Catch error", error });
  }
};
export const getAllUsers = async (req, res) => {
  const users = await userModel.find({ gender: "Male" }).select("-password");
  res.status(200).json({ message: "Done", users });
};
