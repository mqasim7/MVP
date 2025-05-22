// backend/src/models/user.model.js (updated)
const db = require('./db');
const bcrypt = require('bcryptjs');

const User = {
  create: async (user) => {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    
    const sql = `
      INSERT INTO users (name, email, password, role, department, status, company_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      user.name,
      user.email,
      hashedPassword,
      user.role || 'viewer',
      user.department,
      user.status || 'pending',
      user.company_id || null
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  },
  
  findByEmail: async (email) => {
    const sql = `
      SELECT u.*, c.name as company_name 
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.email = ?
    `;
    const results = await db.query(sql, [email]);
    return results.length ? results[0] : null;
  },
  
  findById: async (id) => {
    const sql = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.department, u.company_id, 
             u.last_login, u.created_at, c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.id = ?
    `;
    const results = await db.query(sql, [id]);
    return results.length ? results[0] : null;
  },
  
  updateLastLogin: async (id) => {
    const sql = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    return await db.query(sql, [id]);
  },
  
  getAll: async () => {
    const sql = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.department, u.company_id,
             u.last_login, u.created_at, c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.status != 'deleted'
      ORDER BY u.created_at DESC
    `;
    return await db.query(sql);
  },
  
  getByCompany: async (companyId) => {
    const sql = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.department, u.company_id,
             u.last_login, u.created_at, c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.company_id = ? AND u.status != 'deleted'
      ORDER BY u.created_at DESC
    `;
    return await db.query(sql, [companyId]);
  },
  
  update: async (id, userData) => {
    // Create dynamic update query based on provided fields
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(userData)) {
      // Skip password updates here - should be handled separately
      if (key === 'password') continue;
      
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    if (fields.length === 0) return { affectedRows: 0 };
    
    values.push(id); // Add ID for WHERE clause
    
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const result = await db.query(sql, values);
    
    return result;
  },
  
  updatePassword: async (id, password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    return await db.query(sql, [hashedPassword, id]);
  },
  
  delete: async (id) => {
    // Soft delete - mark as deleted instead of hard delete
    const sql = 'UPDATE users SET status = ? WHERE id = ?';
    return await db.query(sql, ['deleted', id]);
  },
  
  // Compare password for login
  comparePassword: async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  },
  
  // Get users statistics by company
  getCompanyUserStats: async (companyId) => {
    const sql = `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_users,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
        SUM(CASE WHEN role = 'editor' THEN 1 ELSE 0 END) as editor_users,
        SUM(CASE WHEN role = 'viewer' THEN 1 ELSE 0 END) as viewer_users
      FROM users 
      WHERE company_id = ? AND status != 'deleted'
    `;
    const results = await db.query(sql, [companyId]);
    return results.length ? results[0] : null;
  }
};

module.exports = User;