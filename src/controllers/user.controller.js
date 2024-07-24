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
  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
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
    profile_image: avatar.url
  });


  const createdUser = User.find({ _id: user._id }).select("-password -refreshToken");

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
  if (!logoutUser) {
    throw new ApiError(400, "User not found");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", undefined, options)
    .cookie("refreshToken", undefined, options)
    .json(new ApiResponse(200, {}, "User logged out Successfully"));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword && newPassword)) {
    throw new ApiError(400, "All fields are required.");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "Something went wrong.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password.")
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false })

  return res.status(200).json(
    new ApiResponse(200, {}, "Password updated successfully.")
  )

})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, bio, address } = req.body;

  if (!(firstName && username && email)) {
    throw new ApiError(400, "First name, username, and email are required.");
  }

  const userId = req.user?._id;

  const isUserNameExist = await User.findOne({
    username,
    _id: { $ne: userId },
  });

  if (isUserNameExist) {
    throw new ApiError(400, "This username is allready taken.");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        fullName,
        lastName,
        username,
        email,
        bio,
        address
      }
    }
  ).select("-password -refreshToken")

  if (!user) {
    throw new ApiError(400, "We are getting error when update the account details.")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "Account details updated successfully.")
    )

})

const updateProfileImage = asyncHandler(async (req, res) => {
  const profileImagePath = req.file?.path;

  if (!profileImagePath) {
    throw new ApiError(400, "Profile image is missing.");
  }

  const profileImage = await uploadOnCloudinary(profileImagePath);
  if (!profileImage.url) {
    throw new ApiError(400, "Error while updating the profile image.")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profile_image: profileImage.url
      }
    },
    { new: true }
  ).select("-password -refreshToken")

  res
    .status(200)
    .json(
      new ApiResponse(200, { user }, "Profile Image updated successfully.")
    )
})


export { registerUser, loginUser, logoutUser, updatePassword, updateAccountDetails, updateProfileImage };
