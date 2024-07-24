import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPost = asyncHandler(async (req, res) => {
  const user = await req.user;
  const file = req.files;
  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(409, "Invalid user_id");
  }
  const post_images = file?.images[0];
  const post_videos =
    file?.videos && file?.videos.length > 0 ? file?.videos[0] : [];
  const images = await uploadOnCloudinary(post_images?.path);
  let videos;
  if (post_videos && post_videos.length > 0) {
    videos = await uploadOnCloudinary(post_videos?.path);
  }
  const post = await Post.create({
    image_url: images.url,
    video_url: videos && videos.url ? videos.url : "",
    user: userExist._id,
  });
  const createdPost = await Post.findById(post._id);
  if (!createdPost) {
    throw new ApiError(500, "Something went wrong while creating the post.");
  }
  const updateUserPosts = await User.findByIdAndUpdate(userExist._id, {
    $push: {
      posts: createdPost._id,
    },
  });
  if(!updateUserPosts){
    throw new ApiError(400, "Something went wrong while associating the post with user.")
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdPost, "Post created Successfully"));
});

export { createPost };
