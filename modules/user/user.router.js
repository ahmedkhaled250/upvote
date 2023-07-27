import { Router } from "express";
import { auth } from "../../middlwear/auth.js";
import * as uc from "./controller/user.js";
import { HME, multerValidation, myMulter } from "../../service/clodMulter.js";
import { validation } from "../../middlwear/validation.js";
import * as validators from "./user.validation.js"
const router = Router();
router.get('/',uc.getAllUsers)
router.put("/updateprofile",validation(validators.updateProfile) ,auth(), uc.updateProfile);
router.patch("/softDelete",validation(validators.headers), auth(), uc.softdelete);
router.get("/profilePic",myMulter(multerValidation.image).single("file"),HME,validation(validators.headers),auth(),uc.profilePic);
router.get("/profile/coverPics",myMulter(multerValidation.image).array("file", 3),HME,validation(validators.headers),auth(),uc.coverPics);
export default router;
