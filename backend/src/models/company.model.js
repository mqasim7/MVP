// backend/src/models/company.model.js
const db = require('./db');

const Company = {
  create: async (company) => {
    const sql = `
      INSERT INTO companies (name, description, industry, website, logo_url, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      company.name,
      company.description || null,
      company.industry || null,
      company.website || null,
      company.logo_url || null,
      company.status || 'active'
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  },
  
  getAll: async () => {
    const sql = `
      SELECT 
        c.*,
        COUNT(u.id) as user_count
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id AND u.status != 'deleted'
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    return await db.query(sql);
  },
  
  findById: async (id) => {
    const sql = 'SELECT * FROM companies WHERE id = ?';
    const results = await db.query(sql, [id]);
    return results.length ? results[0] : null;
  },
  
  update: async (id, companyData) => {
    // Create dynamic update query based on provided fields
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(companyData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    if (fields.length === 0) return { affectedRows: 0 };
    
    values.push(id); // Add ID for WHERE clause
    
    const sql = `UPDATE companies SET ${fields.join(', ')} WHERE id = ?`;
    return await db.query(sql, values);
  },
  
  delete: async (id) => {
    // Soft delete - mark as inactive instead of hard delete
    const sql = 'UPDATE companies SET status = ? WHERE id = ?';
    return await db.query(sql, ['inactive', id]);
  },
  
  // Get users for a specific company
  getUsers: async (companyId) => {
    const sql = `
      SELECT id, name, email, role, status, department, last_login, created_at 
      FROM users 
      WHERE company_id = ? AND status != 'deleted'
      ORDER BY created_at DESC
    `;
    return await db.query(sql, [companyId]);
  },
  
  // Get company statistics
  getStats: async (companyId) => {
    const userCountSql = `
      SELECT COUNT(*) as total_users,
             SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
             SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_users
      FROM users 
      WHERE company_id = ? AND status != 'deleted'
    `;
    
    const contentCountSql = `
      SELECT COUNT(*) as total_content
      FROM content c
      JOIN users u ON c.author_id = u.id
      WHERE u.company_id = ?
    `;
    
    const [userStats] = await db.query(userCountSql, [companyId]);
    const [contentStats] = await db.query(contentCountSql, [companyId]);
    
    return {
      ...userStats,
      ...contentStats
    };
  }
};

module.exports = Company;