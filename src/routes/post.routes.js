import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createPost,
    deletePost
} from "../controllers/post.controller.js"
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/create").post(
    verifyJWT,
    upload.fields([
        {name: "images"},
        {name: "videos"},
    ]),
    createPost
)
router.route("/delete").post(
    verifyJWT,
    deletePost
)


export default router;