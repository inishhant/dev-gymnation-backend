import mongoose, { Schema } from "mongoose";

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
  likes:
    {
      type: Schema.Types.ObjectId,
      ref: "Post_Like",
    },
});

export const Post = mongoose.model("Post", postSchema);
