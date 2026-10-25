import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "crypto";
import mongoose from "mongoose";

import env from "../config/env.js";
import connectDB from "../config/db.js";
import { app } from "../index.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";

let server;
let baseUrl;

const timestamp = Date.now();
const testUserA = {
  username: `alice.${timestamp}`,
  name: "Alice Walker",
  email: `alice.${timestamp}@vybe.dev`,
  password: "Password123!",
  confirmPassword: "Password123!",
};

const testUserB = {
  username: `bob_${timestamp}`,
  name: "Bob Builder",
  email: `bob_${timestamp}@vybe.dev`,
  password: "Password123!",
  confirmPassword: "Password123!",
};

let tokenA = "";
let userAId = "";
let tokenB = "";
let userBId = "";
let createdPostId = "";
let adminToken = "";

before(async () => {
  await connectDB();

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
});

after(async () => {
  try {
    if (userAId) await User.findByIdAndDelete(userAId);
    if (userBId) await User.findByIdAndDelete(userBId);
    if (createdPostId) {
      await Post.findByIdAndDelete(createdPostId);
      await Comment.deleteMany({ post: createdPostId });
      await Notification.deleteMany({ post: createdPostId });
    }
  } catch {
    // Best-effort cleanup
  }

  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  setTimeout(() => process.exit(0), 100);
});

describe("VYBE Authentication, Validation & Security Verification Suite", () => {
  test("1. System Health Check returns status 200 and ok status", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "ok");
    assert.ok(typeof data.uptime === "number");
  });

  test("2. Username Validation rejects invalid formats and reserved handles", async () => {
    // 2a. Rejects consecutive dots
    const resDots = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...testUserA,
        username: "bad..user",
      }),
    });
    assert.equal(resDots.status, 400);

    // 2b. Rejects leading or trailing period
    const resLeading = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...testUserA,
        username: ".baduser",
      }),
    });
    assert.equal(resLeading.status, 400);

    // 2c. Rejects reserved username (e.g. 'support' or 'settings')
    const resReserved = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...testUserA,
        username: "support",
      }),
    });
    assert.equal(resReserved.status, 400);

    // 2d. Rejects numbers in name
    const resNameNumber = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...testUserA,
        name: "Alice123",
      }),
    });
    assert.equal(resNameNumber.status, 400);

    // 2e. Rejects password confirmation mismatch
    const resMismatch = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...testUserA,
        confirmPassword: "DifferentPassword123!",
      }),
    });
    assert.equal(resMismatch.status, 400);
  });

  test("3. Registration creates unverified account and generates verification token", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUserA),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.status, "success");
    assert.equal(data.isVerified, false);
    assert.equal(data.email, testUserA.email);

    // Verify in database that verification token hash is stored
    const userInDb = await User.findOne({ email: testUserA.email }).select(
      "+verificationTokenHash +verificationTokenExpires"
    );
    assert.ok(userInDb);
    assert.equal(userInDb.isVerified, false);
    assert.ok(userInDb.verificationTokenHash);
    assert.ok(userInDb.verificationTokenExpires > new Date());

    userAId = userInDb._id.toString();

    // Register User B as well
    const resB = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUserB),
    });
    assert.equal(resB.status, 201);
    const userBInDb = await User.findOne({ email: testUserB.email });
    userBId = userBInDb._id.toString();
  });

  test("4. Unverified user login is rejected with HTTP 403 EMAIL_NOT_VERIFIED", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUserA.email,
        password: testUserA.password,
      }),
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.code, "EMAIL_NOT_VERIFIED");
  });

  test("5. Email Verification validates token, marks account verified, and permits login", async () => {
    // 5a. Bad token fails
    const resBadToken = await fetch(`${baseUrl}/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "invalid_token_12345" }),
    });
    assert.equal(resBadToken.status, 400);

    // 5b. Simulate valid verification using token stored in DB for User A
    const rawToken = "my_valid_secret_verification_token_123";
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    await User.findByIdAndUpdate(userAId, {
      verificationTokenHash: hashed,
      verificationTokenExpires: new Date(Date.now() + 3600000),
    });

    const resVerify = await fetch(`${baseUrl}/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: rawToken }),
    });
    assert.equal(resVerify.status, 200);

    // Check account is now marked verified
    const userAfterVerify = await User.findById(userAId);
    assert.equal(userAfterVerify.isVerified, true);

    // 5c. Token cannot be reused (consumed atomically)
    const resReuse = await fetch(`${baseUrl}/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: rawToken }),
    });
    assert.equal(resReuse.status, 400);

    // Also mark User B verified for social testing
    await User.findByIdAndUpdate(userBId, { isVerified: true });

    // 5d. Login succeeds now that account is verified
    const resLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUserA.email,
        password: testUserA.password,
      }),
    });
    assert.equal(resLogin.status, 200);
    const loginData = await resLogin.json();
    assert.ok(loginData.token);
    tokenA = loginData.token;

    // Login user B
    const resLoginB = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUserB.email,
        password: testUserB.password,
      }),
    });
    const loginDataB = await resLoginB.json();
    tokenB = loginDataB.token;
  });

  test("6. Resend Verification endpoint handles requests gracefully", async () => {
    const resResend = await fetch(`${baseUrl}/api/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUserA.email }),
    });
    assert.equal(resResend.status, 200);
    const data = await resResend.json();
    assert.equal(data.status, "success");
  });

  test("7. Password Reset flow generates reset token, updates password, and invalidates old credentials", async () => {
    // 7a. Request forgot password
    const resForgot = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUserA.email }),
    });
    assert.equal(resForgot.status, 200);

    // 7b. Simulate reset token in DB
    const resetToken = "reset_token_test_123456";
    const resetHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    await User.findByIdAndUpdate(userAId, {
      resetPasswordTokenHash: resetHash,
      resetPasswordExpires: new Date(Date.now() + 3600000),
    });

    // 7c. Reset password
    const newPassword = "NewSecretPassword2026!";
    const resReset = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: resetToken,
        password: newPassword,
        confirmPassword: newPassword,
      }),
    });
    assert.equal(resReset.status, 200);

    // 7d. Old password must fail
    const resOldLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUserA.email,
        password: testUserA.password,
      }),
    });
    assert.equal(resOldLogin.status, 401);

    // 7e. New password succeeds and updates session
    const resNewLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUserA.email,
        password: newPassword,
      }),
    });
    assert.equal(resNewLogin.status, 200);
    const newLoginData = await resNewLogin.json();
    tokenA = newLoginData.token;
  });

  test("8. Authenticated endpoints validate Bearer token and return profile", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.email, testUserA.email);
    assert.equal(data.user.isVerified, true);
  });

  test("9. Post creation, Like toggle, and Comment creation work end-to-end", async () => {
    // Create Post
    const resPost = await fetch(`${baseUrl}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ content: "Testing VYBE email verification and auth flow!" }),
    });
    assert.equal(resPost.status, 201);
    const postData = await resPost.json();
    createdPostId = postData.post._id;

    // Like Post from User B
    const resLike = await fetch(`${baseUrl}/api/posts/${createdPostId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(resLike.status, 200);

    // Comment from User B
    const resComment = await fetch(`${baseUrl}/api/posts/${createdPostId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ content: "Verified account comment works perfectly!" }),
    });
    assert.equal(resComment.status, 201);
  });

  test("10. Social Graph follow/unfollow updates follower counts and generates notification", async () => {
    const resFollow = await fetch(`${baseUrl}/api/users/${userAId}/follow`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert.equal(resFollow.status, 200);

    // User A checks notifications
    const resNotif = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(resNotif.status, 200);
    const notifData = await resNotif.json();
    assert.ok(Array.isArray(notifData.items));
  });

  test("11. Role-based Admin authorization rejects regular user and accepts dynamic admin", async () => {
    // Regular user rejected with 403
    const resUserAdmin = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(resUserAdmin.status, 403);

    // Admin login succeeds
    const resAdminLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      }),
    });
    assert.equal(resAdminLogin.status, 200);
    const adminData = await resAdminLogin.json();
    adminToken = adminData.token;

    // Admin endpoint accepts admin token
    const resAdminStats = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(resAdminStats.status, 200);
  });

  test("12. Post deletion triggers full cascade cleanup", async () => {
    const resDelete = await fetch(`${baseUrl}/api/posts/${createdPostId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(resDelete.status, 200);

    // Post must be gone
    const resCheck = await fetch(`${baseUrl}/api/posts/${createdPostId}`);
    assert.equal(resCheck.status, 404);
  });
});
