import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const followerSchema = new Schema(
  {
    follower_id: {
      type: String,
    },
    listOfUserId: {
        type: Array
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
  },
  {
    timestamps: true,
  }
);

followerSchema.methods.fieldExists = function (fieldName) {
  return this[fieldName];
};

followerSchema.pre("save", async function (next) {
  if (!this.fieldExists("_id")) this._id = uuidv4();
  next();
});

export const Follower = mongoose.model("Follower", followerSchema);
