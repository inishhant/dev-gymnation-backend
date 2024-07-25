import mongoose, { Schema } from "mongoose";

const followerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,  //  The user who is being followed
      ref: "User"
    },
    followerId: {
      type: Schema.Types.ObjectId,  // The user who follows
      ref: "User"
    }
  },
  {
    timestamps: true,
  }
);

export const Follower = mongoose.model("Follower", followerSchema);
