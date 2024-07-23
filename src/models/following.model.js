import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const followingSchema = new Schema(
  {
    following_id: {
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

followingSchema.methods.fieldExists = function (fieldName) {
  return this[fieldName];
};

followingSchema.pre("save", async function (next) {
  if (!this.fieldExists("_id")) this._id = uuidv4();
  next();
});

export const Following = mongoose.model("Following", followingSchema);
