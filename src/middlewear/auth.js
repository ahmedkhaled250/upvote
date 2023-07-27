import jwt from "jsonwebtoken";
import userModel from "../../DB/models/user.js";
const auth = () => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      if (!authorization?.startsWith(process.env.BARRERKEY)) {
        return res.status(400).json({ message: "In-valid barer key" });
      }
      const token = authorization.split(process.env.BARRERKEY)[1];
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      const decoded = jwt.verify(token, process.env.TOKENSEGNITURE);
      if (!decoded?.id) {
        return res.status(400).json({ message: "In-valid token payload" });
      }
      const user = await userModel.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "In-valid user" });
      }
      if (!user.active) {
        return res.status(400).json({ message: "please, go to login" });
      }
      req.user = user;
      return next();
    } catch (err) {
      return res.status(500).json({ message: "Catch error", err });
    }
  };
};
export default auth;
