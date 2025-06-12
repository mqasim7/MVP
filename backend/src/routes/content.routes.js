const express = require('express');
const { body } = require('express-validator');
const contentController = require('../controllers/content.controller');
const verifyToken = require('../middleware/auth.middleware');
const { isEditor } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all content
router.get('/', contentController.getAllContent);

//get content by persona and company
router.get('/persona/:personaId/company/:companyId', contentController.getByPersonaAndCompany);
// Get content by ID
router.get('/:id', contentController.getContentById);

// Create content (editor or admin only)
router.post(
  '/',
  [
    isEditor,
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('type').isIn(['video', 'article', 'gallery', 'event']).withMessage('Invalid content type'),
    body('status').optional().isIn(['published', 'draft', 'scheduled', 'review']).withMessage('Invalid status'),
    body('content_url').optional().isURL().withMessage('Content URL must be a valid URL'),
    body('thumbnail_url').optional().isURL().withMessage('Thumbnail URL must be a valid URL'),
    body('scheduled_date').optional().isISO8601().withMessage('Scheduled date must be a valid date'),
    body('personas').optional().isArray().withMessage('Personas must be an array'),
    body('platforms').optional().isArray().withMessage('Platforms must be an array')
  ],
  contentController.createContent
);

// Update content (editor or admin only)
router.put(
  '/:id',
  [
    isEditor,
    body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('type').optional().isIn(['video', 'article', 'gallery', 'event']).withMessage('Invalid content type'),
    body('status').optional().isIn(['published', 'draft', 'scheduled', 'review']).withMessage('Invalid status'),
    body('content_url').optional().isURL().withMessage('Content URL must be a valid URL'),
    body('thumbnail_url').optional().isURL().withMessage('Thumbnail URL must be a valid URL'),
    body('scheduled_date').optional().isISO8601().withMessage('Scheduled date must be a valid date'),
    body('personas').optional().isArray().withMessage('Personas must be an array'),
    body('platforms').optional().isArray().withMessage('Platforms must be an array')
  ],
  contentController.updateContent
);

// Delete content (editor or admin only)
router.delete('/:id', isEditor, contentController.deleteContent);

// Publish content (editor or admin only)
router.post('/:id/publish', isEditor, contentController.publishContent);

// Update content metrics
router.post(
  '/:id/metrics',
  [
    isEditor,
    body('views').optional().isInt({ min: 0 }).withMessage('Views must be a positive integer'),
    body('likes').optional().isInt({ min: 0 }).withMessage('Likes must be a positive integer'),
    body('comments').optional().isInt({ min: 0 }).withMessage('Comments must be a positive integer'),
    body('shares').optional().isInt({ min: 0 }).withMessage('Shares must be a positive integer')
  ],
  contentController.updateContentMetrics
);

module.exports = router;