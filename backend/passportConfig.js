const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `/auth/google/callback`,
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
        "profile",
        "email",
        "openid",
        "offline_access", // Request offline access for refresh tokens
      ],
      accessType: "offline", // Ensure offline access
      prompt: "consent", // Force user to re-consent and get a refreshToken
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Access Token:", accessToken); // Debugging
      console.log("Refresh Token:", refreshToken); // Debugging

      const { id, displayName, emails, photos } = profile;
      const email = emails[0]?.value;
      const profilePhoto = photos[0]?.value;

      try {
        // Check if the user already exists
        let user = await User.findOne({ googleId: id });

        if (user) {
          // Update existing user's tokens and last login
          user.accessToken = accessToken;
          if (refreshToken) {
            user.refreshToken = refreshToken; // Update refreshToken if available
          }
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        } else {
          // Create a new user if not found
          user = new User({
            googleId: id,
            name: displayName,
            email,
            profilePhoto,
            accessToken,
            refreshToken, // Save the refreshToken for later use
            lastLogin: new Date(),
          });
          await user.save();
          return done(null, user);
        }
      } catch (err) {
        console.error("Error during Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
