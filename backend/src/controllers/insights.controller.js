const Insights = require('../models/insights.model');
const Company = require('../models/company.model');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getAllInsights = async (req, res) => {
  try {
    // Filter insights based on query params
    const filters = {};
    
    if (req.query.category) {
      filters.category = req.query.category;
    }
    
    if (req.query.platform) {
      filters.platform = req.query.platform;
    }
    
    if (req.query.actionable === 'true') {
      filters.actionable = true;
    }
    
    if (req.query.company) {
      filters.company_id = req.query.company;
    }
    
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    if (req.query.dateFrom) {
      filters.dateFrom = req.query.dateFrom;
    }
    
    if (req.query.dateTo) {
      filters.dateTo = req.query.dateTo;
    }
    
    if (req.query.sortBy) {
      filters.sortBy = req.query.sortBy;
    }
    
    if (req.query.sortOrder) {
      filters.sortOrder = req.query.sortOrder;
    }
    
    if (req.query.limit) {
      filters.limit = req.query.limit;
      if (req.query.offset) {
        filters.offset = req.query.offset;
      }
    }
    
    const insights = await Insights.getAll(filters);
    res.status(200).send(insights);
  } catch (error) {
    logger.error(`Get All Insights Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving insights" });
  }
};

exports.getInsightById = async (req, res) => {
  try {
    const insight = await Insights.findById(req.params.id);
    
    if (!insight) {
      return res.status(404).send({ message: "Insight not found" });
    }
    
    res.status(200).send(insight);
  } catch (error) {
    logger.error(`Get Insight Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving insight" });
  }
};

exports.createInsight = async (req, res) => {
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
        return res.status(400).send({ message: "Cannot create insight for inactive company" });
      }
    }
    
    // Create insight
    const insightId = await Insights.create({
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      date: req.body.date,
      platform: req.body.platform,
      trend: req.body.trend,
      image_url: req.body.image_url,
      actionable: req.body.actionable,
      category: req.body.category,
      author_id: req.userId,
      company_id: req.body.company_id,
      tags: req.body.tags
    });
    
    // Fetch the created insight
    const insight = await Insights.findById(insightId);
    
    res.status(201).send({
      message: "Insight created successfully!",
      insight
    });
  } catch (error) {
    logger.error(`Create Insight Error: ${error.message}`);
    res.status(500).send({ message: "Error creating insight" });
  }
};

exports.updateInsight = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if insight exists
    const insight = await Insights.findById(req.params.id);
    if (!insight) {
      return res.status(404).send({ message: "Insight not found" });
    }
    
    // Validate company if being changed
    if (req.body.company_id && req.body.company_id !== insight.company_id) {
      const company = await Company.findById(req.body.company_id);
      if (!company) {
        return res.status(400).send({ message: "Invalid company ID" });
      }
      if (company.status !== 'active') {
        return res.status(400).send({ message: "Cannot move insight to inactive company" });
      }
    }
    
    // Update insight
    await Insights.update(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      date: req.body.date,
      platform: req.body.platform,
      trend: req.body.trend,
      image_url: req.body.image_url,
      actionable: req.body.actionable,
      category: req.body.category,
      company_id: req.body.company_id,
      tags: req.body.tags
    });
    
    // Fetch updated insight
    const updatedInsight = await Insights.findById(req.params.id);
    
    res.status(200).send({
      message: "Insight updated successfully",
      insight: updatedInsight
    });
  } catch (error) {
    logger.error(`Update Insight Error: ${error.message}`);
    res.status(500).send({ message: "Error updating insight" });
  }
};

exports.deleteInsight = async (req, res) => {
  try {
    // Check if insight exists
    const insight = await Insights.findById(req.params.id);
    if (!insight) {
      return res.status(404).send({ message: "Insight not found" });
    }
    
    // Delete insight
    await Insights.delete(req.params.id);
    
    res.status(200).send({ message: "Insight deleted successfully" });
  } catch (error) {
    logger.error(`Delete Insight Error: ${error.message}`);
    res.status(500).send({ message: "Error deleting insight" });
  }
};

exports.getInsightsByCompany = async (req, res) => {
  try {
    // Check if company exists
    const company = await Company.findById(req.params.companyId);
    if (!company) {
      return res.status(404).send({ message: "Company not found" });
    }
    
    const insights = await Insights.getByCompany(req.params.companyId);
    res.status(200).send(insights);
  } catch (error) {
    logger.error(`Get Insights By Company Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving company insights" });
  }
};

exports.getInsightStats = async (req, res) => {
  try {
    const companyId = req.query.company;
    
    // Validate company if provided
    if (companyId) {
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).send({ message: "Company not found" });
      }
    }
    
    const stats = await Insights.getStats(companyId);
    res.status(200).send(stats);
  } catch (error) {
    logger.error(`Get Insight Stats Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving insight statistics" });
  }
};

exports.searchInsights = async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm) {
      return res.status(400).send({ message: "Search term is required" });
    }
    
    const filters = {};
    
    if (req.query.category) {
      filters.category = req.query.category;
    }
    
    if (req.query.platform) {
      filters.platform = req.query.platform;
    }
    
    if (req.query.company) {
      filters.company_id = req.query.company;
    }
    
    if (req.query.limit) {
      filters.limit = req.query.limit;
    }
    
    const insights = await Insights.search(searchTerm, filters);
    res.status(200).send(insights);
  } catch (error) {
    logger.error(`Search Insights Error: ${error.message}`);
    res.status(500).send({ message: "Error searching insights" });
  }
};