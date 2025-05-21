const Insights = require('../models/insights.model');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getAllInsights = async (req, res) => {
  try {
    // Filter insights based on query params
    let insights;
    
    if (req.query.category) {
      insights = await Insights.getByCategory(req.query.category);
    } else if (req.query.platform) {
      insights = await Insights.getByPlatform(req.query.platform);
    } else if (req.query.actionable === 'true') {
      insights = await Insights.getActionable();
    } else {
      insights = await Insights.getAll();
    }
    
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
    
    // Create insight
    const insightId = await Insights.create({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      platform: req.body.platform,
      trend: req.body.trend,
      image_url: req.body.image_url,
      actionable: req.body.actionable,
      category: req.body.category
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
    
    // Update insight
    await Insights.update(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      platform: req.body.platform,
      trend: req.body.trend,
      image_url: req.body.image_url,
      actionable: req.body.actionable,
      category: req.body.category
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