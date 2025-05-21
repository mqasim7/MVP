require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || "your-secret-key",
  jwtExpiration: process.env.JWT_EXPIRES_IN || 86400 // 24 hours in seconds
};