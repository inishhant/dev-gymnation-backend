import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const postSchema = new Schema({
  _id: {
    type: String,
  },
  image_url: {
    type: String,
  },
  video_url: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
  ],
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "like",
    },
  ],
});

postSchema.methods.fieldExists = function (fieldName) {
  return this[fieldName];
};

postSchema.pre("save", async function (next) {
  if (!this.fieldExists("_id")) this._id = uuidv4();
  next();
});

export const Post = mongoose.model("Post", postSchema);
