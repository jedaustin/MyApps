import express from 'express';
import { body, validationResult } from 'express-validator';
import Url from '../models/Url.js';
import { ensureAuthenticated } from '../config/passport.js';

const router = express.Router();

// All routes in this file are protected
router.use(ensureAuthenticated);

// GET /api/urls - Get all URLs for the logged-in user
router.get('/urls', async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ pinned: -1, createdAt: -1 });
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

// POST /api/urls - Create a new URL
router.post(
  '/urls',
  [
    body('description')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description is required and must be between 1 and 500 characters'),
    body('url').trim().isURL().withMessage('A valid URL is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { description, url } = req.body;
      const newUrl = await Url.create({
        userId: req.user._id,
        description,
        url
      });
      res.status(201).json(newUrl);
    } catch (error) {
      console.error('Error creating URL:', error);
      res.status(500).json({ error: 'Failed to create URL' });
    }
  }
);

// PUT /api/urls/:id - Update a URL
router.put(
  '/urls/:id',
  [
    body('description')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description is required'),
    body('url').trim().isURL().withMessage('A valid URL is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { description, url } = req.body;
      const updatedUrl = await Url.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { description, url },
        { new: true, runValidators: true }
      );

      if (!updatedUrl) {
        return res.status(404).json({ error: 'URL not found or you do not have permission to edit it' });
      }
      res.json(updatedUrl);
    } catch (error) {
      console.error('Error updating URL:', error);
      res.status(500).json({ error: 'Failed to update URL' });
    }
  }
);

// PUT /api/urls/:id/pin - Toggle pin status
router.put('/urls/:id/pin', async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });

    if (!url) {
      return res.status(404).json({ error: 'URL not found or you do not have permission to edit it' });
    }

    // Toggle the pinned status
    url.pinned = !url.pinned;
    await url.save();

    res.json(url);
  } catch (error) {
    console.error('Error toggling pin status:', error);
    res.status(500).json({ error: 'Failed to update pin status' });
  }
});

// DELETE /api/urls/:id - Delete a URL
router.delete('/urls/:id', async (req, res) => {
  try {
    const deletedUrl = await Url.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deletedUrl) {
      return res.status(404).json({ error: 'URL not found or you do not have permission to delete it' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Failed to delete URL' });
  }
});

export default router;