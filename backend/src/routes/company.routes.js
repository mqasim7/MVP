// backend/src/routes/company.routes.js
const express = require('express');
const { body } = require('express-validator');
const companyController = require('../controllers/company.controller');
const verifyToken = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// Get all companies
router.get('/', companyController.getAllCompanies);

// Get company by ID
router.get('/:id', companyController.getCompanyById);

// Create company
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('industry').optional().isString().withMessage('Industry must be a string'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('logo_url').optional().isString().withMessage('Logo URL must be a valid URL'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
  ],
  companyController.createCompany
);

// Update company
router.put(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('industry').optional().isString().withMessage('Industry must be a string'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('logo_url').optional().isString().withMessage('Logo URL must be a valid URL'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
  ],
  companyController.updateCompany
);

// Delete company
router.delete('/:id', companyController.deleteCompany);

// Get company users
router.get('/:id/users', companyController.getCompanyUsers);

// Get company statistics
router.get('/:id/stats', companyController.getCompanyStats);

module.exports = router;