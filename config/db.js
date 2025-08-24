import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  try {
    if (config.useLocalDB) {
      console.log("✅ Using Local Database (JSON file)");
      console.log("📁 Database file:", config.localDBPath);
    } else {
      console.log("Attempting to connect to MongoDB...");
      console.log("Connection URL:", config.mongoUri);
      
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log("MongoDB connected successfully");
    }
  } catch (err) {
    console.error("Database connection error:", err);
    console.error("Please ensure database is accessible");
    // In development, don't hard-exit so the server can still run with limited functionality
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB; 