// backend/src/routes/persona.routes.js  
const express = require('express');
const { body } = require('express-validator');
const personaController = require('../controllers/persona.controller');
const verifyToken = require('../middleware/auth.middleware');
const { isEditor } = require('../middleware/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all personas (supports company filtering via query parameter)
router.get('/', personaController.getAllPersonas);

// Get persona by ID
router.get('/:id', personaController.getPersonaById);

// Get personas by company
router.get('/company/:companyId', personaController.getPersonasByCompany);

// Create persona (editor or admin only)
router.post(
  '/',
  [
    isEditor,
    body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('age_range').optional().isString().withMessage('Age range must be a string'),
    body('company_id').optional().isInt({ min: 1 }).withMessage('Company ID must be a valid integer'),
    body('active').optional().isBoolean().withMessage('Active must be a boolean'),
    body('platforms').optional().isArray().withMessage('Platforms must be an array'),
    body('interests').optional().isArray().withMessage('Interests must be an array')
  ],
  personaController.createPersona
);

// Update persona (editor or admin only)
router.put(
  '/:id',
  [
    isEditor,
    body('name').optional().trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('age_range').optional().isString().withMessage('Age range must be a string'),
    body('company_id').optional().isInt({ min: 1 }).withMessage('Company ID must be a valid integer'),
    body('active').optional().isBoolean().withMessage('Active must be a boolean'),
    body('platforms').optional().isArray().withMessage('Platforms must be an array'),
    body('interests').optional().isArray().withMessage('Interests must be an array')
  ],
  personaController.updatePersona
);

// Delete persona (editor or admin only)
router.delete('/:id', isEditor, personaController.deletePersona);

// Get all platforms
router.get('/platforms/all', personaController.getPlatforms);

// Get all interests
router.get('/interests/all', personaController.getInterests);

module.exports = router;