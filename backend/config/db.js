const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (!process.env.MONGO_URI) {
    console.warn('[!] MONGO_URI is not defined in environment variables.');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[+] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[!] MongoDB Connection Notice: ${error.message}`);
    console.warn(`[!] Server will operate with API routes active.`);
  }
};

module.exports = connectDB;
