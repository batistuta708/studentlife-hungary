const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in the environment");
  }

  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== "production", // build indexes on the fly only in dev
    });
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
