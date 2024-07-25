import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Reel } from "../models/reel.model.js";
import { Reel_Like } from "../models/reel_like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const likeReel = asyncHandler(async (req, res) => {
  const { reel_id } = req.body;
  const user = await req.user;
  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(409, "User does not exist");
  }

  const reel = await Reel.findById(reel_id);
  const reel_likes = await Reel_Like.findById(reel.likes);
  if (!reel_likes?.users?.includes(user._id)) {
    reel_likes.users.push(user._id);
    await reel_likes.save();
  } else {
    const dislikeReel = await Reel_Like.findByIdAndUpdate(
        reel.likes,
        {
            $pull: {
              users: user._id,
            }
          }
    );
    if (!dislikeReel) {
        throw new ApiError(409, "Some error occured while dislike");
    }
    return res
    .status(201)
    .json(new ApiResponse(200, reel_likes, "Reel disliked successfully"));
  }

  return res
    .status(201)
    .json(new ApiResponse(200, reel_likes, "Reel liked successfully"));
});

export { likeReel };
