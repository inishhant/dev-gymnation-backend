import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const likeSchema = new Schema(
  {
    listOfUserIdForPost: {
      type: Array,
    },
    listOfUserIdForReels: {
      type: Array,
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

export const Like = mongoose.model("Like", likeSchema);
