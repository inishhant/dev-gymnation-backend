import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const likeSchema = new Schema(
  {
    likes_id: {
      type: String,
    },
    listOfUserIdForPost: {
      type: Array,
    },
    listOfUserIdForReels: {
      type: Array,
    },
    post_id: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    reel_id: {
        type: Schema.Types.ObjectId,
        ref: "Reel"
    }
  },
  {
    timestamps: true,
  }
);

likeSchema.methods.fieldExists = function (fieldName) {
  return this[fieldName];
};

likeSchema.pre("save", async function (next) {
  if (!this.fieldExists("_id")) this._id = uuidv4();
  next();
});

export const Like = mongoose.model("Like", likeSchema);
