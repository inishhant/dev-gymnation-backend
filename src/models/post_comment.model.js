import mongoose, { Schema } from "mongoose";

const postCommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post"
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post_Comment",
    }],
  },
  {
    timestamps: true,
  }
);

export const Post_Comment = mongoose.model("Post_Comment", postCommentSchema);
