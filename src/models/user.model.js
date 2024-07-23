import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const addressSchema = new Schema({
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
  type: String,
  },
  country: {
    type: String,
  },
  pincode: {
    type: String,
  }
});

const userSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
    },
    address: {
      type: addressSchema,
    },
    profile_image: {
      type: String, // cloud url
      required: true,
    },
    refreshToken: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    posts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }],
    reels: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reel'
    }],
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Follower'
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Following'
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.fieldExists = function (fieldName) {
  return this[fieldName];
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);

  if (!this.fieldExists("_id")) this._id = uuidv4();

  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
