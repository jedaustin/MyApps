import express from 'express';
import { body, validationResult } from 'express-validator';
import Url from '../models/Url.js';
import Category from '../models/Category.js';
import { ensureAuthenticated } from '../config/passport.js';

const router = express.Router();

const DEFAULT_CATEGORY_NAMES = [
  'Productivity',
  'Media & Entertainment',
  'AI Tools',
  'Utilities',
  'Development & Code',
  'Communication & Social',
  'Design & Creativity',
  'Cloud Services',
  'System & Admin',
  'Education & Learning',
  'Finance & Shopping',
  'Health & Wellness',
  'Kids & Family',
  'Favorites/Starred',
  'Recently Used'
];

async function ensureSeedCategoriesForUser(userId) {
  const existingCount = await Category.countDocuments({ userId });
  if (existingCount > 0) {
    return Category.find({ userId })
      .collation({ locale: 'en', strength: 2 })
      .sort({ name: 1 })
      .lean();
  }

  const docsToInsert = DEFAULT_CATEGORY_NAMES.map(name => ({
    userId,
    name,
    isDefault: true
  }));

  try {
    await Category.insertMany(docsToInsert, { ordered: false });
  } catch (error) {
    // Ignore duplicate key errors caused by race conditions
    if (error?.code !== 11000) {
      throw error;
    }
  }

  return Category.find({ userId })
    .collation({ locale: 'en', strength: 2 })
    .sort({ name: 1 })
    .lean();
}

async function validateCategoryIds(categoryIds = [], userId) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(categoryIds.map(id => id.toString()))];
  const categories = await Category.find({
    _id: { $in: uniqueIds },
    userId
  }).select('_id');

  if (categories.length !== uniqueIds.length) {
    const validIds = new Set(categories.map(cat => cat._id.toString()));
    const invalidIds = uniqueIds.filter(id => !validIds.has(id));
    const error = new Error('One or more categories are invalid or unavailable.');
    error.statusCode = 400;
    error.details = { invalidCategoryIds: invalidIds };
    throw error;
  }

  return categories.map(cat => cat._id);
}

// All routes in this file are protected
router.use(ensureAuthenticated);

// GET /api/urls - Get all URLs for the logged-in user
router.get('/urls', async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id })
      .populate({ path: 'categories', select: 'name' })
      .sort({ pinned: -1, createdAt: -1 })
      .lean();
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
    body('url').trim().isURL().withMessage('A valid URL is required'),
    body('categories')
      .optional()
      .isArray({ max: 50 })
      .withMessage('Categories must be an array'),
    body('categories.*').optional().isMongoId().withMessage('Each category must be a valid identifier')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { description, url, categories: categoryIds = [] } = req.body;

      let validatedCategoryIds = [];
      try {
        validatedCategoryIds = await validateCategoryIds(categoryIds, req.user._id);
      } catch (validationError) {
        if (validationError.statusCode) {
          return res
            .status(validationError.statusCode)
            .json({ error: validationError.message, details: validationError.details });
        }
        throw validationError;
      }

      const newUrl = await Url.create({
        userId: req.user._id,
        description,
        url,
        categories: validatedCategoryIds
      });
      const populatedUrl = await newUrl.populate({ path: 'categories', select: 'name' });
      res.status(201).json(populatedUrl);
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
    body('url').trim().isURL().withMessage('A valid URL is required'),
    body('categories')
      .optional()
      .isArray({ max: 50 })
      .withMessage('Categories must be an array'),
    body('categories.*').optional().isMongoId().withMessage('Each category must be a valid identifier')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { description, url, categories: categoryIds = [] } = req.body;

      let validatedCategoryIds = [];
      try {
        validatedCategoryIds = await validateCategoryIds(categoryIds, req.user._id);
      } catch (validationError) {
        if (validationError.statusCode) {
          return res
            .status(validationError.statusCode)
            .json({ error: validationError.message, details: validationError.details });
        }
        throw validationError;
      }

      const updatedUrl = await Url.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { description, url, categories: validatedCategoryIds },
        { new: true, runValidators: true }
      ).populate({ path: 'categories', select: 'name' });

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

// Categories endpoints
router.get('/categories', async (req, res) => {
  try {
    const categories = await ensureSeedCategoriesForUser(req.user._id);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post(
  '/categories',
  [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Category name is required and must be between 1 and 100 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name } = req.body;
      const category = await Category.create({
        userId: req.user._id,
        name,
        isDefault: false
      });
      res.status(201).json(category);
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ error: 'You already have a category with that name.' });
      }
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
);

router.put(
  '/categories/:id',
  [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Category name is required and must be between 1 and 100 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
      if (!category) {
        return res.status(404).json({ error: 'Category not found or you do not have permission to edit it' });
      }

      category.name = req.body.name;

      await category.save();
      res.json(category);
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ error: 'You already have a category with that name.' });
      }
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
);

router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found or you do not have permission to delete it' });
    }

    await Url.updateMany(
      { userId: req.user._id, categories: category._id },
      { $pull: { categories: category._id } }
    );

    await category.deleteOne();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;