import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const postSchema = new Schema({
  image_url: [{
    type: String,
  }],
  video_url: [{
    type: String,
  }],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Like",
    },
  ],
});

export const Post = mongoose.model("Post", postSchema);
