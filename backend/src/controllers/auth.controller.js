const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).send({ message: "Email is already in use" });
    }
    
    // Create new user
    const userId = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'viewer',
      department: req.body.department,
      status: req.body.status || 'pending'
    });
    
    // Fetch the created user (without password)
    const user = await User.findById(userId);
    
    res.status(201).send({
      message: "User registered successfully!",
      user
    });
  } catch (error) {
    logger.error(`Registration Error: ${error.message}`);
    res.status(500).send({ message: "Error registering user" });
  }
};

exports.login = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Find user by email
    const user = await User.findByEmail(req.body.email);
    
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    
    // Verify password
    const passwordIsValid = await User.comparePassword(req.body.password, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid password"
      });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).send({ message: "Account is inactive or pending approval" });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      authConfig.secret,
      { expiresIn: authConfig.jwtExpiration }
    );
    
    // Update last login time
    await User.updateLastLogin(user.id);
    
    // Return user info and token
    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      accessToken: token
    });
  } catch (error) {
    logger.error(`Login Error: ${error.message}`);
    res.status(500).send({ message: "Error during login" });
  }
};

exports.me = async (req, res) => {
  try {
    // User is already verified in the auth middleware
    // Just return the user info that was attached to the request
    res.status(200).send(req.user);
  } catch (error) {
    logger.error(`Get User Profile Error: ${error.message}`);
    res.status(500).send({ message: "Error fetching user profile" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get the full user record including password
    const user = await User.findByEmail(req.user.email);
    
    // Verify current password
    const passwordIsValid = await User.comparePassword(currentPassword, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Current password is incorrect" });
    }
    
    // Update the password
    await User.updatePassword(req.userId, newPassword);
    
    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    logger.error(`Change Password Error: ${error.message}`);
    res.status(500).send({ message: "Error changing password" });
  }
};