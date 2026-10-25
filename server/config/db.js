import mongoose from "mongoose";
import env from "./env.js";

mongoose.set("strictQuery", true);

export const connectDB = async (retries = 3) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!env.MONGO_URI) {
    console.error("[db] MONGO_URI is empty. Set it in server/.env before starting the API.");
    process.exit(1);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 15_000,
      });
      if (!env.isProduction) {
        console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      }
      return conn;
    } catch (error) {
      console.error(`[db] MongoDB connection attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt === retries) {
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

mongoose.connection.on("disconnected", () => {
  if (!env.isProduction) console.warn("[db] MongoDB disconnected.");
});

mongoose.connection.on("reconnected", () => {
  if (!env.isProduction) console.log("[db] MongoDB reconnected.");
});

export default connectDB;
