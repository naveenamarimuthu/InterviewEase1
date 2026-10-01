// =====================================================
// INTERVIEWEASE BACKEND SERVER
// =====================================================

// =====================================================
// MONGODB ATLAS DNS FIX
// =====================================================

const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

require("dotenv").config();

// =====================================================
// IMPORTS
// =====================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

// =====================================================
// MODELS
// =====================================================

const User = require("./models/User");

// =====================================================
// ROUTES
// =====================================================

const authRoutes =
  require("./routes/authRoutes");

const interviewRoutes =
  require("./routes/interviewRoutes");

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const authMiddleware =
  require("./middleware/authMiddleware");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// CONFIGURATION
// =====================================================

const PORT =
  process.env.PORT || 5000;

const MONGODB_URI =
  process.env.MONGODB_URI;

const JWT_SECRET =
  process.env.JWT_SECRET;

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL;

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD;

// =====================================================
// STARTUP MESSAGE
// =====================================================

console.log(
  "======================================"
);

console.log(
  "🚀 InterviewEase Backend Starting..."
);

console.log(
  "======================================"
);

// =====================================================
// ENV CHECK
// =====================================================

if (!MONGODB_URI) {
  console.error(
    "❌ MONGODB_URI is missing in .env"
  );

  process.exit(1);
}

if (!JWT_SECRET) {
  console.error(
    "❌ JWT_SECRET is missing in .env"
  );

  process.exit(1);
}

if (!ADMIN_EMAIL) {
  console.error(
    "❌ ADMIN_EMAIL is missing in .env"
  );

  process.exit(1);
}

if (!ADMIN_PASSWORD) {
  console.error(
    "❌ ADMIN_PASSWORD is missing in .env"
  );

  process.exit(1);
}

console.log(
  "✅ Environment variables loaded"
);

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors()
);

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true
  })
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      message:
        "InterviewEase Backend is running"
    });
  }
);

// =====================================================
// API TEST
// =====================================================

app.get(
  "/api",
  (req, res) => {
    res.json({
      success: true,
      message:
        "InterviewEase API is working"
    });
  }
);

// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// INTERVIEW ROUTES
// =====================================================
//
// Authentication required for all
// interview operations.
//
// GET
// POST
// PUT
// DELETE
//
// =====================================================

app.use(
  "/api/interviews",
  authMiddleware,
  interviewRoutes
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        `Route not found: ${req.method} ${req.originalUrl}`
    });
  }
);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "SERVER ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        err.message ||
        "Internal server error"
    });
  }
);

// =====================================================
// CREATE DEFAULT ADMIN
// =====================================================

async function createDefaultAdmin() {
  try {
    const email =
      ADMIN_EMAIL
        .toLowerCase()
        .trim();

    // Check existing user
    const existingUser =
      await User.findOne({
        email
      });

    // User already exists
    if (existingUser) {
      console.log(
        "✅ Admin user already exists"
      );

      console.log(
        "Admin email:",
        email
      );

      return;
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(
        ADMIN_PASSWORD,
        10
      );

    // Create admin
    const admin =
      new User({
        name:
          "InterviewEase Admin",

        email,

        password:
          hashedPassword
      });

    await admin.save();

    console.log(
      "======================================"
    );

    console.log(
      "✅ Default admin user created"
    );

    console.log(
      "Admin email:",
      email
    );

    console.log(
      "======================================"
    );

  } catch (error) {
    console.error(
      "❌ Admin creation failed:"
    );

    console.error(
      error.message
    );

    throw error;
  }
}

// =====================================================
// CONNECT MONGODB
// =====================================================

async function connectMongoDB() {
  try {
    console.log(
      "Connecting to MongoDB..."
    );

    await mongoose.connect(
      MONGODB_URI,
      {
        serverSelectionTimeoutMS:
          10000,

        connectTimeoutMS:
          10000,

        socketTimeoutMS:
          45000
      }
    );

    console.log(
      "✅ MongoDB Connected Successfully!"
    );

    console.log(
      "Database:",
      mongoose.connection.name
    );

    // Create admin if not exists
    await createDefaultAdmin();

  } catch (error) {
    console.error(
      "❌ MongoDB Connection Failed:"
    );

    console.error(
      error.message
    );

    process.exit(1);
  }
}

// =====================================================
// START SERVER
// =====================================================

async function startServer() {
  await connectMongoDB();

  app.listen(
    PORT,
    () => {

      console.log("");

      console.log(
        "======================================"
      );

      console.log(
        "🚀 InterviewEase Backend Started"
      );

      console.log(
        "======================================"
      );

      console.log(
        `🌐 Server: http://localhost:${PORT}`
      );

      console.log(
        `🔐 Login: http://localhost:${PORT}/api/auth/login`
      );

      console.log(
        `👤 Auth Check: http://localhost:${PORT}/api/auth/me`
      );

      console.log(
        `📋 API: http://localhost:${PORT}/api/interviews`
      );

      console.log(
        `❤️ Health: http://localhost:${PORT}/`
      );

      console.log(
        "======================================"
      );
    }
  );
}

// =====================================================
// START APPLICATION
// =====================================================

startServer();