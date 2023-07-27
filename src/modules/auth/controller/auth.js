import userModel from "../../../../DB/models/user.js";
import bcrypt from "bcrypt";
import sendEmail from "../../../services/sendEmail.js";
import jwt from "jsonwebtoken";
export const signup = async (req, res, next) => {
  try {
    const { userName, email, password, age, phone, gender } = req.body;
    const checkEmail = await userModel.findOne({ email });
    if (checkEmail) {
      return res.status(409).json({ message: "This email is exist" });
    }
    const hashPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.SALTROUND)
    );
    const newUser = new userModel({
      userName,
      email,
      password: hashPassword,
      age,
      phone,
      gender,
    });
    const confirmToken = jwt.sign({ id: newUser._id }, process.env.EMAILTOKEN, {
      expiresIn: "1h",
    });
    const RefreshToken = jwt.sign({ id: newUser._id }, process.env.EMAILTOKEN);
    const confirmLink = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${confirmToken}`;
    const refreshLink = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/refreshToken/${RefreshToken}`;
    const message = `
    <a href='${confirmLink}'>Click here to confirm your email</a>
    <br>
    <a href = '${refreshLink}'>Click here to refresh token</a>
    `;
    const info = await sendEmail(newUser.email, "ConfirmEmail", message);
    if (!info?.accepted?.length) {
      return res.status(400).json({ message: "Please, Enter correct email" });
    }
    const savedUser = await newUser.save();
    return res.status(200).json({ message: "Done", savedUser });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  const checkEmail = await userModel.findOne({ email });
  if (!checkEmail) {
    return res.status(404).json({ message: "In-valid user" });
  }
  if (!checkEmail.confirmEmail) {
    return res.status(400).json({ message: "Please, Confirm your email" });
  }
  const match = bcrypt.compareSync(password, checkEmail.password);
  if (!match) {
    return res.status(400).json({ message: "This password miss match" });
  }
  const user = await userModel.updateOne(
    { _id: checkEmail._id },
    { active: true }
  );
  if (!user) {
    return res.status(400).json({ message: "Fail to login" });
  }
  const token = jwt.sign({ id: checkEmail._id }, process.env.TOKENSEGNITURE, {
    expiresIn: "1d",
  });

  return res.status(200).json({ message: "Done", token });
};
export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.EMAILTOKEN);
    if (!decoded?.id) {
      return res.status(400).json({ message: "In-valid token payload" });
    }
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "In-valid user" });
    }
    if (user.confirmEmail) {
      return res.status(409).json({ message: "Your email already confirmed" });
    }
    const confirmUser = await userModel.updateOne(
      { _id: user._id },
      { confirmEmail: true }
    );
    if (!confirmUser) {
      return res.status(400).json({ message: "Fail to confirm your email" });
    }
    return res
      .status(200)
      .json({ message: "Your email confirmed please, go to login" });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.EMAILTOKEN);
    if (!decoded?.id) {
      return res.status(400).json({ message: "In-valid token payload" });
    }
    const checkUser = await userModel.findById(decoded.id);
    if (!checkUser) {
      return res.status(404).json({ message: "In-valid user" });
    }
    if (checkUser.confirmEmail) {
      return res
        .status(409)
        .json({ message: "Your email is already confirmed" });
    }
    const confirmToken = jwt.sign(
      { id: checkUser._id },
      process.env.EMAILTOKEN,
      {
        expiresIn: 60 * 5,
      }
    );
    const link = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${confirmToken}`;
    const message = `
    <a href = '${link}'>Click here to confirm your email </a>
    `;
    await sendEmail(checkUser.email, "Confirm email", message);
    return res
      .status(200)
      .json({ message: "Please, go to confirm your email from your gmail" });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
export const logout = async (req, res) => {
  try {
    const { user } = req;
    const logout = await userModel.updateOne(
      { _id: user._id },
      { active: false }
    );
    if (!logout) {
      return res.status(404).json({ message: "In-valid user" });
    }
    return res.status(200).json({ message: "Done" });
  } catch (err) {
    return res.status(500).json({ message: "Catch error", err });
  }
};
