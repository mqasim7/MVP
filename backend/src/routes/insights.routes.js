const express = require('express');
const { body } = require('express-validator');
const insightsController = require('../controllers/insights.controller');
const verifyToken = require('../middleware/auth.middleware');
const { isEditor } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all insights
router.get('/', insightsController.getAllInsights);

// Get insight by ID
router.get('/:id', insightsController.getInsightById);

// Create insight (editor or admin only)
router.post(
  '/',
  [
    isEditor,
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').isString().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Date must be a valid date'),
    body('platform').optional().isString().withMessage('Platform must be a string'),
    body('trend').optional().isString().withMessage('Trend must be a string'),
    body('image_url').optional().isURL().withMessage('Image URL must be a valid URL'),
    body('actionable').optional().isBoolean().withMessage('Actionable must be a boolean'),
    body('category').isIn(['Content', 'Audience', 'Engagement', 'Conversion']).withMessage('Invalid category')
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
    body('date').optional().isISO8601().withMessage('Date must be a valid date'),
    body('platform').optional().isString().withMessage('Platform must be a string'),
    body('trend').optional().isString().withMessage('Trend must be a string'),
    body('image_url').optional().isURL().withMessage('Image URL must be a valid URL'),
    body('actionable').optional().isBoolean().withMessage('Actionable must be a boolean'),
    body('category').optional().isIn(['Content', 'Audience', 'Engagement', 'Conversion']).withMessage('Invalid category')
  ],
  insightsController.updateInsight
);

// Delete insight (editor or admin only)
router.delete('/:id', isEditor, insightsController.deleteInsight);

module.exports = router;