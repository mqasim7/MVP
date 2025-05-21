const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all users (admin only)
router.get('/', isAdmin, userController.getAllUsers);

// Get user by ID (admin only)
router.get('/:id', isAdmin, userController.getUserById);

// Create user (admin only)
router.post(
  '/',
  [
    isAdmin,
    body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'editor', 'viewer']).withMessage('Invalid role'),
    body('department').optional().isString().withMessage('Department must be a string'),
    body('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('Invalid status')
  ],
  userController.createUser
);

// Update user (admin only)
router.put(
  '/:id',
  [
    isAdmin,
    body('name').optional().trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('role').optional().isIn(['admin', 'editor', 'viewer']).withMessage('Invalid role'),
    body('department').optional().isString().withMessage('Department must be a string'),
    body('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('Invalid status')
  ],
  userController.updateUser
);

// Reset user password (admin only)
router.post(
  '/:id/reset-password',
  [
    isAdmin,
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  userController.resetPassword
);

// Delete user (admin only)
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;