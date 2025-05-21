const User = require('../models/user.model');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.status(200).send(users);
  } catch (error) {
    logger.error(`Get All Users Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    
    res.status(200).send(user);
  } catch (error) {
    logger.error(`Get User Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving user" });
  }
};

exports.createUser = async (req, res) => {
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
      role: req.body.role,
      department: req.body.department,
      status: req.body.status || 'pending'
    });
    
    // Fetch the created user (without password)
    const user = await User.findById(userId);
    
    res.status(201).send({
      message: "User created successfully!",
      user
    });
  } catch (error) {
    logger.error(`Create User Error: ${error.message}`);
    res.status(500).send({ message: "Error creating user" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    
    // Update user
    const result = await User.update(req.params.id, {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      department: req.body.department,
      status: req.body.status
    });
    
    // Fetch updated user
    const updatedUser = await User.findById(req.params.id);
    
    res.status(200).send({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    logger.error(`Update User Error: ${error.message}`);
    res.status(500).send({ message: "Error updating user" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    
    // Generate a random password or use the provided one
    const newPassword = req.body.password || Math.random().toString(36).slice(-8);
    
    // Update the password
    await User.updatePassword(req.params.id, newPassword);
    
    res.status(200).send({ 
      message: "Password reset successfully",
      password: req.body.password ? undefined : newPassword // Only return generated passwords
    });
  } catch (error) {
    logger.error(`Reset Password Error: ${error.message}`);
    res.status(500).send({ message: "Error resetting password" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    
    // Prevent self-deletion
    if (req.params.id == req.userId) {
      return res.status(400).send({ message: "You cannot delete your own account" });
    }
    
    // Delete user
    await User.delete(req.params.id);
    
    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    logger.error(`Delete User Error: ${error.message}`);
    res.status(500).send({ message: "Error deleting user" });
  }
};