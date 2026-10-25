import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Username: 3-20 chars, english letters, numbers, underscores, and periods.
// Must start and end with a letter or number.
const USERNAME_REGEX = /^[a-z0-9][a-z0-9_.]{1,18}[a-z0-9]$/;
const PASSWORD_COMPLEXITY = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const BCRYPT_SALT_ROUNDS = 12;

export const RESERVED_USERNAMES = Object.freeze([
  "admin",
  "administrator",
  "api",
  "support",
  "login",
  "signup",
  "register",
  "settings",
  "moderator",
  "help",
  "security",
  "root",
  "vybe",
  "system",
  "explore",
  "feed",
  "notifications",
  "saved",
]);

const avatarSchema = new Schema(
  {
    url: { type: String, default: "", trim: true },
    publicId: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const bannerSchema = new Schema(
  {
    url: { type: String, default: "", trim: true },
    publicId: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const preferencesSchema = new Schema(
  {
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    language: {
      type: String,
      enum: ["en"],
      default: "en",
    },
    fontSize: {
      type: String,
      enum: ["sm", "md", "lg"],
      default: "md",
    },
    reduceMotion: { type: Boolean, default: false },
    compactMode: { type: Boolean, default: false },
    privacy: {
      showEmail: { type: Boolean, default: false },
      privateAccount: { type: Boolean, default: false },
    },
    notifications: {
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
    },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters."],
      maxlength: [20, "Username must be at most 20 characters."],
      validate: [
        {
          validator(v) {
            return USERNAME_REGEX.test(v);
          },
          message:
            "Username must be 3-20 characters, start and end with a letter or number, and contain only letters, numbers, underscores, and periods.",
        },
        {
          validator(v) {
            return !/\.\./.test(v);
          },
          message: "Username cannot contain consecutive periods.",
        },
        {
          validator(v) {
            return !RESERVED_USERNAMES.includes(v.toLowerCase());
          },
          message: "This username is reserved and cannot be registered.",
        },
      ],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [1, "Name is required."],
      maxlength: [60, "Name must be at most 60 characters."],
      validate: {
        validator: function (v) {
          return !/\d/.test(v);
        },
        message: "Name cannot contain numbers. Only letters and spaces are allowed.",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "A valid email address is required."],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters."],
      maxlength: [128, "Password must be at most 128 characters."],
      validate: {
        validator(value) {
          if (typeof value !== "string") return false;
          if (value.startsWith("$2")) return true;
          return PASSWORD_COMPLEXITY.test(value);
        },
        message: "Password must contain at least one letter and one number.",
      },
      select: false,
    },
    // Email Verification Status & Cryptographic Token Hash
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationTokenHash: {
      type: String,
      select: false,
      index: true,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    // Single-use Password Reset Token Hash & Expiration
    resetPasswordTokenHash: {
      type: String,
      select: false,
      index: true,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [200, "Bio must be at most 200 characters."],
    },
    avatar: {
      type: avatarSchema,
      default: () => ({ url: "", publicId: "" }),
    },
    banner: {
      type: bannerSchema,
      default: () => ({ url: "", publicId: "" }),
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    followersCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
    postsCount: { type: Number, default: 0, min: 0 },
    savedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ createdAt: -1 });

// Mongoose 9 pre-save hook — async function with no `next` parameter.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

// Returns a sanitised view of the user document.
userSchema.methods.toPublicProfile = function toPublicProfile({ viewerId } = {}) {
  const isOwner = viewerId && String(viewerId) === String(this._id);
  const showEmail = isOwner || this.preferences?.privacy?.showEmail === true;

  const profile = {
    _id: this._id,
    username: this.username,
    name: this.name,
    bio: this.bio,
    avatar: this.avatar
      ? { url: this.avatar.url || "", publicId: this.avatar.publicId || "" }
      : { url: "", publicId: "" },
    banner: this.banner
      ? { url: this.banner.url || "", publicId: this.banner.publicId || "" }
      : { url: "", publicId: "" },
    role: this.role,
    isVerified: this.isVerified,
    followersCount: this.followersCount,
    followingCount: this.followingCount,
    postsCount: this.postsCount,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  if (showEmail) profile.email = this.email;
  if (isOwner) profile.preferences = this.preferences;

  return profile;
};

const User = model("User", userSchema);

export default User;
