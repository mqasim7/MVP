const db = require('./db');

const Content = {
  create: async (content) => {
    const sql = `
      INSERT INTO content 
      (title, description, type, status, content_url, thumbnail_url, author_id, company_id, scheduled_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      content.title,
      content.description,
      content.type,
      content.status || 'draft',
      content.content_url,
      content.thumbnail_url,
      content.author_id || null,
      content.company_id,
      content.scheduled_date
    ];
    
    const result = await db.query(sql, params);
    const contentId = result.insertId;
    
    // If personas are provided, add them to the junction table
    if (content.personas && content.personas.length > 0) {
      const insertPersonas = content.personas.map(personaId => 
        db.query(
          'INSERT INTO content_personas (content_id, persona_id) VALUES (?, ?)',
          [contentId, personaId]
        )
      );
      await Promise.all(insertPersonas);
    }
    
    // If platforms are provided, add them to the junction table
    if (content.platforms && content.platforms.length > 0) {
      const insertPlatforms = content.platforms.map(platformId => 
        db.query(
          'INSERT INTO content_platforms (content_id, platform_id) VALUES (?, ?)',
          [contentId, platformId]
        )
      );
      await Promise.all(insertPlatforms);
    }
    
    return contentId;
  },
  
  getAll: async () => {
    const sql = `
      SELECT 
        c.*,
        u.name as author_name
      FROM content c
      LEFT JOIN users u ON c.author_id = u.id
      ORDER BY 
        CASE 
          WHEN c.status = 'published' THEN 1
          WHEN c.status = 'scheduled' THEN 2
          WHEN c.status = 'review' THEN 3
          WHEN c.status = 'draft' THEN 4
        END,
        c.created_at DESC
    `;
    
    const content = await db.query(sql);
    
    // For each content item, get its platforms and personas
    const contentWithRelations = await Promise.all(content.map(async (item) => {
      // Get platforms
      const platformsSql = `
        SELECT p.id, p.name
        FROM platforms p
        JOIN content_platforms cp ON p.id = cp.platform_id
        WHERE cp.content_id = ?
      `;
      const platforms = await db.query(platformsSql, [item.id]);
      
      // Get personas
      const personasSql = `
        SELECT p.id, p.name
        FROM personas p
        JOIN content_personas cp ON p.id = cp.persona_id
        WHERE cp.content_id = ?
      `;
      const personas = await db.query(personasSql, [item.id]);
      
      return {
        ...item,
        platforms,
        personas
      };
    }));
    
    return contentWithRelations;
  },
  
  findById: async (id) => {
    const sql = `
      SELECT 
        c.*,
        u.name as author_name
      FROM content c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `;
    
    const results = await db.query(sql, [id]);
    
    if (!results.length) return null;
    
    const content = results[0];
    
    // Get platforms
    const platformsSql = `
      SELECT p.id, p.name
      FROM platforms p
      JOIN content_platforms cp ON p.id = cp.platform_id
      WHERE cp.content_id = ?
    `;
    content.platforms = await db.query(platformsSql, [id]);
    
    // Get personas
    const personasSql = `
      SELECT p.id, p.name
      FROM personas p
      JOIN content_personas cp ON p.id = cp.persona_id
      WHERE cp.content_id = ?
    `;
    content.personas = await db.query(personasSql, [id]);
    
    return content;
  },
  
  update: async (id, contentData) => {
    // Create dynamic update query based on provided fields
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(contentData)) {
      // Skip relationships (handled separately)
      if (['personas', 'platforms'].includes(key)) continue;
      
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    if (fields.length === 0) return { affectedRows: 0 };
    
    values.push(id); // Add ID for WHERE clause
    
    const sql = `UPDATE content SET ${fields.join(', ')} WHERE id = ?`;
    const result = await db.query(sql, values);
    
    // Handle personas updates if provided
    if (contentData.personas) {
      // Remove existing relationships
      await db.query('DELETE FROM content_personas WHERE content_id = ?', [id]);
      
      // Add new relationships
      if (contentData.personas.length > 0) {
        const insertPersonas = contentData.personas.map(personaId => 
          db.query(
            'INSERT INTO content_personas (content_id, persona_id) VALUES (?, ?)',
            [id, personaId]
          )
        );
        await Promise.all(insertPersonas);
      }
    }
    
    // Handle platforms updates if provided
    if (contentData.platforms) {
      // Remove existing relationships
      await db.query('DELETE FROM content_platforms WHERE content_id = ?', [id]);
      
      // Add new relationships
      if (contentData.platforms.length > 0) {
        const insertPlatforms = contentData.platforms.map(platformId => 
          db.query(
            'INSERT INTO content_platforms (content_id, platform_id) VALUES (?, ?)',
            [id, platformId]
          )
        );
        await Promise.all(insertPlatforms);
      }
    }
    
    return result;
  },
  
  delete: async (id) => {
    // First delete relationships to avoid foreign key constraints
    await db.query('DELETE FROM content_personas WHERE content_id = ?', [id]);
    await db.query('DELETE FROM content_platforms WHERE content_id = ?', [id]);
    
    // Then delete the content item
    const sql = 'DELETE FROM content WHERE id = ?';
    return await db.query(sql, [id]);
  },
  
  getByPersona: async (personaId) => {
    const sql = `
      SELECT 
        c.*,
        u.name as author_name
      FROM content c
      LEFT JOIN users u ON c.author_id = u.id
      JOIN content_personas cp ON c.id = cp.content_id
      WHERE cp.persona_id = ? AND c.status = 'published'
      ORDER BY c.publish_date DESC
    `;
    
    const content = await db.query(sql, [personaId]);
    
    // For each content item, get its platforms
    const contentWithPlatforms = await Promise.all(content.map(async (item) => {
      // Get platforms
      const platformsSql = `
        SELECT p.id, p.name
        FROM platforms p
        JOIN content_platforms cp ON p.id = cp.platform_id
        WHERE cp.content_id = ?
      `;
      const platforms = await db.query(platformsSql, [item.id]);
      
      return {
        ...item,
        platforms
      };
    }));
    
    return contentWithPlatforms;
  },
  
  updateMetrics: async (id, metrics) => {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(metrics)) {
      if (['views', 'likes', 'comments', 'shares'].includes(key)) {
        fields.push(`${key} = ${key} + ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return { affectedRows: 0 };
    
    values.push(id); // Add ID for WHERE clause
    
    const sql = `UPDATE content SET ${fields.join(', ')} WHERE id = ?`;
    return await db.query(sql, values);
  },
  
  publish: async (id) => {
    const sql = `
      UPDATE content 
      SET status = 'published', publish_date = NOW()
      WHERE id = ?
    `;
    return await db.query(sql, [id]);
  },
   
    getByPersonaAndCompany: async (personaId, companyId) => {
      const sql = `
        SELECT 
          c.*,
          u.name AS author_name
        FROM content c
        LEFT JOIN users u ON c.author_id = u.id
        JOIN content_personas cp ON c.id = cp.content_id
        WHERE cp.persona_id = ? 
          AND c.company_id = ?
        ORDER BY c.publish_date DESC
      `;
      const rows = await db.query(sql, [personaId, companyId]);
  
      // load platforms & personas for each item
      return await Promise.all(rows.map(async (item) => {
        const [platforms, personas] = await Promise.all([
          db.query(
            `SELECT p.name FROM platforms p
             JOIN content_platforms cp ON p.id=cp.platform_id
             WHERE cp.content_id=?`,
            [item.id]
          ),
          db.query(
            `SELECT p.id,p.name FROM personas p
             JOIN content_personas cp ON p.id=cp.persona_id
             WHERE cp.content_id=?`,
            [item.id]
          )
        ]);
        const platformNames = platforms.map(r => r.name);
        return { ...item, platformNames, personas };
      }));
    },
    
    /**
 * Insert multiple content records in a loop.
 * Returns an array of newly created content IDs.
 */
    bulkCreate: async (contents) => {
      const createdIds = [];
    
      for (const content of contents) {
        // Safely parse publish_date and scheduled_date to MySQL DATETIME format (YYYY-MM-DD)
        const publishDate = content.publish_date 
          ? new Date(content.publish_date).toISOString().slice(0, 19).replace('T', ' ')
          : null;
    
        const scheduledDate = content.scheduled_date 
          ? new Date(content.scheduled_date).toISOString().slice(0, 19).replace('T', ' ')
          : null;
    
        const sql = `
          INSERT INTO content 
            (title, description, type, content_url, thumbnail_url, author_id, company_id, scheduled_date, publish_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    
        const params = [
          content.title,
          content.description || null,
          content.type,
          content.content_url || null,
          content.thumbnail_url || null,
          content.author_id || null,
          content.company_id || null,
          scheduledDate,
          publishDate
        ];
    
        const result = await db.query(sql, params);
        const contentId = result.insertId;
        createdIds.push(contentId);
    
        // Insert personas if any
        if (Array.isArray(content.personas) && content.personas.length) {
          await Promise.all(
            content.personas.map(pid =>
              db.query(
                'INSERT INTO content_personas (content_id, persona_id) VALUES (?, ?)',
                [contentId, pid]
              )
            )
          );
        }
    
        // Insert platforms if any
        if (Array.isArray(content.platforms) && content.platforms.length) {
          await Promise.all(
            content.platforms.map(plid =>
              db.query(
                'INSERT INTO content_platforms (content_id, platform_id) VALUES (?, ?)',
                [contentId, plid]
              )
            )
          );
        }
      }
    
      return createdIds;
    }
    


};

module.exports = Content;