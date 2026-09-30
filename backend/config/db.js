const mongoose = require("mongoose");
const dns = require("dns");

// Use Google DNS instead of Windows/ISP DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            console.error("❌ MONGO_URI is not defined in .env");
            return;
        }

        console.log("🔄 Connecting to MongoDB...");

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000
        });

        console.log("✅ MongoDB Connected Successfully!");

    } catch (error) {
        console.error("❌ MongoDB Connection Failed:");
        console.error(error.message);
    }
};

module.exports = connectDB;