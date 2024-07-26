import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Post_Like } from "../models/post_like.model.js";
import { Post_Comment } from "../models/post_comment.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
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
  const post_images = file?.images;
  const post_videos =
    file?.videos && file?.videos.length > 0 ? file?.videos : [];
  let images = [];
  for (let img of post_images) {
    const data = await uploadOnCloudinary(img.path);
    images.push(data.url);
  }

  let videos = [];
  if (post_videos && post_videos.length > 0) {
    for (let vdo of post_videos) {
      const data = await uploadOnCloudinary(vdo.path);
      videos.push(data.url);
    }
  }
  const post = await Post.create({
    image_url: images,
    video_url: videos,
    user: userExist._id,
  });
  const createdPost = await Post.findById(post._id);
  if (!createdPost) {
    throw new ApiError(500, "Something went wrong while creating the post.");
  }
  const createPostLike = await Post_Like.create({
    post: createdPost._id,
  });
  if (!createPostLike) {
    throw new ApiError(
      500,
      "Something went wrong while creating the post likes record."
    );
  }
  createdPost.likes = createPostLike._id;
  await createdPost.save();
  const updateUserPosts = await User.findByIdAndUpdate(userExist._id, {
    $push: {
      posts: createdPost._id,
    },
  });
  if (!updateUserPosts) {
    throw new ApiError(
      400,
      "Something went wrong while associating the post with user."
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdPost, "Post created Successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  const { post_id } = req.body;
  const user = req.user;

  const deleteAllComments = await Post_Comment.deleteMany({ post: post_id });
  const deleteAllLikes = await Post_Like.deleteMany({ post: post_id });

  const post = await Post.findByIdAndDelete(post_id);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const updateUserPosts = await User.findByIdAndUpdate(user._id, {
    $pull: {
      posts: post_id,
    },
  });
  if (!updateUserPosts) {
    throw new ApiError(400, "Something went wrong while deleting the post");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, "Post deleted successfully"));
});

export { createPost, deletePost };
