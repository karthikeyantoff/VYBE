import "dotenv/config";

const readString = (key, fallback = "") => {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
};

const readNumber = (key, fallback) => {
  const raw = process.env[key];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const NODE_ENV = readString("NODE_ENV", "development");
const isProduction = NODE_ENV === "production";

const env = Object.freeze({
  NODE_ENV,
  isProduction,
  isDevelopment: NODE_ENV === "development",
  isTest:
    NODE_ENV === "test" ||
    process.env.npm_lifecycle_event === "test" ||
    Boolean(process.argv[1] && process.argv[1].includes("test")),

  PORT: readNumber("PORT", 5000),

  MONGO_URI: readString("MONGO_URI"),

  JWT_SECRET: readString("JWT_SECRET"),
  JWT_EXPIRES_IN: readString("JWT_EXPIRES_IN", "7d"),

  CLIENT_URL: readString("CLIENT_URL", "http://localhost:5173"),
  ADMIN_URL: readString("ADMIN_URL", "http://localhost:5174"),

  CLOUDINARY_CLOUD_NAME: readString("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: readString("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: readString("CLOUDINARY_API_SECRET"),

  ADMIN_EMAIL: readString("ADMIN_EMAIL"),
  ADMIN_USERNAME: readString("ADMIN_USERNAME"),
  ADMIN_PASSWORD: readString("ADMIN_PASSWORD"),

  // Email Delivery Configuration
  SMTP_HOST: readString("SMTP_HOST"),
  SMTP_PORT: readNumber("SMTP_PORT", 587),
  SMTP_USER: readString("SMTP_USER"),
  SMTP_PASS: readString("SMTP_PASS"),
  EMAIL_FROM: readString("EMAIL_FROM", "VYBE Platform <no-reply@vybe.dev>"),
  EMAIL_SECURE: readString("EMAIL_SECURE", "false") === "true",
});

// Production-only fail-fast validation. Never let the server boot with weak/missing secrets in prod.
if (env.isProduction) {
  const errors = [];

  if (!env.MONGO_URI) errors.push("MONGO_URI is required in production.");
  if (!env.JWT_SECRET) errors.push("JWT_SECRET is required in production.");
  else if (env.JWT_SECRET.length < 32)
    errors.push("JWT_SECRET must be at least 32 characters in production.");

  if (!env.CLOUDINARY_CLOUD_NAME) errors.push("CLOUDINARY_CLOUD_NAME is required in production.");
  if (!env.CLOUDINARY_API_KEY) errors.push("CLOUDINARY_API_KEY is required in production.");
  if (!env.CLOUDINARY_API_SECRET) errors.push("CLOUDINARY_API_SECRET is required in production.");

  if (errors.length > 0) {
    console.error("[env] Invalid production configuration:");
    for (const message of errors) console.error(`  - ${message}`);
    process.exit(1);
  }
}

export default env;
