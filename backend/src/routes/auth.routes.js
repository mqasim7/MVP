const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware');

const router = express.Router();

// Register new user
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'editor', 'viewer']).withMessage('Invalid role'),
    body('department').optional().isString().withMessage('Department must be a string'),
    body('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('Invalid status')
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// Get current user
router.get('/me', verifyToken, authController.me);

// Change password
router.post(
  '/change-password',
  [
    verifyToken,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  authController.changePassword
);

module.exports = router;