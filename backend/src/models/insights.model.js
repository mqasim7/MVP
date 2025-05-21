const db = require('./db');

const Insights = {
  create: async (insight) => {
    const sql = `
      INSERT INTO insights 
      (title, description, date, platform, trend, image_url, actionable, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      insight.title,
      insight.description,
      insight.date,
      insight.platform,
      insight.trend,
      insight.image_url,
      insight.actionable || false,
      insight.category
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  },
  
  getAll: async () => {
    const sql = `
      SELECT * FROM insights
      ORDER BY date DESC
    `;
    return await db.query(sql);
  },
  
  findById: async (id) => {
    const sql = 'SELECT * FROM insights WHERE id = ?';
    const results = await db.query(sql, [id]);
    return results.length ? results[0] : null;
  },
  
  update: async (id, insightData) => {
    // Create dynamic update query based on provided fields
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(insightData)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    if (fields.length === 0) return { affectedRows: 0 };
    
    values.push(id); // Add ID for WHERE clause
    
    const sql = `UPDATE insights SET ${fields.join(', ')} WHERE id = ?`;
    return await db.query(sql, values);
  },
  
  delete: async (id) => {
    const sql = 'DELETE FROM insights WHERE id = ?';
    return await db.query(sql, [id]);
  },
  
  getByCategory: async (category) => {
    const sql = `
      SELECT * FROM insights
      WHERE category = ?
      ORDER BY date DESC
    `;
    return await db.query(sql, [category]);
  },
  
  getByPlatform: async (platform) => {
    const sql = `
      SELECT * FROM insights
      WHERE platform = ? OR platform = 'Cross-platform'
      ORDER BY date DESC
    `;
    return await db.query(sql, [platform]);
  },
  
  // Get actionable insights
  getActionable: async () => {
    const sql = `
      SELECT * FROM insights
      WHERE actionable = true
      ORDER BY date DESC
    `;
    return await db.query(sql);
  }
};

module.exports = Insights;