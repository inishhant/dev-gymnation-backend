import mongoose from "mongoose";
import axios from "axios";
import { User } from "../models/user.model.js";
import { Reel } from "../models/reel.model.js";
import { Reel_Like } from "../models/reel_like.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Reel_Comment } from "../models/reel_comment.model.js";

async function deleteComments(reel_id, userCookies) {
  try {
    const reel_data = await Reel.findById(reel_id);
    if (reel_data) {
      for (let comment of reel_data.comments) {
        try {
          const reelComment = await Reel_Comment.findById(comment);
          if (reelComment) {
            const d = await axios.post(
              `${process.env.LOCAL_URL}reels/comment/delete`,
              {
                reel_id,
                comment_id: comment,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Cookie: userCookies,
                },
                withCredentials: true,
              }
            );
          }
        } catch (err) {
          throw new ApiError(409, `Error deleting comment: ${comment}`);
        }
      }
    }
  } catch (err) {
    throw new ApiError(409, "Unable to delete all comments");
  }
}

async function deleteLikes(reel_id) {
  try {
    const reel_data = await Reel.findById(reel_id);
    const like = await Reel_Like.findByIdAndDelete(reel_data.likes);
    return true;
  } catch (err) {
    throw new ApiError(409, `Error deleting like: ${like_id}`);
  }
}

const createReel = asyncHandler(async (req, res) => {
  const user = await req.user;
  const file = req.files;
  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(409, "User does not exist");
  }
  const reel_videos = file?.reels && file?.reels.length > 0 ? file.reels : [];
  let videos = [];
  if (reel_videos && reel_videos.length > 0) {
    for (let vdo of reel_videos) {
      const data = await uploadOnCloudinary(vdo.path);
      console.log("data: ", data.url);
      videos.push(data.url);
    }
  }

  const reel = await Reel.create({
    reel_url: videos,
    user: userExist._id,
  });
  const createdReel = await Reel.findById(reel._id);
  if (!createdReel) {
    throw new ApiError(500, "Something went wrong while creating the Reel.");
  }
  const createReelLike = await Reel_Like.create({
    reel: createdReel._id,
  });
  if (!createReelLike) {
    throw new ApiError(
      500,
      "Something went wrong while creating the Reel likes record."
    );
  }
  createdReel.likes = createReelLike._id;
  await createdReel.save();
  const updateUserReels = await User.findByIdAndUpdate(userExist._id, {
    $push: {
      reels: createdReel._id,
    },
  });
  if (!updateUserReels) {
    throw new ApiError(
      400,
      "Something went wrong while associating the Reel with user."
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdReel, "Reel created Successfully"));
});

const deleteReel = asyncHandler(async (req, res) => {
  const { reel_id } = req.body;
  const user = req.user;
  const userCookies = req.headers.cookie;

  const isUser = await User.findById(user._id);
  if (!isUser) {
    throw new ApiError(404, "User does not exist");
  }

  const deleteAllComments = await deleteComments(reel_id, userCookies);
  const deleteAllLikes = await deleteLikes(reel_id);

  const reel = await Reel.findByIdAndDelete(reel_id);
  if (!reel) {
    throw new ApiError(404, "Reel not found");
  }

  const updateUserReels = await User.findByIdAndUpdate(user._id, {
    $pull: {
      reels: reel_id,
    },
  });
  if (!updateUserReels) {
    throw new ApiError(400, "Something went wrong while deleting the reel");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, "Reel deleted successfully"));
});

export { createReel, deleteReel };
