const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const logger = require('../utils/logger');
const User = require('../models/user.model');

const verifyToken = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).send({ message: "No token provided" });
    }
    
    // Check if the header has the Bearer format
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).send({ message: "Token error" });
    }
    
    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).send({ message: "Token malformatted" });
    }
    
    // Verify the token
    jwt.verify(token, authConfig.secret, async (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).send({ message: "Unauthorized - invalid token" });
      }
      
      // Check if user still exists in database
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).send({ message: "User no longer exists" });
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).send({ message: "Account is inactive or pending approval" });
      }
      
      // Store user info in request object
      req.userId = decoded.id;
      req.userRole = decoded.role;
      req.user = user;
      
      next();
    });
  } catch (error) {
    logger.error(`Auth Middleware Error: ${error.message}`);
    return res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = verifyToken;