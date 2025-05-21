const Persona = require('../models/persona.model');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getAllPersonas = async (req, res) => {
  try {
    const personas = await Persona.getAll();
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
    
    // Create persona
    const personaId = await Persona.create({
      name: req.body.name,
      description: req.body.description,
      age_range: req.body.age_range,
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
    
    // Update persona
    await Persona.update(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      age_range: req.body.age_range,
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