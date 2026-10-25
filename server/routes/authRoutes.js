import { Router } from "express";

import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
  deleteAccount,
} from "../controllers/authController.js";

import protect from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiters.js";
import {
  registerRules,
  loginRules,
  verifyEmailRules,
  resendVerificationRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
  deleteAccountRules,
} from "../validators/authValidator.js";

const router = Router();

// Registration & Authentication
router.post("/register", authLimiter, validate(registerRules), register);
router.post("/login", authLimiter, validate(loginRules), login);

// Email Verification
router.post("/verify-email", authLimiter, validate(verifyEmailRules), verifyEmail);
router.get("/verify-email/:token", authLimiter, verifyEmail);
router.post("/resend-verification", authLimiter, validate(resendVerificationRules), resendVerification);

// Password Recovery
router.post("/forgot-password", authLimiter, validate(forgotPasswordRules), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordRules), resetPassword);

// Authenticated Account Endpoints
router.get("/me", protect, getMe);
router.patch("/change-password", protect, validate(changePasswordRules), changePassword);
router.delete("/delete-account", protect, validate(deleteAccountRules), deleteAccount);

export default router;
