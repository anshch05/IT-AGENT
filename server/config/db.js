import mongoose from "mongoose";

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn("MONGODB_URI is not configured; starting without MongoDB.");
    return false;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return false;
  }
}