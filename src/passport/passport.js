const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require("bcryptjs");

// Configure Passport.js to use LocalStrategy
passport.use(
  new LocalStrategy(
    { usernameField: "username" },
    async (username, password, done) => {
      const adminCredentials = [
        { username: "admin1", password: "admin123" },
        { username: "admin2", password: "admin456" },
      ];

      const admin = adminCredentials.find((cred) => cred.username === username);
      if (admin && admin.password === password) {
        return done(null, { username: admin.username, role: "admin" });
      }

      try {
        const user = await User.findOne({
          $or: [{ email: username }, { mobile: username }],
        });

        if (!user) {
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }

        return done(null, {
          id: user.id,
          username: user.username,
          role: "customer",
        }); // Set role to 'customer'
      } catch (error) {
        return done(error);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
module.exports = passport;
