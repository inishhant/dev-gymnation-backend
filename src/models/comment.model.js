import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const commentSchema = new Schema(
  {
    comment_id: {
      type: String,
    },
    comment: {
        type: String,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User"
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

commentSchema.methods.fieldExists = function (fieldName) {
  return this[fieldName];
};

commentSchema.pre("save", async function (next) {
  if (!this.fieldExists("_id")) this._id = uuidv4();
  next();
});

export const Comment = mongoose.model("Comment", commentSchema);
