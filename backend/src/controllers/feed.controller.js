const Content = require('../models/content.model');
const Persona = require('../models/persona.model');
const logger = require('../utils/logger');

exports.getFeed = async (req, res) => {
  try {
    let feedItems;
    
    // If persona ID is provided, get content for that persona
    if (req.query.persona) {
      const persona = await Persona.findById(req.query.persona);
      if (!persona) {
        return res.status(404).send({ message: "Persona not found" });
      }
      
      feedItems = await Content.getByPersona(req.query.persona);
    } else {
      // Get all published content (default feed)
      // Here we could implement some algorithm to show relevant content
      const allContent = await Content.getAll();
      feedItems = allContent.filter(item => item.status === 'published');
    }
    
    // Optional filtering by platform
    if (req.query.platforms) {
      const platformsFilter = req.query.platforms.split(',');
      feedItems = feedItems.filter(item => {
        // Check if any of the item's platforms match the filter
        return item.platforms.some(platform => 
          platformsFilter.includes(platform.name.toLowerCase())
        );
      });
    }
    
    res.status(200).send(feedItems);
  } catch (error) {
    logger.error(`Get Feed Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving feed" });
  }
};

// Record content engagement (view, like, comment, share)
exports.recordEngagement = async (req, res) => {
  try {
    const { type } = req.body;
    
    // Check if content exists
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).send({ message: "Content not found" });
    }
    
    // Initialize metrics object
    const metrics = {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0
    };
    
    // Set metric based on engagement type
    if (['view', 'like', 'comment', 'share'].includes(type)) {
      metrics[`${type}s`] = 1;
    } else {
      return res.status(400).send({ message: "Invalid engagement type" });
    }
    
    // Update content metrics
    await Content.updateMetrics(req.params.id, metrics);
    
    res.status(200).send({ message: `${type} recorded successfully` });
  } catch (error) {
    logger.error(`Record Engagement Error: ${error.message}`);
    res.status(500).send({ message: "Error recording engagement" });
  }
};