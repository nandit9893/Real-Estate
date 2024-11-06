import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import APIResponse from "../utils/APIResponse.js";
import Listing from "../models/listing.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
 try {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
 } catch (error) {
  throw new APIError(
   500,
   "Something went wrong while generating access token and refresh token"
  );
 }
};

const userRegistration = async (req, res) => {
 const { username, email, password } = req.body;
 if (!username.trim()) {
  return res
   .status(400)
   .json({ success: false, message: "Username is required" });
 }
 if (!email.trim()) {
  return res.status(400).json({ success: false, message: "Email is required" });
 }
 if (!password.trim()) {
  return res
   .status(400)
   .json({ success: false, message: "Password is required" });
 }

 try {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
   return res
    .status(409)
    .json({ success: false, message: "User already exists" });
  }

  const newUser = await User.create({
   username: username.toLowerCase(),
   email,
   password,
  });

  const createdUser = await User.findById(newUser._id).select(
   "-password -refreshToken"
  );
  if (!createdUser) {
   return res.status(404).json({
    success: false,
    message: "Something went wrong while registering, please try again later",
   });
  }
  return res.status(201).json({
   success: true,
   message: "User created successfully",
   data: createdUser,
  });
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "An error occurred while registering the user",
   error: error.message,
  });
 }
};

const userLogin = async (req, res) => {
 const { email, password } = req.body;
 if (!email) {
  return res.status(400).json({
   success: false,
   message: "Email is required",
  });
 }
 try {
  const user = await User.findOne({ email });
  if (!user) {
   return res.status(404).json({
    success: false,
    message: "User not found",
   });
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
   return res.status(401).json({
    success: false,
    message: "Password is incorrect",
   });
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
   user._id
  );
  const loggedInUser = await User.findById(user._id).select(
   "-password -refreshToken"
  );
  const options = {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "Strict",
  };
  return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new APIResponse(
     200,
     {
      user: loggedInUser,
      accessToken,
      refreshToken,
     },
     "User logged in successfully"
    )
   );
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "An error occurred while logging in",
  });
 }
};

const userLogout = async (req, res) => {
 try {
  await User.findByIdAndUpdate(
   req.user._id,
   {
    $unset: {
     refreshToken: "",
    },
   },
   {
    new: true,
   }
  );
  const options = {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "Strict",
  };
  return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new APIResponse(200, {}, "User logged out successfully"));
 } catch (error) {
  return res
   .status(500)
   .json(new APIError(500, "Something went wrong while logging out"));
 }
};

const googleSignInSignOut = async (req, res) => {
 const { name, email, photo } = req.body;
 try {
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existingUser._id
   );
   const loggedInUser = await User.findById(existingUser._id).select(
    "-password -refreshToken"
   );
   const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
   };
   return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
     new APIResponse(
      200,
      {
       user: loggedInUser,
       accessToken,
       refreshToken,
      },
      "User logged in successfully"
     )
    );
  } else {
   const generatedPassword =
    Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
   const newUser = new User({
    username:
     name.split("").join("").toLowerCase() +
     Math.random().toString(36).slice(-4),
    email,
    password: generatedPassword,
    avatar: photo,
   });
   await newUser.save();
   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    newUser._id
   );
   const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
   );
   const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
   };
   return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
     new APIResponse(
      201,
      {
       user: createdUser,
       accessToken,
       refreshToken,
      },
      "User registered and logged in successfully"
     )
    );
  }
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "An error occurred while registering the user",
   error: error.message,
  });
 }
};

const profileUpdate = async (req, res) => {
 const { username, email, password } = req.body;
 const avatarLocalPath = req.file?.path;
 try {
  const user = await User.findById(req.user?._id);
  if (!user) {
   return res.status(404).json({ success: false, message: "User not found" });
  }
  if (username) {
   user.username = username;
  }
  if (email) {
   user.email = email;
  }
  if (password) {
   user.password = password;
  }
  if (avatarLocalPath) {
   if (user.avatar) {
    await deleteFromCloudinary(user.avatar, "avatar");
   }
   const { url } = await uploadOnCloudinary(avatarLocalPath);
   user.avatar = url;
  }
  await user.save();
  const updatedUser = await User.findById(req.user._id).select("-password");
  return res.status(200).json({
   success: true,
   message: "Profile updated successfully",
   data: updatedUser,
  });
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "An error occurred while updating profile",
   error: error.message,
  });
 }
};

const deleteAccount = async (req, res) => {
 try {
  const user = await User.findById(req.user._id);
  if (!user) {
   return res.status(404).json({
    success: false,
    message: "User not found",
   });
  }
  if (user.avatar) {
   await deleteFromCloudinary(user.avatar, "avatar");
  }
  const listingOfUsers = await Listing.find({referenceId: user._id});
  if (listingOfUsers.length > 0) {
    for (const list of listingOfUsers) {
     for (const url of list.imageURLs) {
      await deleteFromCloudinary(url);
     }
    }
    await Listing.deleteMany({ referenceId: user._id });
   }
  await User.findByIdAndDelete(req.user._id);
  return res.status(200).json({
   success: true,
   message: "Account deleted successfully",
   data: listingOfUsers,
  });
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "An error occurred while deleting the account",
   error: error.message,
  });
 }
};

const getUserListing = async (req, res) => {
 const { userID } = req.params;
 try {
  const user = await User.findById(userID);
  if (!user) {
   return res.status(404).json({
    success: false,
    message: "User ID is not valid",
   });
  }
  const userSpecifiedListings = await Listing.find({ referenceId: userID });
  if (userSpecifiedListings.length === 0) {
   return res.status(404).json({
    success: false,
    message: "Lists are not available",
   });
  }
  return res.status(200).json({
   success: true,
   message: "All listings for the specific user fetched successfully",
   data: userSpecifiedListings,
  });
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "An error occurred while getting the listings",
   error: error.message,
  });
 }
};

const getUserDataContacts = async (req, res) => {
 const { userID } = req.params;
 try {
  const userExisted = await User.findById(userID).select("-password -refreshToken -avatar");
  if (!userExisted) {
   return res.status(404).json({
    success: false,
    message: "User not found",
   });
  }
  return res.status(201).json({
   success: true,
   message: "User fetched successfully",
   data: userExisted,
  });
 } catch (error) {
  return res.status(500).json({
   success: false,
   message: "Error fetching user contacts",
   error: error.message,
  });
 }
};

export {
 userRegistration,
 userLogin,
 userLogout,
 googleSignInSignOut,
 profileUpdate,
 deleteAccount,
 getUserListing,
 getUserDataContacts,
};
