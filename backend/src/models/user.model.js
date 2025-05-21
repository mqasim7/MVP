const db = require('./db');
const bcrypt = require('bcryptjs');

const User = {
  create: async (user) => {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    
    const sql = `
      INSERT INTO users (name, email, password, role, department, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      user.name,
      user.email,
      hashedPassword,
      user.role || 'viewer',
      user.department,
      user.status || 'pending'
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  },
  
  findByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await db.query(sql, [email]);
    return results.length ? results[0] : null;
  },
  
  findById: async (id) => {
    const sql = 'SELECT id, name, email, role, status, department, last_login, created_at FROM users WHERE id = ?';
    const results = await db.query(sql, [id]);
    return results.length ? results[0] : null;
  },
  
  updateLastLogin: async (id) => {
    const sql = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    return await db.query(sql, [id]);
  },
  
  getAll: async () => {
    const sql = `
      SELECT id, name, email, role, status, department, last_login, created_at 
      FROM users
      ORDER BY created_at DESC
    `;
    return await db.query(sql);
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
    const sql = 'DELETE FROM users WHERE id = ?';
    return await db.query(sql, [id]);
  },
  
  // Compare password for login
  comparePassword: async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
};

module.exports = User;