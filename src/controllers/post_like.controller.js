import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Post_Like } from "../models/post_like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const likePost = asyncHandler(async (req, res) => {
  const { post_id } = req.body;
  const user = await req.user;
  
  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(409, "Invalid user_id");
  }

  const post = await Post.findById(post_id);
  const post_likes = await Post_Like.findById(post.likes);
  if (!post_likes?.users?.includes(user._id)) {
    post_likes.users.push(user._id);
    await post_likes.save();
  } else {
    const dislikePost = await Post_Like.findByIdAndUpdate(
        post.likes,
        {
            $pull: {
              users: user._id,
            }
          }
    );
    if (!dislikePost) {
        throw new ApiError(409, "Some error occured while dislike");
    }
    return res
    .status(201)
    .json(new ApiResponse(200, post_likes, "Post disliked successfully"));
  }

  return res
    .status(201)
    .json(new ApiResponse(200, post_likes, "Post liked successfully"));
});

export { likePost };
