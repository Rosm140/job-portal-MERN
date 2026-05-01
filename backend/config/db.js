const mongoose = require("mongoose");
const dns = require("dns");

// Force IPv4 first to solve DNS resolution issues with mongodb+srv on some networks
dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in .env file");
    process.exit(1);
  }

  try {
    // Basic check for common URI typos
    if (process.env.MONGO_URI.includes(' ') || !process.env.MONGO_URI.startsWith('mongodb')) {
      console.warn("⚠️ Warning: Your MONGO_URI in .env might be malformed (contains spaces or wrong protocol).");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Removed family: 4 to allow auto-resolution of SRV records
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("\n❌ MongoDB Connection Error Details:");

    if (error.code === 'ECONNREFUSED' && error.syscall === 'querySrv') {
      console.error("💡 DNS RESOLUTION FAILURE:");
      console.error("   Your network cannot resolve the 'mongodb+srv' record.");
      console.error("   ACTION: Go to MongoDB Atlas > Connect > Drivers.");
      console.error("   Select Node.js version '2.2.12 or later' to get the Standard Connection String.");
      console.error("   Replace the MONGO_URI in your .env with that string.");
    }

    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
