const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[+] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[!] MongoDB Connection Notice: ${error.message}`);
    console.warn(`[!] Server will operate with API routes active. Please ensure MongoDB is running at ${process.env.MONGO_URI}`);
  }
};

module.exports = connectDB;
