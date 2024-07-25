import mongoose from "mongoose";

import { User } from "../models/user.model.js";
import { Reel } from "../models/reel.model.js";
import { Reel_Comment } from "../models/reel_comment.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function removeReelsFromAll(reel_id) {
  try {
    const result = await Reel_Comment.updateMany(
      {}, // Match all documents
      { $pull: { reels: reel_id } }, // Pull the comment with the given ID
      { multi: true } // Update multiple documents
    );
  } catch (error) {
    throw new ApiError(409, "Unable to remove reel association");
  }
}

async function deleteReelsAndChildren(comment_id) {
  // Find the Reels by its ID
  const reel = await Reel_Comment(comment_id);

  // Check if the Reels has child Reels
  if (reel.reels && reel.reels.length > 0) {
    for (let childReelId of reel.reels) {
      // Recursively delete child Reels
      await deleteReelsAndChildren(childReelId);
    }
  }

  // Delete the parent comment
  await Reel_Comment.findByIdAndDelete(comment_id);
}

const commentOnReel = asyncHandler(async (req, res) => {
  const { reel_id, message, comment_id } = req.body;
  const user = await req.user;
  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(409, "User does not exist");
  }
  const reel = await Reel.findById(reel_id);
  if (!reel) {
    throw new ApiError(409, "Reel does not exist");
  }

  const comment = await Reel_Comment.create({
    message,
    user: user._id,
    reel: reel._id,
  });

  if (comment_id) {
    const replyToComment = await Reel_Comment.findByIdAndUpdate(comment_id, {
      $push: {
        comments: comment._id,
      },
    });
    if (!replyToComment) {
      throw new ApiError(409, "Failed to reply on comment");
    }
  } else {
    const updateReel = await Reel.findByIdAndUpdate(reel_id, {
      $push: {
        comments: comment._id,
      },
    });
    if (!updateReel) {
      throw new ApiError(409, "Failed to add comment on reel");
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const deleteCommentFromReel = asyncHandler(async (req, res) => {
  const { reel_id, comment_id } = req.body;
  const user = await req.user;

  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(409, "User does not exist");
  }
  const comment = await Reel_Comment.findById(comment_id);
  if (!comment) {
    throw new ApiError(409, "Comment does not exist");
  }
  const reel = await Reel.findById(reel_id);
  if (!reel) {
    throw new ApiError(409, "Reel does not exist");
  }

  const updateReel = await Reel.findByIdAndUpdate(reel_id, {
    $pull: {
      comments: comment._id,
    },
  });
  if (!updateReel) {
    throw new ApiError(409, `Failed to delete comment from reel: ${reel._id}`);
  }

  const removeCommentAssociation = await removeReelsFromAll(comment._id);
  if (comment.comments && comment.comments.length > 0) {
    for (let curr_comment of comment.comments) {
      const deleteChildComment = await deleteReelsAndChildren(curr_comment);
    }
  }
  const deleteComment = await Reel_Comment.findByIdAndDelete(comment._id);
  if (!deleteComment) {
    throw new ApiError(409, "Failed to delete comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment deleted successfully"));
});

const editComment = asyncHandler(async (req, res) => {
  const { comment_id, message } = req.body;
  const updateComment = await Reel_Comment.findByIdAndUpdate(comment_id, {
    $set: {
      message: message,
    },
  });
  if (!updateComment) {
    throw new ApiError(409, "Unable to update comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, updateComment, "Updated comment successfully"));
});

export { commentOnReel, deleteCommentFromReel, editComment };
