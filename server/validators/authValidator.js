import { body } from "express-validator";
import { RESERVED_USERNAMES } from "../models/User.js";

// Username: 3-20 chars; letters, numbers, underscores and periods.
// Must start and end with an alphanumeric character; no consecutive periods.
const usernameRule = () =>
  body("username")
    .exists({ checkFalsy: true })
    .withMessage("Username is required.")
    .bail()
    .isString()
    .withMessage("Username must be a string.")
    .bail()
    .trim()
    .toLowerCase()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters.")
    .bail()
    .matches(/^[a-z0-9][a-z0-9_.]{1,18}[a-z0-9]$/)
    .withMessage(
      "Username must be 3-20 characters, start and end with a letter or number, and only contain letters, numbers, underscores, and periods."
    )
    .bail()
    .custom((val) => {
      if (/\.\./.test(val)) {
        throw new Error("Username cannot contain consecutive periods.");
      }
      if (RESERVED_USERNAMES.includes(val)) {
        throw new Error("This username is reserved and cannot be registered.");
      }
      return true;
    });

const nameRule = () =>
  body("name")
    .exists({ checkFalsy: true })
    .withMessage("Name is required.")
    .bail()
    .isString()
    .withMessage("Name must be a string.")
    .bail()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage("Name must be between 1 and 60 characters.")
    .bail()
    .custom((val) => {
      if (/\d/.test(val)) {
        throw new Error("Name cannot contain numbers. Only letters and spaces are allowed.");
      }
      return true;
    })
    .escape();

const emailRule = () =>
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("A valid email address is required.")
    .bail()
    .trim()
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false });

const PASSWORD_COMPLEXITY = /^(?=.*[A-Za-z])(?=.*\d).+$/;

const passwordRule = (field = "password") =>
  body(field)
    .exists({ checkFalsy: true })
    .withMessage(`${field === "password" ? "Password" : "New password"} is required.`)
    .bail()
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters.")
    .bail()
    .matches(PASSWORD_COMPLEXITY)
    .withMessage("Password must contain at least one letter and one number.");

const confirmPasswordRule = (targetField = "password") =>
  body("confirmPassword")
    .exists({ checkFalsy: true })
    .withMessage("Password confirmation is required.")
    .bail()
    .custom((val, { req }) => {
      if (val !== req.body[targetField]) {
        throw new Error("Passwords do not match.");
      }
      return true;
    });

export const registerRules = [
  usernameRule(),
  nameRule(),
  emailRule(),
  passwordRule("password"),
  confirmPasswordRule("password"),
];

export const loginRules = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("A valid email address is required.")
    .trim()
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
  body("password").exists({ checkFalsy: true }).withMessage("Password is required."),
];

export const verifyEmailRules = [
  body("token")
    .exists({ checkFalsy: true })
    .withMessage("Verification token is required.")
    .isString()
    .withMessage("Verification token must be a string."),
];

export const resendVerificationRules = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("A valid email address is required.")
    .trim()
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
];

export const forgotPasswordRules = [
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("A valid email address is required.")
    .trim()
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
];

export const resetPasswordRules = [
  body("token")
    .exists({ checkFalsy: true })
    .withMessage("Reset token is required.")
    .isString(),
  passwordRule("password"),
  confirmPasswordRule("password"),
];

export const changePasswordRules = [
  body("currentPassword").exists({ checkFalsy: true }).withMessage("Current password is required."),
  passwordRule("newPassword"),
];

export const deleteAccountRules = [
  body("password").exists({ checkFalsy: true }).withMessage("Password confirmation is required."),
];
