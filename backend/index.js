const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();
require("./passportConfig");

const authRoutes = require("./routes/auth");
const calendarRoutes = require("./routes/calendar");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "https://calendar-io-alrg.vercel.app", credentials: true }));
app.use(
  session({
    secret: process.env.COOKIE_KEY, // Use a strong secret key
    resave: false, // Prevent resaving session if not modified
    saveUninitialized: false, // Prevent saving empty sessions
    cookie: {
      httpOnly: true,    // Ensures the cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production',
      // secure: true, // Set true if using HTTPS
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
