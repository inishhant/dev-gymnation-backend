import mongoose, { Mongoose, Schema } from "mongoose";

const postLikeSchema = new Schema(
  {
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    }
  },
  {
    timestamps: true,
  }
);

export const Post_Like = mongoose.model("Post_Like", postLikeSchema);
