const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email", "https://www.googleapis.com/auth/calendar","https://www.googleapis.com/auth/calendar.events"] })
);

router.get("/google/callback",passport.authenticate("google", { failureRedirect: "/" }),(req, res) => {
    res.redirect("http://localhost:5173/dashboard");
  }
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Error logging out.");
    res.redirect("http://localhost:5173");
  });
});

router.get("/current-user", (req, res) => {
  if (req.user) {
    res.json({
      name: req.user.name,
      email: req.user.email,
      accessToken: req.user.accessToken, // Send access token
    });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

module.exports = router;


