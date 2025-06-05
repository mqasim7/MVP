const Content = require('../models/content.model');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getAllContent = async (req, res) => {
  try {
    const content = await Content.getAll();
    res.status(200).send(content);
  } catch (error) {
    logger.error(`Get All Content Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving content" });
  }
};

exports.getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).send({ message: "Content not found" });
    }
    
    res.status(200).send(content);
  } catch (error) {
    logger.error(`Get Content Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving content" });
  }
};

exports.createContent = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Create content
    const contentId = await Content.create({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      status: req.body.status || 'draft',
      content_url: req.body.content_url,
      thumbnail_url: req.body.thumbnail_url,
      author_id: req.userId,
      scheduled_date: req.body.scheduled_date,
      personas: req.body.personas,
      platforms: req.body.platforms,
      company_id: req.body.company_id
    });
    
    // Fetch the created content
    const content = await Content.findById(contentId);
    
    res.status(201).send({
      message: "Content created successfully!",
      content
    });
  } catch (error) {
    logger.error(`Create Content Error: ${error.message}`);
    res.status(500).send({ message: "Error creating content" });
  }
};

exports.updateContent = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if content exists
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).send({ message: "Content not found" });
    }
    
    // Update content
    await Content.update(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      status: req.body.status,
      content_url: req.body.content_url,
      thumbnail_url: req.body.thumbnail_url,
      scheduled_date: req.body.scheduled_date,
      personas: req.body.personas,
      platforms: req.body.platforms,
      company_id: req.body.company_id
    });
    
    // Fetch updated content
    const updatedContent = await Content.findById(req.params.id);
    
    res.status(200).send({
      message: "Content updated successfully",
      content: updatedContent
    });
  } catch (error) {
    logger.error(`Update Content Error: ${error.message}`);
    res.status(500).send({ message: "Error updating content" });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    // Check if content exists
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).send({ message: "Content not found" });
    }
    
    // Delete content
    await Content.delete(req.params.id);
    
    res.status(200).send({ message: "Content deleted successfully" });
  } catch (error) {
    logger.error(`Delete Content Error: ${error.message}`);
    res.status(500).send({ message: "Error deleting content" });
  }
};

exports.publishContent = async (req, res) => {
  try {
    // Check if content exists
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).send({ message: "Content not found" });
    }
    
    // Check if content is already published
    if (content.status === 'published') {
      return res.status(400).send({ message: "Content is already published" });
    }
    
    // Publish content
    await Content.publish(req.params.id);
    
    // Fetch updated content
    const updatedContent = await Content.findById(req.params.id);
    
    res.status(200).send({
      message: "Content published successfully",
      content: updatedContent
    });
  } catch (error) {
    logger.error(`Publish Content Error: ${error.message}`);
    res.status(500).send({ message: "Error publishing content" });
  }
};

exports.updateContentMetrics = async (req, res) => {
  try {
    // Check if content exists
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).send({ message: "Content not found" });
    }
    
    // Update metrics
    await Content.updateMetrics(req.params.id, {
      views: req.body.views || 0,
      likes: req.body.likes || 0,
      comments: req.body.comments || 0,
      shares: req.body.shares || 0
    });
    
    // Fetch updated content
    const updatedContent = await Content.findById(req.params.id);
    
    res.status(200).send({
      message: "Content metrics updated successfully",
      content: updatedContent
    });
  } catch (error) {
    logger.error(`Update Content Metrics Error: ${error.message}`);
    res.status(500).send({ message: "Error updating content metrics" });
  }
};