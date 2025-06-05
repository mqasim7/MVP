const express = require('express');
const { body, query } = require('express-validator');
const insightsController = require('../controllers/insights.controller');
const verifyToken = require('../middleware/auth.middleware');
const { isEditor } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all insights (supports filtering by category, platform, actionable, company, search, date range, sorting, pagination)
router.get('/', insightsController.getAllInsights);

// Search insights
router.get('/search', 
  [
    query('q').notEmpty().withMessage('Search term is required'),
    query('category').optional().isIn(['Content', 'Audience', 'Engagement', 'Conversion']).withMessage('Invalid category'),
    query('platform').optional().isString().withMessage('Platform must be a string'),
    query('company').optional().isInt({ min: 1 }).withMessage('Company ID must be a valid integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  insightsController.searchInsights
);

// Get insight statistics (supports company filtering)
router.get('/stats', insightsController.getInsightStats);

// Get insight by ID
router.get('/:id', insightsController.getInsightById);

// Get insights by company
router.get('/company/:companyId', insightsController.getInsightsByCompany);

// Create insight (editor or admin only)
router.post(
  '/',
  [
    isEditor,
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').isString().withMessage('Description is required'),
    body('content').optional().isString().withMessage('Content must be a string'),
    body('date').isISO8601().withMessage('Date must be a valid date'),
    body('platform').optional().isString().withMessage('Platform must be a string'),
    body('trend').optional().isString().withMessage('Trend must be a string'),
    body('image_url').optional().isURL().withMessage('Image URL must be a valid URL'),
    body('actionable').optional().isBoolean().withMessage('Actionable must be a boolean'),
    body('category').isIn(['Content', 'Audience', 'Engagement', 'Conversion']).withMessage('Invalid category'),
    body('company_id').optional().isInt({ min: 1 }).withMessage('Company ID must be a valid integer'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
  ],
  insightsController.createInsight
);

// Update insight (editor or admin only)
router.put(
  '/:id',
  [
    isEditor,
    body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('content').optional().isString().withMessage('Content must be a string'),
    body('date').optional().isISO8601().withMessage('Date must be a valid date'),
    body('platform').optional().isString().withMessage('Platform must be a string'),
    body('trend').optional().isString().withMessage('Trend must be a string'),
    body('image_url').optional().isURL().withMessage('Image URL must be a valid URL'),
    body('actionable').optional().isBoolean().withMessage('Actionable must be a boolean'),
    body('category').optional().isIn(['Content', 'Audience', 'Engagement', 'Conversion']).withMessage('Invalid category'),
    body('company_id').optional().isInt({ min: 1 }).withMessage('Company ID must be a valid integer'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
  ],
  insightsController.updateInsight
);

// Delete insight (editor or admin only)
router.delete('/:id', isEditor, insightsController.deleteInsight);

module.exports = router;