// backend/src/models/insights.model.js (enhanced with company support)
const db = require('./db');

// Helper function to safely parse tags
const parseTagsSafely = (tagsData) => {
  if (!tagsData) return [];
  
  // If it's already an array, return it
  if (Array.isArray(tagsData)) {
    return tagsData;
  }
  
  // If it's not a string, convert to string first
  if (typeof tagsData !== 'string') {
    return [];
  }
  
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(tagsData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    // If JSON parsing fails, treat as comma-separated string
    return tagsData.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }
};

const Insights = {
  create: async (insight) => {
    const sql = `
      INSERT INTO insights 
      (title, description, content, date, platform, trend, image_url, actionable, category, author_id, company_id, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      insight.title,
      insight.description,
      insight.content || null,
      insight.date,
      insight.platform,
      insight.trend,
      insight.image_url,
      insight.actionable || false,
      insight.category,
      insight.author_id,
      insight.company_id || null,
      insight.tags ? JSON.stringify(insight.tags) : null
    ];
    
    const result = await db.query(sql, params);
    return result.insertId;
  },
  
  getAll: async (filters = {}) => {
    let sql = `
      SELECT i.*, u.name as author_name, c.name as company_name
      FROM insights i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN companies c ON i.company_id = c.id
    `;
    
    const whereConditions = [];
    const params = [];
    
    // Apply filters
    if (filters.category) {
      whereConditions.push('i.category = ?');
      params.push(filters.category);
    }
    
    if (filters.platform) {
      whereConditions.push('(i.platform = ? OR i.platform = "Cross-platform")');
      params.push(filters.platform);
    }
    
    if (filters.actionable !== undefined) {
      whereConditions.push('i.actionable = ?');
      params.push(filters.actionable);
    }
    
    if (filters.company_id) {
      whereConditions.push('i.company_id = ?');
      params.push(filters.company_id);
    }
    
    if (filters.search) {
      whereConditions.push('(i.title LIKE ? OR i.description LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (filters.dateFrom) {
      whereConditions.push('i.date >= ?');
      params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      whereConditions.push('i.date <= ?');
      params.push(filters.dateTo);
    }
    
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Apply sorting
    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder || 'DESC';
    sql += ` ORDER BY i.${sortBy} ${sortOrder}`;
    
    // Apply pagination
    if (filters.limit) {
      sql += ` LIMIT ${parseInt(filters.limit)}`;
      if (filters.offset) {
        sql += ` OFFSET ${parseInt(filters.offset)}`;
      }
    }
    
    const results = await db.query(sql, params);
    
    // Parse tags JSON for each result with error handling
    return results.map(insight => ({
      ...insight,
      tags: parseTagsSafely(insight.tags)
    }));
  },
  
  findById: async (id) => {
    const sql = `
      SELECT i.*, u.name as author_name, u.email as author_email, c.name as company_name
      FROM insights i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN companies c ON i.company_id = c.id
      WHERE i.id = ?
    `;
    const results = await db.query(sql, [id]);
    
    if (results.length === 0) return null;
    
    const insight = results[0];
    
    // Parse tags JSON with error handling
    insight.tags = parseTagsSafely(insight.tags);
    
    // Get related insights (same category, exclude current)
    const relatedSql = `
      SELECT id, title, description, date, platform, image_url
      FROM insights
      WHERE category = ? AND id != ?
      ORDER BY date DESC
      LIMIT 3
    `;
    insight.relatedInsights = await db.query(relatedSql, [insight.category, id]);
    
    return insight;
  },
  
  update: async (id, insightData) => {
    // Create dynamic update query based on provided fields
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(insightData)) {
      if (key === 'tags') {
        // Handle tags as JSON
        fields.push(`${key} = ?`);
        values.push(value ? JSON.stringify(value) : null);
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
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
      SELECT i.*, u.name as author_name, c.name as company_name
      FROM insights i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN companies c ON i.company_id = c.id
      WHERE i.category = ?
      ORDER BY i.date DESC
    `;
    const results = await db.query(sql, [category]);
    
    return results.map(insight => ({
      ...insight,
      tags: parseTagsSafely(insight.tags)
    }));
  },
  
  getByPlatform: async (platform) => {
    const sql = `
      SELECT i.*, u.name as author_name, c.name as company_name
      FROM insights i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN companies c ON i.company_id = c.id
      WHERE i.platform = ? OR i.platform = 'Cross-platform'
      ORDER BY i.date DESC
    `;
    const results = await db.query(sql, [platform]);
    
    return results.map(insight => ({
      ...insight,
      tags: insight.tags ? JSON.parse(insight.tags) : []
    }));
  },
  
  // Get insights by company
  getByCompany: async (companyId) => {
    return await Insights.getAll({ company_id: companyId });
  },
  
  // Get actionable insights
  getActionable: async () => {
    const sql = `
      SELECT i.*, u.name as author_name, c.name as company_name
      FROM insights i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN companies c ON i.company_id = c.id
      WHERE i.actionable = true
      ORDER BY i.date DESC
    `;
    const results = await db.query(sql);
    
    return results.map(insight => ({
      ...insight,
      tags: insight.tags ? JSON.parse(insight.tags) : []
    }));
  },
  
  // Get insights by author
  getByAuthor: async (authorId) => {
    const sql = `
      SELECT i.*, u.name as author_name, c.name as company_name
      FROM insights i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN companies c ON i.company_id = c.id
      WHERE i.author_id = ?
      ORDER BY i.date DESC
    `;
    const results = await db.query(sql, [authorId]);
    
    return results.map(insight => ({
      ...insight,
      tags: insight.tags ? JSON.parse(insight.tags) : []
    }));
  },
  
  // Get insights statistics
  getStats: async (companyId = null) => {
    let sql = `
      SELECT 
        COUNT(*) as total_insights,
        SUM(CASE WHEN actionable = true THEN 1 ELSE 0 END) as actionable_insights,
        COUNT(DISTINCT category) as categories_count,
        COUNT(DISTINCT platform) as platforms_count,
        DATE(MAX(date)) as latest_insight_date
      FROM insights
    `;
    
    const params = [];
    if (companyId) {
      sql += ' WHERE company_id = ?';
      params.push(companyId);
    }
    
    const results = await db.query(sql, params);
    return results.length ? results[0] : null;
  },
  
  // Search insights
  search: async (searchTerm, filters = {}) => {
    let sql = `
      SELECT i.*, u.name as author_name, c.name as company_name
      FROM insights i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN companies c ON i.company_id = c.id
      WHERE (i.title LIKE ? OR i.description LIKE ? OR i.content LIKE ?)
    `;
    
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
    
    // Apply additional filters
    if (filters.category) {
      sql += ' AND i.category = ?';
      params.push(filters.category);
    }
    
    if (filters.platform) {
      sql += ' AND (i.platform = ? OR i.platform = "Cross-platform")';
      params.push(filters.platform);
    }
    
    if (filters.company_id) {
      sql += ' AND i.company_id = ?';
      params.push(filters.company_id);
    }
    
    sql += ' ORDER BY i.date DESC';
    
    if (filters.limit) {
      sql += ` LIMIT ${parseInt(filters.limit)}`;
    }
    
    const results = await db.query(sql, params);
    
    return results.map(insight => ({
      ...insight,
      tags: insight.tags ? JSON.parse(insight.tags) : []
    }));
  }
};

module.exports = Insights;