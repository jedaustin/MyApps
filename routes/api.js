import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../config/passport.js';
import Url from '../models/Url.js';

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  // Check session first
  if (req.user) {
    return next();
  }
  
  // Fallback to JWT token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token && req.session && req.session.userId) {
    // User is authenticated via session
    return next();
  }
  
  if (token) {
    return authenticateToken(req, res, next);
  }
  
  return res.status(401).json({ error: 'Authentication required' });
};

// Get all URLs for the authenticated user
router.get('/urls', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.userId || req.session.userId || req.user?._id;
    const urls = await Url.find({ userId }).sort({ createdAt: -1 });
    res.json({ urls });
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

// Create a new URL
router.post(
  '/urls',
  requireAuth,
  [
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('url')
      .trim()
      .notEmpty()
      .withMessage('URL is required')
      .isURL()
      .withMessage('Please provide a valid URL')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user?.userId || req.session.userId || req.user?._id;
      const { description, url } = req.body;

      const newUrl = await Url.create({
        userId,
        description,
        url
      });

      res.status(201).json({
        message: 'URL created successfully',
        url: newUrl
      });
    } catch (error) {
      console.error('Error creating URL:', error);
      res.status(500).json({ error: 'Failed to create URL' });
    }
  }
);

// Update an existing URL
router.put(
  '/urls/:id',
  requireAuth,
  [
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty')
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('url')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('URL cannot be empty')
      .isURL()
      .withMessage('Please provide a valid URL')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user?.userId || req.session.userId || req.user?._id;
      const urlId = req.params.id;
      const { description, url } = req.body;

      // Check if URL exists and belongs to user
      const existingUrl = await Url.findOne({ _id: urlId, userId });
      
      if (!existingUrl) {
        return res.status(404).json({ error: 'URL not found or access denied' });
      }

      // Update only provided fields
      const updateData = {};
      if (description !== undefined) updateData.description = description;
      if (url !== undefined) updateData.url = url;

      const updatedUrl = await Url.findByIdAndUpdate(
        urlId,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        message: 'URL updated successfully',
        url: updatedUrl
      });
    } catch (error) {
      console.error('Error updating URL:', error);
      res.status(500).json({ error: 'Failed to update URL' });
    }
  }
);

// Delete a URL
router.delete('/urls/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.userId || req.session.userId || req.user?._id;
    const urlId = req.params.id;

    // Check if URL exists and belongs to user
    const existingUrl = await Url.findOne({ _id: urlId, userId });
    
    if (!existingUrl) {
      return res.status(404).json({ error: 'URL not found or access denied' });
    }

    await Url.findByIdAndDelete(urlId);

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Failed to delete URL' });
  }
});

export default router;

