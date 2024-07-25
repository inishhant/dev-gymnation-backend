import mongoose from "mongoose";

import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Post_Comment } from "../models/post_comment.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function removeCommentFromAll(comment_id) {
  try {
    const result = await Post_Comment.updateMany(
      {}, // Match all documents
      { $pull: { comments: comment_id } }, // Pull the comment with the given ID
      { multi: true } // Update multiple documents
    );
  } catch (error) {
    throw new ApiError(409, "Unable to remove comment association");
  }
}

async function deleteCommentAndChildren(comment_id) {
    // Find the comment by its ID
    const comment = await Post_Comment.findById(comment_id);

    // Check if the comment has child comments
    if (comment.comments && comment.comments.length > 0) {
        for (let childCommentId of comment.comments) {
            // Recursively delete child comments
            await deleteCommentAndChildren(childCommentId);
        }
    }

    // Delete the parent comment
    await Post_Comment.findByIdAndDelete(comment_id);
}

const commentOnPost = asyncHandler(async (req, res) => {
  const { post_id, message, comment_id } = req.body;
  const user = await req.user;
  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(409, "User does not exist");
  }
  const post = await Post.findById(post_id);
  if (!post) {
    throw new ApiError(409, "Post does not exist");
  }

  const comment = await Post_Comment.create({
    message,
    user: user._id,
    post: post._id,
  });

  if (comment_id) {
    const replyToComment = await Post_Comment.findByIdAndUpdate(comment_id, {
      $push: {
        comments: comment._id,
      },
    });
    if (!replyToComment) {
      throw new ApiError(409, "Failed to reply on comment");
    }
  } else {
    const updatePost = await Post.findByIdAndUpdate(post_id, {
      $push: {
        comments: comment._id,
      },
    });
    if (!updatePost) {
      throw new ApiError(409, "Failed to add comment on post");
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const deleteCommentFromPost = asyncHandler(async (req, res) => {
  const { post_id, comment_id } = req.body;
  const user = await req.user;
  
  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(409, "User does not exist");
  }
  const comment = await Post_Comment.findById(comment_id);
  if (!comment) {
    throw new ApiError(409, "Comment does not exist");
  }
  const post = await Post.findById(post_id);
  if (!post) {
    throw new ApiError(409, "Post does not exist");
  }

  const updatePost = await Post.findByIdAndUpdate(post_id, {
    $pull: {
      comments: comment._id,
    },
  });
  if (!updatePost) {
    throw new ApiError(409, `Failed to delete comment from post: ${post._id}`);
  }

  const removeCommentAssociation = await removeCommentFromAll(comment._id);
  if(comment.comments && comment.comments.length>0){
    for (let curr_comment of comment.comments){
        const deleteChildComment = await deleteCommentAndChildren(curr_comment);
    }
  }
  const deleteComment = await Post_Comment.findByIdAndDelete(comment._id);
  if(!deleteComment){
    throw new ApiError(409, "Failed to delete comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment deleted successfully"));
});

const editComment = asyncHandler(async (req, res)=>{
  const { comment_id, message } = req.body;
  const updateComment = await Post_Comment.findByIdAndUpdate(
    comment_id,
    {
      $set: {
        message: message,
      }
    }
  );
  if(!updateComment){
    throw new ApiError(409, 'Unable to update comment');
  }

  const newComment = await Post_Comment.findById(comment_id);

  return res.status(201).json(new ApiResponse(200, newComment, "Updated comment successfully"))
})

export { commentOnPost, deleteCommentFromPost, editComment };
