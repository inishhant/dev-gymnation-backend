import { Router } from "express";

// middlewares
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";

// controllers
import {
    createPost,
    deletePost
} from "../controllers/post.controller.js"
import { likePost } from "../controllers/post_like.controller.js";


const router = Router();
// add a new post
router.route("/create").post(
    verifyJWT,
    upload.fields([
        {name: "images"},
        {name: "videos"},
    ]),
    createPost
)

// delete a post
router.route("/delete").post(
    verifyJWT,
    deletePost
)

// like a post
router.route("/like").post(
    verifyJWT,
    likePost
)


export default router;