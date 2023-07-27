import userModel from "../../../../DB/models/user.js";
import sendEmail from "../../../services/sendEmail.js";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../../../services/cloudinary.js";
export const updateProfile = async (req, res) => {
  try {
    const { userName, email, age, phone, gender } = req.body;
    const { user } = req;
    if (email) {
      if (user.email == email) {
        return res
          .status(409)
          .json({ message: "Already this email is your email" });
      }
      const checkEmail = await userModel.findOne({ email });
      if (checkEmail) {
        return res.status(409).json({ message: "This email is already exist" });
      }
      await userModel.updateOne(
        { _id: user._id },
        {
          active: false,
          confirmEmail: false,
        }
      );
      const token = jwt.sign({ id: user._id }, process.env.EMAILTOKEN, {
        expiresIn: "1h",
      });
      const tokenRefresh = jwt.sign({ id: user._id }, process.env.EMAILTOKEN);
      const link1 = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}`;
      const link2 = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/refreshToken/${tokenRefresh}`;
      const message = `
    <a href='${link1}'>Click here confirm your email</a>
    <br>
    <a href='${link2}'>Click here to refresh token</a>
    `;
      const info = await sendEmail(user.email, "Confirm email", message);
      if (!info?.accepted?.length) {
        return res.status(400).json({ message: "Please, enter correct email" });
      }
    }
    const updateUser = await userModel.findByIdAndUpdate(
      user._id,
      {
        userName,
        email,
        age,
        phone,
        gender,
      },
      {
        new: true,
      }
    );
    if (!updateUser) {
      return res.status(400).json({ message: "Fail to update user" });
    }
    return res.status(200).json({ message: "Done", user: updateUser });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, password } = req.body;
    const { user } = req;
    const match = bcrypt.compareSync(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "This password miss match" });
    }
    const hashPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.SALTROUND)
    );
    const updateUser = await userModel.updateOne(
      { _id: user._id },
      { password: hashPassword }
    );
    if (!updateUser?.modifiedCount) {
      return res.status(400).json({ message: "Fail to update password" });
    }
    return res.status(200).json({ message: "Done" });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const deleteProfile = async (req, res) => {
  try {
    const { user } = req;
    const dUser = await userModel.findByIdAndDelete(user._id);
    console.log(dUser);
    if (!dUser) {
      return res.status(400).json({ message: "Fail to delete user" });
    }
    return res.status(200).json({ message: "Done" });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const softDeleteProfile = async (req, res) => {
  try {
    const { user } = req;
    let updateUser;
    if (user.deleted) {
      updateUser = await userModel.findByIdAndUpdate(user._id, {
        deleted: false,
      });
    } else {
      updateUser = await userModel.findByIdAndUpdate(user._id, {
        deleted: true,
      });
    }
    if (!updateUser) {
      return res.status(400).json({ message: "Fail to softDelete user" });
    }
    return res.status(200).json({ message: "Done" });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const profile = async (req, res) => {
  try {
    const { user } = req;
    return res.status(200).json({ message: "Done", user });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const users = async (req, res) => {
  try {
    const users = await userModel.find();
    return res.status(200).json({ message: "Done", users });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const sendCode = async (req, res) => {
  try {
    const { email } = req.body;
    const checkEmail = await userModel.findOne({ email });
    if (!checkEmail) {
      return res.status(404).json({ message: "This email is not exist" });
    } else if (!checkEmail.confirmEmail) {
      return res.status(400).json({ message: "Please confirm your email" });
    }
    const code = nanoid();
    const message = `<h1>your code is :${code}</h1>`;
    await sendEmail(email, "Forget password", message);
    await userModel.updateOne({ _id: checkEmail._id }, { code });
    return res
      .status(200)
      .json({ message: "Please, Get your code from your email" });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const forgetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    const hashPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.SALTROUND)
    );
    const user = await userModel.findOneAndUpdate(
      { email, code },
      { code: null, password: hashPassword }
    );
    if (!user) {
      return res.status(404).json({ message: "This code is rong" });
    }
    return res.status(200).json({ message: "Done" });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const profilePic = async (req, res) => {
  try {
    const { user } = req;
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `Posts/user/profilePicter/${user._id}`,
      }
    );
    const updateUser = await userModel.findByIdAndUpdate(
      user._id,
      {
        profilePic: secure_url,
        profilePublicId: public_id,
      },
      {
        new: true,
      }
    );
    if (!updateUser) {
      await cloudinary.uploader.destroy(public_id);
      return res.status(400).json({ message: "Fail to update profile pictur" });
    }
    if (user.profilePic) {
      await cloudinary.uploader.destroy(user.profilePublicId);
    }
    return res.status(200).json({ message: "Done", user: updateUser });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const shareprofile = async (req, res) => {
  try {
    const { user } = req;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    const url = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/user/sharelinkprofile/${user._id}`;
    return res.status(200).json({ message: "Done", url });
  } catch (error) {
    res.json({ message: "Catch error", error });
  }
};
export const sharelinkprofile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel
      .findById(id)
      .select("userName email gender age phone");
    user
      ? res.json({ message: "Done", user })
      : res.json({ message: "In-valid account" });
  } catch (error) {
    res.json({ message: "Catch error", error });
  }
};
export const coverPic = async (req, res) => {
  try {
    const { imgId, imgUrl } = req.body;
    const { user } = req;
    if ((imgId && !imgUrl) || (!imgId && imgUrl)) {
      return res
        .status(400)
        .json({ message: "You've to send imgId and imgUrl together" });
    }
    if (!imgId && !imgUrl && !req.file) {
      return res.status(400).json({ message: "image is required" });
    }
    const images = user.coverPics;
    const imagesId = user.covPublicIds;
    let publicId;
    if (images.length > 1) {
      if (imgId && imgUrl) {
        const indexImag = images.indexOf(imgUrl);
        const indexImagId = imagesId.indexOf(imgId);
        if (indexImag == -1 || indexImagId == -1) {
          return res
            .status(400)
            .json({ message: "In-valid this imgUrl or imgId" });
        }
        images.splice(indexImag, 1);
        imagesId.splice(indexImagId, 1);
      }
    }
    if (images.length == 5) {
      return res.status(400).json({ message: "The max number of photos is 5" });
    }
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `Posts/user/coverPics/${user._id}`,
        }
      );
      publicId = public_id;
      images.push(secure_url);
      imagesId.push(public_id);
    }
    const updateUser = await userModel.findByIdAndUpdate(user._id, {
      coverPics: images,
      covPublicIds: imagesId,
    });
    if (!updateUser) {
      if (req.file) {
        await cloudinary.uploader.destroy(publicId);
      }
      return res.status(400).json({ message: "Fail to update cover pics" });
    } else {
      if (imgUrl) {
        await cloudinary.uploader.destroy(imgId);
      }
      return res.status(200).json({ message: "Done", user: updateUser });
    }
  } catch (err) {
    return res.status(500).json({ message: "Ctch error", err });
  }
};
export const reqForFriends = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { status } = req.body;
    if (user.deleted) {
      return res.status(400).json({ message: "You deleted your profile" });
    }
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const Status = status.toLowerCase();
    const checkId = await userModel.findById(id);
    if (user._id == id) {
      return res.status(400).json({ message: "You can't send for your self" });
    }
    if (!checkId) {
      return res.status(404).json({ message: "In-valid any user by this id" });
    }
    if (checkId.deleted) {
      return res.status(400).json({ message: "This account deleted" });
    }
    if (!checkId.confirmEmail) {
      return res.status(400).json({ message: "This user has to be confirmed" });
    }

    let reqFrind;
    if (Status == "add") {
      if (checkId.reqFrinds.includes(user._id)) {
        return res
          .status(409)
          .json({ message: "Already you sent add for this account" });
      }
      reqFrind = await userModel.findByIdAndUpdate(
        id,
        {
          $push: { reqFrinds: user._id },
        },
        {
          new: true,
        }
      );
    } else if (Status == "remove") {
      if (!checkId.reqFrinds.includes(user._id)) {
        return res
          .status(409)
          .json({ message: "Already you didn't sent add for this account" });
      }
      reqFrind = await userModel.findByIdAndUpdate(
        id,
        {
          $pull: { reqFrinds: user._id },
        },
        {
          new: true,
        }
      );
    } else {
      return res.status(400).json({ message: "Not found this result" });
    }

    if (!reqFrind) {
      return res
        .status(400)
        .json({ message: "Fail to add this user as friend" });
    }
    return res.status(200).json({ message: "Done" });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const acceptNewFrinds = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const Status = status.toLowerCase();
    const checkId = await userModel.findById(id);
    if (!user.reqFrinds.includes(checkId._id)) {
      return res
        .status(400)
        .json({ message: "This account didn't send you any req" });
    }

    let acceptFrind;
    if (Status == "accept") {
      if (
        checkId.friends.includes(user._id) &&
        user.friends.includes(checkId._id)
      ) {
        return res
          .status(409)
          .json({ message: "Already you are a friend for this account" });
      }
      acceptFrind = await userModel.updateOne(
        { _id: id },
        {
          $push: { friends: user._id },
        }
      );
      acceptFrind = await userModel.updateOne(
        { _id: user._id },
        {
          $pull: { reqFrinds: id },
          $push: { friends: id },
        }
      );
    } else if (Status == "refused") {
      acceptFrind = await userModel.updateOne(
        { _id: user._id },
        {
          $pull: { reqFrinds: checkId._id },
        }
      );
    } else {
      return res.status(400).json({ message: "Not found this result" });
    }

    if (!acceptFrind.modifiedCount) {
      return res
        .status(400)
        .json({ message: "Fail to add this user as friend" });
    }
    return res.status(200).json({ message: "Done", acceptFrind });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
