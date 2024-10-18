import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Story } from "../models/story.model.js";
import { Story_Like } from "../models/story_like.model.js";
import { Story_View } from "../models/story_view.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


async function deleteAssetsFromCloudinary(story_id) {
  try {
    const story = await Story.findById(story_id);
    if (story.story_url && story.story_url.length > 0) {
      for (let _story of story.story_url) {
        await deleteFromCloudinary(_story);
      }
    }
  } catch (err) {
    throw new ApiError(408, "Error deleting assets from cloudinary");
  }
}

const createStory = asyncHandler(async (req, res) => {
  const user = await req.user;
  const file = req.files;
  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(409, "User does not exist");
  }
  const story_files = file?.story && file?.story.length > 0 ? file.story : [];
  let stories = [];
  if (story_files && story_files.length > 0) {
    for (let story of story_files) {
      const data = await uploadOnCloudinary(story.path);
      console.log("data: ", data.url);
      stories.push(data.url);
    }
  }

  const story = await Story.create({
    story_url: stories,
    user: userExist._id,
  });
  const createdStory = await Story.findById(story._id);
  if (!createdStory) {
    throw new ApiError(500, "Something went wrong while creating the story.");
  }
  const createStoryLikes = await Story_Like.create({
    story: createdStory._id,
  });
  if (!createStoryLikes) {
    throw new ApiError(
      500,
      "Something went wrong while creating the Story likes record."
    );
  }
  const createStoryViews = await Story_View.create({
    story: createdStory._id,
  });
  if (!createStoryViews) {
    throw new ApiError(
      500,
      "Something went wrong while creating the story likes record."
    );
  }
  createdStory.likes = createStoryLikes._id;
  createdStory.views = createStoryViews._id;
  await createdStory.save();

  return res
    .status(201)
    .json(new ApiResponse(200, createdStory, "Story created Successfully"));
});

const deleteStory = asyncHandler(async (req, res) => {
  const { story_id } = req.body;
  const user = req.user;

  const isUser = await User.findById(user._id);
  if (!isUser) {
    throw new ApiError(404, "User does not exist");
  }

  const deleteAllViews = await Story_View.deleteMany({ story: story_id });
  const deleteAllLikes = await Story_Like.deleteMany({ story: story_id });
  const deleteAssets = await deleteAssetsFromCloudinary(story_id);

  const story = await Story.findByIdAndDelete(story_id);
  if (!story) {
    throw new ApiError(404, "Story not found");
  }
  
  return res
    .status(201)
    .json(new ApiResponse(200, "Story deleted successfully"));
});

const likeStory = asyncHandler(async (req, res) => {
  const { story_id } = req.body;
  const user = await req.user;

  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(409, "User does not exist");
  }

  const story = await Story.findById(story_id);
  const story_likes = await Story_Like.findById(story.likes);
  if (!story_likes?.users?.includes(user._id)) {
    story_likes.users.push(user._id);
    await story_likes.save();
  } else {
    const dislikeStory = await Story_Like.findByIdAndUpdate(story.likes, {
      $pull: {
        users: user._id,
      },
    });
    if (!dislikeStory) {
      throw new ApiError(409, "Some error occured while dislike");
    }
    return res
      .status(201)
      .json(new ApiResponse(200, story_likes, "Story disliked successfully"));
  }

  return res
    .status(201)
    .json(new ApiResponse(200, story_likes, "Story liked successfully"));
});

const viewStory = asyncHandler(async (req, res) => {
  const { story_id } = req.body;
  const user = await req.user;

  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(409, "User does not exist");
  }

  const story = await Story.findById(story_id);
  if (!story) {
    throw new ApiError(409, "Story does not exist");
  }

  const story_views = await Story_View.findById(story.views);
  if (!story_views?.users?.includes(user._id)) {
    story_views.users.push(user._id);
    await story_views.save();
  }

  return res
    .status(201)
    .json(new ApiResponse(200, story_views, "Story viewed successfully"));
});


export { createStory, deleteStory, likeStory, viewStory };