import mongoose, { Schema } from "mongoose";

const reelCommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reel: {
      type: Schema.Types.ObjectId,
      ref: "Reel"
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reel_Comment",
    }],
  },
  {
    timestamps: true,
  }
);

export const Reel_Comment = mongoose.model("Reel_Comment", reelCommentSchema);
