import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Reel } from "../models/reel.model.js";
import { Reel_Like } from "../models/reel_like.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Reel_Comment } from "../models/reel_comment.model.js";

async function deleteAssetsFromCloudinary(reel_id) {
  try {
    const reel = await Reel.findById(reel_id);
    if (reel.reel_url && reel.reel_url.length > 0) {
      for (let _reel of reel.reel_url) {
        await deleteFromCloudinary(_reel);
      }
    }
  } catch (err) {
    throw new ApiError(408, "Error deleting assets from cloudinary");
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

  return res
    .status(201)
    .json(new ApiResponse(200, createdReel, "Reel created Successfully"));
});

const deleteReel = asyncHandler(async (req, res) => {
  const { reel_id } = req.body;
  const user = req.user;

  const isUser = await User.findById(user._id);
  if (!isUser) {
    throw new ApiError(404, "User does not exist");
  }

  const deleteAllComments = await Reel_Comment.deleteMany({reel: reel_id});
  const deleteAllLikes = await Reel_Like.deleteMany({reel: reel_id});
  const deleteAseets = await deleteAssetsFromCloudinary(reel_id);
  
  const reel = await Reel.findByIdAndDelete(reel_id);
  if (!reel) {
    throw new ApiError(404, "Reel not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "Reel deleted successfully"));
});

export { createReel, deleteReel };
