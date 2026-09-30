// =====================================================
// INTERVIEWEASE BACKEND SERVER
// =====================================================

// IMPORTANT:
// DNS fix for MongoDB Atlas mongodb+srv connection
const dns = require("dns");

// Use Google + Cloudflare DNS
dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();


// =====================================================
// CONFIGURATION
// =====================================================

const PORT = process.env.PORT || 5000;

const MONGODB_URI = process.env.MONGODB_URI;


// =====================================================
// CHECK ENV
// =====================================================

console.log("======================================");
console.log("InterviewEase Backend Starting...");
console.log("======================================");

if (!MONGODB_URI) {

    console.error("❌ MONGODB_URI is missing in .env");
    process.exit(1);

}

console.log("✅ MONGODB_URI loaded");


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// =====================================================
// BASIC TEST ROUTE
// =====================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "InterviewEase Backend is running"
    });

});


// =====================================================
// API TEST ROUTE
// =====================================================

app.get("/api", (req, res) => {

    res.json({
        success: true,
        message: "InterviewEase API is working"
    });

});


// =====================================================
// INTERVIEW ROUTES
// =====================================================

const interviewRoutes = require("./routes/interviewRoutes");

app.use(
    "/api/interviews",
    interviewRoutes
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });

});


// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {

    console.error("SERVER ERROR:", err);

    res.status(500).json({
        success: false,
        message: err.message || "Internal server error"
    });

});


// =====================================================
// MONGODB CONNECTION
// =====================================================

async function connectMongoDB() {

    try {

        console.log("Connecting to MongoDB...");

        await mongoose.connect(MONGODB_URI, {

            serverSelectionTimeoutMS: 10000,

            connectTimeoutMS: 10000,

            socketTimeoutMS: 45000

        });
        console.log("MongoDB READY STATE:", mongoose.connection.readyState);
console.log("MongoDB HOST:", mongoose.connection.host);
console.log("MongoDB DB:", mongoose.connection.name);

        console.log("✅ MongoDB Connected Successfully!");

        console.log(
            "Database:",
            mongoose.connection.name
        );

    } catch (error) {

        console.error(
            "❌ MongoDB Connection Failed:"
        );

        console.error(error.message);

        process.exit(1);

    }

}


// =====================================================
// START SERVER
// =====================================================

async function startServer() {

    await connectMongoDB();

    app.listen(PORT, () => {

        console.log("");
        console.log("======================================");
        console.log("🚀 InterviewEase Backend Started");
        console.log("======================================");
        console.log(
            `🌐 Server: http://localhost:${PORT}`
        );
        console.log(
            `📋 API: http://localhost:${PORT}/api/interviews`
        );
        console.log(
            `❤️ Health: http://localhost:${PORT}/`
        );
        console.log("======================================");

    });

}


// =====================================================
// START
// =====================================================

startServer();