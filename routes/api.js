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

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Export endpoints
router.get('/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { categoryIds, searchTerm } = req.query;

    // Build query based on filters
    const query = { userId: req.user._id };

    // Apply category filter if provided
    if (categoryIds && categoryIds !== 'all') {
      const categoryIdArray = Array.isArray(categoryIds) ? categoryIds : categoryIds.split(',');
      if (categoryIdArray.length > 0 && !categoryIdArray.includes('__UNCATEGORIZED__')) {
        query.categories = { $in: categoryIdArray };
      } else if (categoryIdArray.includes('__UNCATEGORIZED__')) {
        query.$or = [
          { categories: { $in: categoryIdArray.filter(id => id !== '__UNCATEGORIZED__') } },
          { categories: { $size: 0 } },
          { categories: { $exists: false } }
        ];
      }
    }

    // Fetch URLs
    let urls = await Url.find(query)
      .populate({ path: 'categories', select: 'name' })
      .sort({ pinned: -1, createdAt: -1 })
      .lean();

    // Apply search filter if provided
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.trim().toLowerCase();
      urls = urls.filter(
        url =>
          (url.description || '').toLowerCase().includes(searchLower) ||
          (url.url || '').toLowerCase().includes(searchLower)
      );
    }

    // Generate export based on format
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `weblauncher-export-${timestamp}`;

    if (format === 'pdf') {
      const PDFDocument = (await import('pdfkit')).default;
      const doc = new PDFDocument({ margin: 50, size: 'LETTER' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

      doc.pipe(res);

      doc.fontSize(20).text('WebLauncher Export', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Exported: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      if (urls.length === 0) {
        doc.fontSize(14).text('No URLs to export.', { align: 'center' });
      } else {
        urls.forEach((url, index) => {
          if (index > 0) {
            doc.moveDown();
          }

          doc.fontSize(14).font('Helvetica-Bold').text(url.description || 'Untitled', { continued: false });
          doc.fontSize(10).font('Helvetica').fillColor('blue').text(url.url, { link: url.url, underline: true });
          doc.fillColor('black');

          if (url.categories && url.categories.length > 0) {
            const categoryNames = url.categories.map(cat => cat.name).join(', ');
            doc.fontSize(9).fillColor('gray').text(`Categories: ${categoryNames}`);
            doc.fillColor('black');
          }

          if (url.pinned) {
            doc.fontSize(9).fillColor('blue').text('📌 Pinned');
            doc.fillColor('black');
          }

          doc.fontSize(8).fillColor('gray').text(`Created: ${new Date(url.createdAt).toLocaleDateString()}`);
          doc.fillColor('black');
        });
      }

      doc.end();
    } else if (format === 'markdown') {
      let markdown = '# WebLauncher Export\n\n';
      markdown += `**Exported:** ${new Date().toLocaleString()}\n\n`;
      markdown += `**Total URLs:** ${urls.length}\n\n`;
      markdown += '---\n\n';

      if (urls.length === 0) {
        markdown += '*No URLs to export.*\n';
      } else {
        urls.forEach((url, index) => {
          markdown += `## ${index + 1}. ${url.description || 'Untitled'}\n\n`;
          markdown += `**URL:** [${url.url}](${url.url})\n\n`;

          if (url.categories && url.categories.length > 0) {
            const categoryNames = url.categories.map(cat => cat.name).join(', ');
            markdown += `**Categories:** ${categoryNames}\n\n`;
          }

          if (url.pinned) {
            markdown += '**Status:** 📌 Pinned\n\n';
          }

          markdown += `**Created:** ${new Date(url.createdAt).toLocaleDateString()}\n\n`;
          markdown += '---\n\n';
        });
      }

      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.md"`);
      res.send(markdown);
    } else if (format === 'csv') {
      const csvRows = ['Description,URL,Categories,Pinned,Created'];

      urls.forEach(url => {
        const description = (url.description || 'Untitled').replace(/"/g, '""');
        const urlValue = (url.url || '').replace(/"/g, '""');
        const categories = url.categories && url.categories.length > 0 ? url.categories.map(cat => cat.name).join('; ') : '';
        const pinned = url.pinned ? 'Yes' : 'No';
        const created = new Date(url.createdAt).toLocaleDateString();

        csvRows.push(`"${description}","${urlValue}","${categories}","${pinned}","${created}"`);
      });

      const csv = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send('\ufeff' + csv); // BOM for Excel compatibility
    } else if (format === 'json') {
      // JSON export for backup/restore and programmatic access
      const exportData = {
        version: '1.0',
        exported: new Date().toISOString(),
        totalUrls: urls.length,
        urls: urls.map(url => ({
          description: url.description || 'Untitled',
          url: url.url,
          categories: url.categories && url.categories.length > 0 ? url.categories.map(cat => cat.name) : [],
          pinned: url.pinned || false,
          createdAt: url.createdAt,
          updatedAt: url.updatedAt
        }))
      };

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json(exportData);
    } else if (format === 'html') {
      // HTML (Netscape Bookmark Format) for browser import compatibility
      let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

      // Group URLs by category for better organization
      // Add each URL to its first category only to avoid duplicates
      const categorizedUrls = {};
      const uncategorizedUrls = [];

      urls.forEach(url => {
        if (url.categories && url.categories.length > 0) {
          // Add URL to its first category only to avoid duplicates
          const firstCategory = url.categories[0].name;
          if (!categorizedUrls[firstCategory]) {
            categorizedUrls[firstCategory] = [];
          }
          categorizedUrls[firstCategory].push(url);
        } else {
          uncategorizedUrls.push(url);
        }
      });

      // Add categorized URLs
      Object.keys(categorizedUrls).sort().forEach(categoryName => {
        html += `    <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}" LAST_MODIFIED="${Math.floor(Date.now() / 1000)}">${escapeHtml(categoryName)}</H3>\n`;
        html += `    <DL><p>\n`;
        categorizedUrls[categoryName].forEach(url => {
          const addDate = Math.floor(new Date(url.createdAt).getTime() / 1000);
          const description = escapeHtml(url.description || url.url);
          const urlValue = escapeHtml(url.url);
          html += `        <DT><A HREF="${urlValue}" ADD_DATE="${addDate}"${url.pinned ? ' ICON="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="' : ''}>${description}</A>\n`;
        });
        html += `    </DL><p>\n`;
      });

      // Add uncategorized URLs
      if (uncategorizedUrls.length > 0) {
        uncategorizedUrls.forEach(url => {
          const addDate = Math.floor(new Date(url.createdAt).getTime() / 1000);
          const description = escapeHtml(url.description || url.url);
          const urlValue = escapeHtml(url.url);
          html += `    <DT><A HREF="${urlValue}" ADD_DATE="${addDate}"${url.pinned ? ' ICON="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="' : ''}>${description}</A>\n`;
        });
      }

      html += `</DL><p>\n`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.html"`);
      res.send(html);
    } else {
      return res.status(400).json({ error: 'Invalid export format. Supported formats: pdf, markdown, csv, json, html' });
    }
  } catch (error) {
    console.error('Error exporting URLs:', error);
    res.status(500).json({ error: 'Failed to export URLs' });
  }
});

export default router;