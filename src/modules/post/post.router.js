import { Router } from "express";
import * as postController from "./controller/post.js";
import * as validators from "./post.validation.js";
import { myMulter, HME, multerValidation } from "../../services/multer.js";
import auth from "../../middlewear/auth.js";
import validation from "../../middlewear/validation.js";
import commentRouter from "../comment/comment.router.js"
const router = Router();
router.use('/:postId/comment',commentRouter)
router.post(
  "/",
  validation(validators.createPost),
  auth(),
  myMulter(multerValidation.image).array("images", 8),
  HME,
  postController.addPostByPic
);
router.put(
  "/:id",
  validation(validators.updatePost),
  auth(),
  myMulter(multerValidation.image).array("images", 8),
  HME,
  postController.updatePost
);
router.patch(
  "/:id/softDelete",
  validation(validators.tokenAndId),
  auth(),
  postController.softDelete
);
router.delete(
  "/:id/delete",
  validation(validators.tokenAndId),
  auth(),
  postController.deletePost
);
router.patch(
  "/:id/like",
  validation(validators.tokenAndId),
  auth(),
  postController.like
);
router.patch(
  "/:id/unLike",
  validation(validators.tokenAndId),
  auth(),
  postController.unLike
);
router.get(
  "/:id/sharePost",
  validation(validators.id),
  postController.sharePost
);
router.get(
  "/:id/sharelinkPost",
  validation(validators.id),
  postController.sharelinkPost
);

export default router;
