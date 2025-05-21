const express = require('express');
const { body } = require('express-validator');
const feedController = require('../controllers/feed.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

// Get feed - Requires authentication
router.get('/', verifyToken, feedController.getFeed);

// Record engagement (view, like, comment, share)
router.post(
  '/:id/engagement',
  [
    verifyToken,
    body('type').isIn(['view', 'like', 'comment', 'share']).withMessage('Invalid engagement type')
  ],
  feedController.recordEngagement
);

module.exports = router;