// backend/src/controllers/user.controller.js (updated)
const User = require('../models/user.model');
const Company = require('../models/company.model');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getAllUsers = async (req, res) => {
  try {
    let users;
    
    // Check if filtering by company
    if (req.query.company) {
      users = await User.getByCompany(req.query.company);
    } else {
      users = await User.getAll();
    }
    
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
    
    // Validate company if provided
    if (req.body.company_id) {
      const company = await Company.findById(req.body.company_id);
      if (!company) {
        return res.status(400).send({ message: "Invalid company ID" });
      }
      if (company.status !== 'active') {
        return res.status(400).send({ message: "Cannot add users to inactive company" });
      }
    }
    
    // Set default role based on company context
    // If user is being added to a company by admin, default to viewer
    const defaultRole = req.body.company_id ? 'viewer' : (req.body.role || 'viewer');
    
    // Create new user
    const userId = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password || Math.random().toString(36).slice(-8), // Generate random password if not provided
      role: defaultRole,
      department: req.body.department,
      company_id: req.body.company_id,
      status: req.body.status || 'pending'
    });
    
    // Fetch the created user (without password)
    const user = await User.findById(userId);
    
    // In a real implementation, you would send an email invitation here
    // if req.body.sendInvite is true
    
    res.status(201).send({
      message: "User created successfully!",
      user,
      // Only return password if it was auto-generated
      ...(req.body.password ? {} : { temporaryPassword: req.body.password })
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
    
    // Validate company if being changed
    if (req.body.company_id && req.body.company_id !== user.company_id) {
      const company = await Company.findById(req.body.company_id);
      if (!company) {
        return res.status(400).send({ message: "Invalid company ID" });
      }
      if (company.status !== 'active') {
        return res.status(400).send({ message: "Cannot move user to inactive company" });
      }
    }
    
    // Prevent self-role change to a lower privilege
    if (req.userId == req.params.id && req.body.role && req.body.role !== user.role) {
      const roleHierarchy = { viewer: 1, editor: 2, admin: 3 };
      if (roleHierarchy[req.body.role] < roleHierarchy[user.role]) {
        return res.status(400).send({ message: "You cannot downgrade your own role" });
      }
    }
    
    // Update user
    await User.update(req.params.id, {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      department: req.body.department,
      company_id: req.body.company_id,
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
    
    // In a real implementation, you would send an email with the new password
    
    res.status(200).send({ 
      message: "Password reset successfully",
      // Only return generated passwords, not manually set ones
      password: req.body.password ? undefined : newPassword
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
    
    // Soft delete user (mark as deleted)
    await User.delete(req.params.id);
    
    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    logger.error(`Delete User Error: ${error.message}`);
    res.status(500).send({ message: "Error deleting user" });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const companyId = req.query.company;
    
    if (companyId) {
      // Get stats for specific company
      const stats = await User.getCompanyUserStats(companyId);
      res.status(200).send(stats);
    } else {
      // Get overall user stats
      const users = await User.getAll();
      const stats = {
        total_users: users.length,
        active_users: users.filter(u => u.status === 'active').length,
        pending_users: users.filter(u => u.status === 'pending').length,
        inactive_users: users.filter(u => u.status === 'inactive').length,
        admin_users: users.filter(u => u.role === 'admin').length,
        editor_users: users.filter(u => u.role === 'editor').length,
        viewer_users: users.filter(u => u.role === 'viewer').length
      };
      res.status(200).send(stats);
    }
  } catch (error) {
    logger.error(`Get User Stats Error: ${error.message}`);
    res.status(500).send({ message: "Error retrieving user statistics" });
  }
};