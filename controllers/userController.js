import UserModel from "../models/userModel.js";
import redisClient from "../utils/redisClient.js"
import { generateAccessTokens, generateRefreshTokens } from "../utils/generateTokens.js";
import sharp from "sharp";
import fs from "fs";

export const registerNewUser = async (req, res,next) => {
  try {
    const { name, email, password, role } = req.body;


    console.log("Registration attempt with data:",req.file)
    const image = sharp(req.file.path);
    // Get dimensions
    const metadata = await image.metadata();
    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

        // Resize image
    const resizedPath = `uploads/resized-${req.file.filename}`;
    await sharp(req.file.path)
      .resize(300, 300)
      .toFile(resizedPath);

    fs?.unlinkSync(req.file.path); // Delete original
    //fs is not deleting the file use other method
    
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      fs?.unlinkSync(resizedPath); // Delete original
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      password,
      role: role || "user", // Default role is 'user'
      profileImage: resizedPath // Save resized image path
    });

    // Save user to database
    await newUser.save();
    await redisClient.del("all_users"); // Clear cache

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt with email:", email);
    console.log("Login attempt with password:", password);

    // Check if user exists
    const user = await UserModel.findOne({ email });

    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessTokens(user);
    const refreshToken = generateRefreshTokens(user);

    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

        // Save user ID & role in session
        // const {id,email} = req.session.user
    // req.session.user = {
    //   id: user._id,
    //   email: user.email,
    //   role: user.role,
    // };

    

    res.status(200).json({ message: "Login successfully", user,
      accessToken, refreshToken
     });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save();

    // Here you would send the reset token to the user's email
    console.log(`Reset token for ${email}: ${resetToken}`);

    const resetLink = `http://localhost:3000/api/v1/user/reset-password/${resetToken}`;

    // await sendEmail(user.email, "Reset Your Password", `Reset link: ${resetLink}`);

    res
      .status(200)
      .json({ message: "Password reset token generated", resetToken });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { email, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // Find user by reset token
    const user = await UserModel.findOne({
      email: email,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    // Update password
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


export const refreshAccessToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken(decoded);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const cached = await redisClient.get("all_users");
    if (cached) {
      console.log("♻️ Returned from Redis");
      return res.status(200).json({ users: JSON.parse(cached) });
    }

    const users = await UserModel.find().select("-password");
    console.log("🆕 Fetched from DB");
    await redisClient.set("all_users", JSON.stringify(users), {
      EX: 3600, // expire in 1 hour
      NX: true  // set only if not exists (optional but prevents race conditions)
    });
    //     await redisClient.set("all_users", JSON.stringify(users),{
    //   EX:60,
    //   NX:true
    // }); // Cache for 60s
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// DELETE
export const deleteUser = async (req, res) => {
  await UserModel.findByIdAndDelete(req.params.id);
  await redisClient.del("all_users"); // Clear cache
  res.status(200).json({ message: "User deleted" });
};

// UPDATE
export const updateUser = async (req, res) => {
  const updated = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) {
    return res.status(404).json({ message: "User not found" });
  }
  await redisClient.del("all_users"); // Clear cache
  res.status(200).json({ message: "User updated", user: updated });
};

// export const logoutUser = (req, res) => {
//   try {
//     // Destroy the session
//     req.session.destroy((err) => {
//       if (err) {
//         return res.status(500).json({ message: "Logout failed", error: err });
//       }
//       res.status(200).json({ message: "Logged out successfully" });
//     });
//   } catch (error) {
//     console.error("Error logging out user:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };