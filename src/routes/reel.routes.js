import { Router } from "express";

// middlewares
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";

// controllers
import { createReel, deleteReel } from "../controllers/reel.controller.js";
import { commentOnReel, deleteCommentFromReel, editComment } from "../controllers/reel_comment.controller.js";
import { likeReel } from "../controllers/reel_like.controller.js";


const router = Router();
// add a new post
router.route("/create").post(
    verifyJWT,
    upload.fields([
        {name: "reels"},
    ]),
    createReel
)

// delete a post
router.route("/delete").post(
    verifyJWT,
    deleteReel
)

// like/dislike a post
router.route("/like").post(
    verifyJWT,
    likeReel
)

// comment on post
router.route("/comment").post(
    verifyJWT,
    commentOnReel
)

// edit a comment
router.route("/comment/edit").post(
    verifyJWT,
    editComment
)

// delete a comment
router.route("/comment/delete").post(
    verifyJWT,
    deleteCommentFromReel
)


export default router;