import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Event listeners for MongoDB connection
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/nskai-auth`);

  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the app if DB connection fails
  }
};

export default connectDB;
