import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedNotification,
} from "../services/emailService.js";

const INVALID_CREDENTIALS = "Invalid email or password.";
const ACCOUNT_UNAVAILABLE = "Account unavailable.";

const tryGetModel = (name) => {
  try {
    return mongoose.model(name);
  } catch {
    return null;
  }
};

/**
 * Hash raw token with SHA-256 for secure database storage.
 */
const hashToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { username, name, email, password } = req.body;

  // Check whether email or username already exists (anti-enumeration 409)
  const existing = await User.findOne({ $or: [{ email }, { username }] }).lean();
  if (existing) {
    return res.status(409).json({
      status: "error",
      message: "An account with that email or username already exists.",
    });
  }

  // Generate cryptographically secure email verification token
  const rawVerificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenHash = hashToken(rawVerificationToken);
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    username,
    name,
    email,
    password,
    role: "user",
    isVerified: false,
    verificationTokenHash,
    verificationTokenExpires,
  });

  // Dispatch real verification email
  try {
    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token: rawVerificationToken,
    });
  } catch (mailErr) {
    console.error("[Auth] Failed to send verification email:", mailErr.message);
  }

  return res.status(201).json({
    status: "success",
    isVerified: false,
    email: user.email,
    message:
      "Account registered successfully! Please check your email to verify your account before signing in.",
  });
});

// POST /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.body.token || req.query.token;
  if (!token || typeof token !== "string") {
    return res.status(400).json({
      status: "error",
      message: "Verification token is required.",
    });
  }

  const tokenHash = hashToken(token.trim());

  const user = await User.findOne({
    verificationTokenHash: tokenHash,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({
      status: "error",
      message:
        "The email verification link is invalid, expired, or has already been used.",
    });
  }

  // Atomically mark verified and consume verification token
  user.isVerified = true;
  user.verificationTokenHash = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return res.json({
    status: "success",
    message: "Email address verified successfully! You can now log in to VYBE.",
  });
});

// POST /api/auth/resend-verification
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const genericResponse = {
    status: "success",
    message:
      "If an unverified account with that email exists, a verification link has been sent.",
  };

  if (!email) {
    return res.status(400).json({ status: "error", message: "Email is required." });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user || user.isVerified || !user.isActive) {
    return res.json(genericResponse);
  }

  // Generate fresh token and supersede old token
  const rawVerificationToken = crypto.randomBytes(32).toString("hex");
  user.verificationTokenHash = hashToken(rawVerificationToken);
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  try {
    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token: rawVerificationToken,
    });
  } catch (mailErr) {
    console.error("[Auth] Resend verification mail failed:", mailErr.message);
  }

  return res.json(genericResponse);
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  // Identical 401 for "no such user" and "wrong password" — anti-enumeration.
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ status: "error", message: INVALID_CREDENTIALS });
  }

  if (!user.isActive) {
    return res.status(403).json({ status: "error", message: ACCOUNT_UNAVAILABLE });
  }

  // Gate login behind email verification (admins seeded can have isVerified: true)
  if (!user.isVerified) {
    return res.status(403).json({
      status: "error",
      code: "EMAIL_NOT_VERIFIED",
      message:
        "Please verify your email address before signing in. Check your inbox for the verification link.",
      email: user.email,
    });
  }

  const token = generateToken(user._id);

  return res.json({
    status: "success",
    token,
    user: user.toPublicProfile({ viewerId: user._id }),
  });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const genericResponse = {
    status: "success",
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };

  if (!email) {
    return res.status(400).json({ status: "error", message: "Email is required." });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user || !user.isActive) {
    return res.json(genericResponse);
  }

  // Generate single-use reset token valid for 1 hour
  const rawResetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordTokenHash = hashToken(rawResetToken);
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token: rawResetToken,
    });
  } catch (mailErr) {
    console.error("[Auth] Failed to send password reset email:", mailErr.message);
  }

  return res.json(genericResponse);
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || typeof token !== "string") {
    return res.status(400).json({
      status: "error",
      message: "Reset token is required.",
    });
  }

  const tokenHash = hashToken(token.trim());

  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({
      status: "error",
      message:
        "The password reset link is invalid, expired, or has already been used.",
    });
  }

  // Atomically update password and consume token
  user.password = password;
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // Send security alert confirmation
  try {
    await sendPasswordChangedNotification({
      to: user.email,
      name: user.name,
    });
  } catch (err) {
    console.error("[Auth] Password changed notification failed:", err.message);
  }

  return res.json({
    status: "success",
    message: "Password reset successfully. You can now sign in with your new password.",
  });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  return res.json({
    status: "success",
    user: req.user.toPublicProfile({ viewerId: req.user._id }),
  });
});

// PATCH /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (currentPassword === newPassword) {
    return res.status(400).json({
      status: "error",
      message: "New password must be different from the current one.",
    });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return res.status(401).json({ status: "error", message: "Authentication required." });
  }

  const ok = await user.comparePassword(currentPassword);
  if (!ok) {
    return res.status(401).json({ status: "error", message: "Current password is incorrect." });
  }

  user.password = newPassword;
  await user.save();

  try {
    await sendPasswordChangedNotification({
      to: user.email,
      name: user.name,
    });
  } catch (err) {
    console.error("[Auth] Password changed notification failed:", err.message);
  }

  return res.json({ status: "success", message: "Password updated successfully." });
});

// DELETE /api/auth/delete-account
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return res.status(401).json({ status: "error", message: "Authentication required." });
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    return res.status(401).json({ status: "error", message: "Password is incorrect." });
  }

  if (user.role === "admin") {
    return res.status(403).json({
      status: "error",
      message: "Admin accounts cannot be deleted through this endpoint.",
    });
  }

  const userId = user._id;

  const Post = tryGetModel("Post");
  const Comment = tryGetModel("Comment");
  const Notification = tryGetModel("Notification");

  if (Post) {
    await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });
    await Post.deleteMany({ author: userId });
  }
  if (Comment) {
    await Comment.deleteMany({ author: userId });
  }
  if (Notification) {
    await Notification.deleteMany({
      $or: [{ recipient: userId }, { sender: userId }],
    });
  }

  await User.updateMany(
    { followers: userId },
    { $pull: { followers: userId }, $inc: { followersCount: -1 } }
  );
  await User.updateMany(
    { following: userId },
    { $pull: { following: userId }, $inc: { followingCount: -1 } }
  );

  await user.deleteOne();

  return res.json({ status: "success", message: "Account deleted." });
});
