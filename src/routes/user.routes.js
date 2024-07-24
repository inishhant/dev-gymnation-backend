import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    updatePassword, 
    updateAccountDetails,
    updateProfileImage
} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/register").post(upload.single("profile_image"),registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update-password").post(verifyJWT, updatePassword);
router.route("/update-account").post(verifyJWT, updateAccountDetails);
router.route("/update-profile-image").post(verifyJWT, upload.single("profile_image"), updateProfileImage);

export default router;
