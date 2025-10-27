import express from 'express';
import { body, validationResult } from 'express-validator';
import { passport, generateToken } from '../config/passport.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user._id);
    
    // Store token in session
    req.session.token = token;
    req.session.userId = req.user._id;
    
    // Successful authentication, redirect to dashboard
    res.redirect('/dashboard');
  }
);

// Local registration
router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('username')
      .trim()
      .toLowerCase()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-z0-9_]+$/)
      .withMessage('Username must be 3-50 characters and contain only lowercase letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, username, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Create new user
      const user = await User.create({
        name,
        username,
        password
      });

      // Auto login after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login failed after registration' });
        }
        const token = generateToken(user._id);
        req.session.token = token;
        req.session.userId = user._id;
        res.status(201).json({ 
          message: 'User registered successfully',
          userId: user._id,
          token
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Local login
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      req.session.token = token;
      req.session.userId = req.user._id;
      
      res.json({
        message: 'Login successful',
        userId: req.user._id,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.user });
});

export default router;

