import { userModel } from "../../../DB/model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nodeEmail } from "../../../service/sendemail.js";

export const signup = async (req, res, next) => {
  try{
  const { userName, email, password, gender } = req.body;
  const user = await userModel.findOne({ email }).select("email");
  if (user) {
    res.status(409).json({ message: "Email exist" });
  } else {
    const hash = bcrypt.hashSync(password, parseInt(process.env.SALTROUND));
    const newUser = new userModel({
      userName,
      email,
      password: hash,
      gender,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.emailToken, {
      expiresIn: "1h",
    });
    const rToken = jwt.sign({ id: newUser._id }, process.env.emailToken);
    const link1 = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}`;
    const link2 = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/refreshEmail/${rToken}`;
    const message = `
        <a href="${link1}">Confirm email</a>
        <br>
        <a href="${link2}">Request new Confirmation email</a>
        `;
    const info = await nodeEmail(newUser.email, "Confirm-email", message);
    if (info.accepted.length){
      const savedUser = await newUser.save();
      res.status(201).json({ message: "Done", userId: savedUser._id });
    } else {
      res.status(400).json({ message: "please enter correct email" });
    }
  }
}catch (error){
  res.status(500).json({message:"Catch error",error})
}
};
export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.emailToken);
    if (!decoded?.id) {
      res.status(400).json({ message: "in-valid token payload" });
    } else {
      const user = await userModel.updateOne(
        { _id: decoded.id, confirmEmail: false },
        {
          confirmEmail: true,
        }
      );

      user.modifiedCount
        ? res.status(200).json({ message: "Done plz login" })
        : res.status(400).json({ message: "Already confirmed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Catch error", error });
  }
};
export const requestreftoken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.emailToken);
    if (!decoded?.id) {
      res.status(400).json({ message: "In-valid token payload" });
    } else {
      const user = await userModel
        .findById(decoded.id)
        .select("firstName lastName confirmEmail");
      if (user?.confirmEmail) {
        res.status(400).json({ message: "Already confirmed" });
      } else {
        const token = jwt.sign({ id: user._id }, process.env.emailToken, {
          expiresIn: 60 * 5,
        });
        const url = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}`;

        const message = `
                  <a href ="${url}">
                   Follow me to confirm your account
                   </a>
                  `;
        sendemail(user.email, "Confirm Email", message);
        res.status(200).json({ message: "Done" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Catch error", error });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "user not exist" });
    } else {
      if (user.confirmEmail) {
        const match = bcrypt.compareSync(password, user.password);
        if (!match) {
          res.status(409).json({ message: "Your password misMatch" });
        } else {
          const token = jwt.sign(
            { id: user._id, isLoggedIn: true },
            process.env.tokenSignature,
            { expiresIn: 60 * 60 }
          );
          await userModel.updateOne({ _id: user._id }, { online: true });
          res.status(200).json({ message: "Done", token });
        }
      } else {
        res.status(400).json({ message: "please confirm your email" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Catch error", error });
  }
};
export const logOut = async (req, res) => {
  try {
    const user = await userModel
      .findOneAndUpdate(
        { _id: req.user._id, online: true },
        { online: false },
        { new: true }
      )
      .select("-password");
    user
      ? res.status(200).json({ message: "Done"})
      : res
          .status(404)
          .json({ message: "In-valid user token or this token expired" });
  } catch (error) {
    res.status(500).json({ message: "Catch error", error });
  }
};
