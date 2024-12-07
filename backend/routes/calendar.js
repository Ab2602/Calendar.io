const express = require("express");
const { google } = require("googleapis");
const User = require("../models/User");

const router = express.Router();

// Middleware to ensure the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

// Fetch events from Google Calendar
router.get("/events", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.accessToken) {
      return res.status(401).json({ error: "No access token available" });
    }

    // Initialize OAuth2 client with the access token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: user.accessToken });

    const calendar = google.calendar({ version: "v3", auth });
    const events = await calendar.events.list({
      calendarId: "primary",
    });

    res.json(events.data.items);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Add a new event to Google Calendar
router.post("/events", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.accessToken) {
      return res.status(401).json({ error: "No access token available" });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: user.accessToken });

    const calendar = google.calendar({ version: "v3", auth });
    const { summary, start, end } = req.body;

    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary,
        start: { dateTime: start },
        end: { dateTime: end },
      },
    });

    res.json(event.data);
  } catch (err) {
    console.error("Error adding event:", err);
    res.status(500).json({ error: "Failed to add event" });
  }
});

// Delete an event from Google Calendar
router.delete("/events/:id", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.accessToken) {
      return res.status(401).json({ error: "No access token available" });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: user.accessToken });

    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.delete({
      calendarId: "primary",
      eventId: req.params.id,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = router;
