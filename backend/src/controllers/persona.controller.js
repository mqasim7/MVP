// backend/src/controllers/persona.controller.js
const Persona = require('../models/persona.model');
const Company = require('../models/company.model');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getAllPersonas = async (req, res) => {
  try {
    const filters = {};
    
    // Add company filter if provided
    if (req.query.company) {
      filters.company_id = req.query.company;
    }
    
    // Add active filter if provided
    if (req.query.active !== undefined) {
      filters.active = req.query.active === 'true';
    }
    
    const personas = await Persona.getAll(filters);
    res.status(200).send(personas);
  } catch (error) {
    logger.error(`Get All Personas Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving personas" });
  }
};

exports.getPersonaById = async (req, res) => {
  try {
    const persona = await Persona.findById(req.params.id);
    
    if (!persona) {
      return res.status(404).send({ message: "Persona not found" });
    }
    
    res.status(200).send(persona);
  } catch (error) {
    logger.error(`Get Persona Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving persona" });
  }
};

exports.createPersona = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Validate company if provided
    if (req.body.company_id) {
      const company = await Company.findById(req.body.company_id);
      if (!company) {
        return res.status(400).send({ message: "Invalid company ID" });
      }
      if (company.status !== 'active') {
        return res.status(400).send({ message: "Cannot create persona for inactive company" });
      }
    }
    
    // Create persona
    const personaId = await Persona.create({
      name: req.body.name,
      description: req.body.description,
      age_range: req.body.age_range,
      company_id: req.body.company_id,
      active: req.body.active,
      platforms: req.body.platforms,
      interests: req.body.interests
    });
    
    // Fetch the created persona
    const persona = await Persona.findById(personaId);
    
    res.status(201).send({
      message: "Persona created successfully!",
      persona
    });
  } catch (error) {
    logger.error(`Create Persona Error: ${error.message}`);
    res.status(500).send({ message: "Error creating persona" });
  }
};

exports.updatePersona = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if persona exists
    const persona = await Persona.findById(req.params.id);
    if (!persona) {
      return res.status(404).send({ message: "Persona not found" });
    }
    
    // Validate company if being changed
    if (req.body.company_id && req.body.company_id !== persona.company_id) {
      const company = await Company.findById(req.body.company_id);
      if (!company) {
        return res.status(400).send({ message: "Invalid company ID" });
      }
      if (company.status !== 'active') {
        return res.status(400).send({ message: "Cannot move persona to inactive company" });
      }
    }
    
    // Update persona
    await Persona.update(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      age_range: req.body.age_range,
      company_id: req.body.company_id,
      active: req.body.active,
      platforms: req.body.platforms,
      interests: req.body.interests
    });
    
    // Fetch updated persona
    const updatedPersona = await Persona.findById(req.params.id);
    
    res.status(200).send({
      message: "Persona updated successfully",
      persona: updatedPersona
    });
  } catch (error) {
    logger.error(`Update Persona Error: ${error.message}`);
    res.status(500).send({ message: "Error updating persona" });
  }
};

exports.deletePersona = async (req, res) => {
  try {
    // Check if persona exists
    const persona = await Persona.findById(req.params.id);
    if (!persona) {
      return res.status(404).send({ message: "Persona not found" });
    }
    
    // Delete persona
    await Persona.delete(req.params.id);
    
    res.status(200).send({ message: "Persona deleted successfully" });
  } catch (error) {
    logger.error(`Delete Persona Error: ${error.message}`);
    res.status(500).send({ message: "Error deleting persona" });
  }
};

exports.getPersonasByCompany = async (req, res) => {
  try {
    // Check if company exists
    const company = await Company.findById(req.params.companyId);
    if (!company) {
      return res.status(404).send({ message: "Company not found" });
    }
    
    const personas = await Persona.getByCompany(req.params.companyId);
    res.status(200).send(personas);
  } catch (error) {
    logger.error(`Get Personas By Company Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving company personas" });
  }
};

exports.getPlatforms = async (req, res) => {
  try {
    const platforms = await Persona.getPlatforms();
    res.status(200).send(platforms);
  } catch (error) {
    logger.error(`Get Platforms Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving platforms" });
  }
};

exports.getInterests = async (req, res) => {
  try {
    const interests = await Persona.getInterests();
    res.status(200).send(interests);
  } catch (error) {
    logger.error(`Get Interests Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving interests" });
  }
};
