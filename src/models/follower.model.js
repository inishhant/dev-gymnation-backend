import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const followerSchema = new Schema(
  {
    listOfUserId: {
        type: Array
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
  },
  {
    timestamps: true,
  }
);

export const Follower = mongoose.model("Follower", followerSchema);
