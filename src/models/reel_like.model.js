import mongoose, { Mongoose, Schema } from "mongoose";

const reelLikeSchema = new Schema(
  {
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    reel: {
        type: Schema.Types.ObjectId,
        ref: "Reel",
        required: true
    }
  },
  {
    timestamps: true,
  }
);

export const Reel_Like = mongoose.model("Reel_Like", reelLikeSchema);
