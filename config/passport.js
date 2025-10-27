import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// --- JWT Generation ---
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// --- Authentication Middleware ---
export const ensureAuthenticated = (req, res, next) => {
  // Passport adds the `isAuthenticated()` method to the request object.
  // If the user is authenticated, the request will proceed.
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated. Please log in.' });
};

// --- Google OAuth 2.0 Strategy ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find existing user by Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // If no user, find by email to link accounts
        const googleEmail = profile.emails?.[0]?.value;
        if (!googleEmail) {
          return done(new Error('Google account has no email address.'), null);
        }

        user = await User.findOne({ email: googleEmail });

        if (user) {
          // Link Google ID to existing local account
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // If no user exists at all, create a new one
        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: googleEmail,
          username: googleEmail // Use email as username
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// --- Local Strategy (Email/Password) ---
passport.use(
  new LocalStrategy({
    usernameField: 'email' // Tell Passport to use the 'email' field
  }, async (email, password, done) => {
    try {
      // Find user by email, which is also their username
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// --- Session Management ---
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

export { passport };