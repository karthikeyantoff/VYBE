import nodemailer from "nodemailer";
import env from "../config/env.js";

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.EMAIL_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else {
    // In dev / test environment without configured SMTP server,
    // create a json/stream or ethereal fallback that logs safely.
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "windows",
      buffer: true,
    });
  }

  return transporter;
};

/**
 * Send account verification email containing secure link.
 */
export const sendVerificationEmail = async ({ to, name, token }) => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  const subject = "Verify your email address for VYBE";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #13111C; color: #F3F0FA; margin: 0; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; background: #1B1827; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 20px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .brand { font-size: 24px; font-weight: 800; color: #FAF8FD; letter-spacing: -0.5px; margin-bottom: 24px; }
    .brand span { color: #8B5CF6; }
    h1 { font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 0 0 14px 0; }
    p { font-size: 14px; line-height: 1.6; color: #A7A0BE; margin: 0 0 20px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: #FFFFFF !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 13px 28px; border-radius: 12px; margin: 12px 0 24px 0; }
    .subtext { font-size: 12px; color: #787095; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 18px; margin-top: 24px; word-break: break-all; }
    .subtext a { color: #A78BFA; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">VY<span>BE</span></div>
    <h1>Welcome, ${name || "there"}!</h1>
    <p>Thanks for creating an account on VYBE. Please click the button below to verify your email address and activate your social profile:</p>
    <a href="${verifyUrl}" class="btn" target="_blank">Verify Email Address</a>
    <p>This verification link is valid for <strong>24 hours</strong>. If you did not create this account, no further action is required.</p>
    <div class="subtext">
      Button not working? Copy and paste this link into your browser:<br>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </div>
  </div>
</body>
</html>
`;

  const text = `Welcome to VYBE, ${name}!\n\nPlease verify your email address by visiting this link:\n${verifyUrl}\n\nThis link is valid for 24 hours.`;

  const mailer = await getTransporter();
  const info = await mailer.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  if (!env.SMTP_HOST) {
    console.log(`[Email Mock] Verification link for ${to}: ${verifyUrl}`);
  }

  return { success: true, messageId: info?.messageId, verifyUrl };
};

/**
 * Send password reset email containing single-use secure reset token.
 */
export const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  const subject = "Reset your VYBE account password";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #13111C; color: #F3F0FA; margin: 0; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; background: #1B1827; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 20px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .brand { font-size: 24px; font-weight: 800; color: #FAF8FD; letter-spacing: -0.5px; margin-bottom: 24px; }
    .brand span { color: #8B5CF6; }
    h1 { font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 0 0 14px 0; }
    p { font-size: 14px; line-height: 1.6; color: #A7A0BE; margin: 0 0 20px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: #FFFFFF !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 13px 28px; border-radius: 12px; margin: 12px 0 24px 0; }
    .subtext { font-size: 12px; color: #787095; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 18px; margin-top: 24px; word-break: break-all; }
    .subtext a { color: #A78BFA; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">VY<span>BE</span></div>
    <h1>Password Reset Request</h1>
    <p>Hello ${name || "there"}, we received a request to reset your password for your VYBE account. Click the button below to choose a new password:</p>
    <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
    <p>This single-use password reset link is valid for <strong>1 hour</strong>. If you did not request this reset, your account is secure and you can safely ignore this email.</p>
    <div class="subtext">
      Button not working? Copy and paste this link into your browser:<br>
      <a href="${resetUrl}">${resetUrl}</a>
    </div>
  </div>
</body>
</html>
`;

  const text = `Hello ${name},\n\nReset your VYBE password using this link:\n${resetUrl}\n\nThis link is valid for 1 hour.`;

  const mailer = await getTransporter();
  const info = await mailer.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  if (!env.SMTP_HOST) {
    console.log(`[Email Mock] Password reset link for ${to}: ${resetUrl}`);
  }

  return { success: true, messageId: info?.messageId, resetUrl };
};

/**
 * Send notification when password has been changed.
 */
export const sendPasswordChangedNotification = async ({ to, name }) => {
  const subject = "Your VYBE password has been updated";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #13111C; color: #F3F0FA; margin: 0; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; background: #1B1827; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 20px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .brand { font-size: 24px; font-weight: 800; color: #FAF8FD; letter-spacing: -0.5px; margin-bottom: 24px; }
    .brand span { color: #8B5CF6; }
    h1 { font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 0 0 14px 0; }
    p { font-size: 14px; line-height: 1.6; color: #A7A0BE; margin: 0 0 20px 0; }
    .alert-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 12px; font-size: 12px; color: #FCA5A5; margin: 18px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">VY<span>BE</span></div>
    <h1>Security Alert: Password Changed</h1>
    <p>Hello ${name || "there"}, this is a confirmation that the password for your VYBE account has been successfully changed.</p>
    <div class="alert-box">
      If you did not make this change, please contact VYBE security immediately to secure your account.
    </div>
  </div>
</body>
</html>
`;

  const text = `Hello ${name},\n\nThe password for your VYBE account was successfully changed. If you did not make this change, please contact support immediately.`;

  const mailer = await getTransporter();
  await mailer.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { success: true };
};
