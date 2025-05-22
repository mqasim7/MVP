// backend/src/controllers/company.controller.js
const Company = require('../models/company.model');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.getAll();
    res.status(200).send(companies);
  } catch (error) {
    logger.error(`Get All Companies Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving companies" });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).send({ message: "Company not found" });
    }
    
    // Get company statistics
    const stats = await Company.getStats(req.params.id);
    
    res.status(200).send({
      ...company,
      stats
    });
  } catch (error) {
    logger.error(`Get Company Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving company" });
  }
};

exports.createCompany = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Create company
    const companyId = await Company.create({
      name: req.body.name,
      description: req.body.description,
      industry: req.body.industry,
      website: req.body.website,
      logo_url: req.body.logo_url,
      status: req.body.status || 'active'
    });
    
    // Fetch the created company
    const company = await Company.findById(companyId);
    
    res.status(201).send({
      message: "Company created successfully!",
      company
    });
  } catch (error) {
    logger.error(`Create Company Error: ${error.message}`);
    res.status(500).send({ message: "Error creating company" });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if company exists
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).send({ message: "Company not found" });
    }
    
    // Update company
    await Company.update(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      industry: req.body.industry,
      website: req.body.website,
      logo_url: req.body.logo_url,
      status: req.body.status
    });
    
    // Fetch updated company
    const updatedCompany = await Company.findById(req.params.id);
    
    res.status(200).send({
      message: "Company updated successfully",
      company: updatedCompany
    });
  } catch (error) {
    logger.error(`Update Company Error: ${error.message}`);
    res.status(500).send({ message: "Error updating company" });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    // Check if company exists
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).send({ message: "Company not found" });
    }
    
    // Check if company has users
    const users = await Company.getUsers(req.params.id);
    if (users.length > 0) {
      return res.status(400).send({ 
        message: "Cannot delete company with existing users. Please remove all users first." 
      });
    }
    
    // Soft delete company
    await Company.delete(req.params.id);
    
    res.status(200).send({ message: "Company deleted successfully" });
  } catch (error) {
    logger.error(`Delete Company Error: ${error.message}`);
    res.status(500).send({ message: "Error deleting company" });
  }
};

exports.getCompanyUsers = async (req, res) => {
  try {
    // Check if company exists
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).send({ message: "Company not found" });
    }
    
    const users = await Company.getUsers(req.params.id);
    res.status(200).send(users);
  } catch (error) {
    logger.error(`Get Company Users Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving company users" });
  }
};

exports.getCompanyStats = async (req, res) => {
  try {
    // Check if company exists
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).send({ message: "Company not found" });
    }
    
    const stats = await Company.getStats(req.params.id);
    res.status(200).send(stats);
  } catch (error) {
    logger.error(`Get Company Stats Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving company statistics" });
  }
};