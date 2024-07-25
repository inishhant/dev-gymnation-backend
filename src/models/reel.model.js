import mongoose, { Schema } from "mongoose";

const reelSchema = new Schema({
  reel_url: [{
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
      ref: "Reel_Like",
    },
});

export const Reel = mongoose.model("Reel", reelSchema);
