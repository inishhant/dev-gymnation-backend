import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const commentSchema = new Schema(
  {
    comment: {
        type: String,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    reel: {
        type: Schema.Types.ObjectId,
        ref: "Reel"
    }
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model("Comment", commentSchema);
