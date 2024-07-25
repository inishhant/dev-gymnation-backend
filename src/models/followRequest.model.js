import mongoose, { Schema } from "mongoose";

const FollowRequestSchema = new Schema(
  {
    fromUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    toUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
  }
);

export const FollowRequest = mongoose.model("FollowRequest", FollowRequestSchema);
