import { Router } from "express";
import { auth } from "../../middlwear/auth.js";
import * as validators from "./post.validation.js";
import { HME, multerValidation, myMulter } from "../../service/clodMulter.js";
import * as pc from "./controller/post.js";
import { validation } from "../../middlwear/validation.js";
const router = Router();
router.post(
  "/",
  myMulter(multerValidation.image).array("file", 3),
  HME,
  validation(validators.addPost),
  auth(),
  pc.addPost
);
router.post(
  "/addVideo",
  myMulter(multerValidation.video).single("file"),
  HME,
  validation(validators.addPost),
  auth(),
  pc.addVideo
);
router.get("/", pc.getAllPosts);
router.patch("/:id/like", validation(validators.like), auth(), pc.likePost);
router.patch("/:id/unlike", validation(validators.like), auth(), pc.unlikePost);
export default router;
