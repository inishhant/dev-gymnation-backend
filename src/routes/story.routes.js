import { Router } from "express";

// middlewares
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";

// controllers
import { createStory, deleteStory, likeStory, viewStory } from "../controllers/story.controller.js";


const router = Router();

// add a new story
router.route("/create").post(
    verifyJWT,
    upload.fields([
        {name: "story"}
    ]),
    createStory
)

// delete a story
router.route("/delete").post(
    verifyJWT,
    deleteStory
)

// like/dislike a story
router.route("/like").post(
    verifyJWT,
    likeStory
)

// view story
router.route("/view").post(
    verifyJWT,
    viewStory
)


export default router;