import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      "Something went wrong when generating access and refresh token.",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;
  if (
    [firstName, lastName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  const avatarLocalPath = req.file && req.file.path? req.file.path: '';
  
  if (!avatarLocalPath && req.file && req.file.path) {
    throw new ApiError(400, "Avatar is required");
  }

  let avatar = null;
  if(avatarLocalPath) avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar && avatarLocalPath) {
    throw new ApiError(
      500,
      "Internal server error when uploading Avatar file.",
    );
  }

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password,
    profile_image: avatar?.url
  });


  const createdUser = User.find({_id: user._id}).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Internal server error when creating user.");
  }

  // console.log(createdUser)
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { data: { message: "user has registered." } },
        "User registered Successfully",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required.");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "username or email is not found.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "password is incorrect.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const logoutUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: "",
      },
    },
    {
      new: true,
    },
  );
  if(!logoutUser){
    throw new ApiError(400, "User not found");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken",undefined, options)
    .cookie("refreshToken",undefined, options)
    .json(new ApiResponse(200, {}, "User logged out Successfully"));
});

export { registerUser, loginUser, logoutUser };
