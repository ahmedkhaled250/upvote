import { Router } from "express";
import * as postController from "./controller/comment.js";
import * as validators from "./comment.validation.js";
import { myMulter, HME, multerValidation } from "../../services/multer.js";
import auth from "../../middlewear/auth.js";
import validation from "../../middlewear/validation.js";
const router = Router({ mergeParams: true });
router.post(
  "/addComment",
  validation(validators.addComment),
  auth(),
  myMulter(multerValidation.image).single("image"),
  HME,
  postController.addComment
);
router.post(
  "/addReply",
  myMulter(multerValidation.image).single("image"),
  HME,
  validation(validators.addReply),
  auth(),
  postController.addReply
);
router.put(
  "/:replyId/updateReply",
  myMulter(multerValidation.image).single("image"),
  HME,
  validation(validators.updateReply),
  auth(),
  postController.updateReply
);
router.put(
  "/:commentId/updateComment",
  validation(validators.updateComment),
  auth(),
  myMulter(multerValidation.image).single("image"),
  HME,
  postController.updateComment
);
router.patch(
  "/:commentId/softDelete",
  validation(validators.tokenAndIds),
  auth(),
  postController.softDelete
);
router.delete(
  "/:commentId/delete",
  validation(validators.tokenAndIds),
  auth(),
  postController.deleteComment
);
router.patch(
  "/:commentId/like",
  validation(validators.tokenAndId),
  auth(),
  postController.like
);
router.patch(
  "/:commentId/unLike",
  validation(validators.tokenAndId  ),
  auth(),
  postController.unLike
);

export default router;
