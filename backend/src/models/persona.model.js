// backend/src/models/persona.model.js 
const db = require('./db');

const Persona = {
  create: async (persona) => {
    const sql = `
      INSERT INTO personas (name, description, age_range, company_id, active)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      persona.name,
      persona.description,
      persona.age_range,
      persona.company_id || null,
      persona.active !== undefined ? persona.active : true
    ];
    
    const result = await db.query(sql, params);
    const personaId = result.insertId;
    
    // Handle platforms if provided
    if (persona.platforms && persona.platforms.length > 0) {
      for (const platformName of persona.platforms) {
        // Find or create platform
        let platformId;
        const existingPlatform = await db.query('SELECT id FROM platforms WHERE name = ?', [platformName]);
        
        if (existingPlatform.length > 0) {
          platformId = existingPlatform[0].id;
        } else {
          const newPlatform = await db.query('INSERT INTO platforms (name) VALUES (?)', [platformName]);
          platformId = newPlatform.insertId;
        }
        
        // Create relationship
        await db.query(
          'INSERT INTO persona_platforms (persona_id, platform_id) VALUES (?, ?)',
          [personaId, platformId]
        );
      }
    }
    
    // Handle interests if provided
    if (persona.interests && persona.interests.length > 0) {
      for (const interestName of persona.interests) {
        // Find or create interest
        let interestId;
        const existingInterest = await db.query('SELECT id FROM interests WHERE name = ?', [interestName]);
        
        if (existingInterest.length > 0) {
          interestId = existingInterest[0].id;
        } else {
          const newInterest = await db.query('INSERT INTO interests (name) VALUES (?)', [interestName]);
          interestId = newInterest.insertId;
        }
        
        // Create relationship
        await db.query(
          'INSERT INTO persona_interests (persona_id, interest_id) VALUES (?, ?)',
          [personaId, interestId]
        );
      }
    }
    
    return personaId;
  },
  
  getAll: async (filters = {}) => {
    let sql = `
      SELECT p.*, c.name as company_name
      FROM personas p
      LEFT JOIN companies c ON p.company_id = c.id
    `;
    
    const whereConditions = [];
    const params = [];
    
    // Apply filters
    if (filters.company_id) {
      whereConditions.push('p.company_id = ?');
      params.push(filters.company_id);
    }
    
    if (filters.active !== undefined) {
      whereConditions.push('p.active = ?');
      params.push(filters.active);
    }
    
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    sql += ` ORDER BY p.name ASC`;
    
    const personas = await db.query(sql, params);
    
    // For each persona, get its platforms and interests
    const personasWithRelations = await Promise.all(personas.map(async (persona) => {
      // Get platforms
      const platformsSql = `
        SELECT p.id, p.name
        FROM platforms p
        JOIN persona_platforms pp ON p.id = pp.platform_id
        WHERE pp.persona_id = ?
      `;
      const platforms = await db.query(platformsSql, [persona.id]);
      
      // Get interests
      const interestsSql = `
        SELECT i.id, i.name
        FROM interests i
        JOIN persona_interests pi ON i.id = pi.interest_id
        WHERE pi.persona_id = ?
      `;
      const interests = await db.query(interestsSql, [persona.id]);
      
      // Get content count
      const contentCountSql = `
        SELECT COUNT(*) as count
        FROM content_personas
        WHERE persona_id = ?
      `;
      const contentCountResult = await db.query(contentCountSql, [persona.id]);
      const contentCount = contentCountResult[0].count;
      
      return {
        ...persona,
        platforms,
        interests,
        contentCount
      };
    }));
    
    return personasWithRelations;
  },
  
  findById: async (id) => {
    const sql = `
      SELECT p.*, c.name as company_name
      FROM personas p
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE p.id = ?
    `;
    const results = await db.query(sql, [id]);
    
    if (!results.length) return null;
    
    const persona = results[0];
    
    // Get platforms
    const platformsSql = `
      SELECT p.id, p.name
      FROM platforms p
      JOIN persona_platforms pp ON p.id = pp.platform_id
      WHERE pp.persona_id = ?
    `;
    persona.platforms = await db.query(platformsSql, [id]);
    
    // Get interests
    const interestsSql = `
      SELECT i.id, i.name
      FROM interests i
      JOIN persona_interests pi ON i.id = pi.interest_id
      WHERE pi.persona_id = ?
    `;
    persona.interests = await db.query(interestsSql, [id]);
    
    // Get engagement rate (mock calculation for now)
    persona.engagementRate = '4.7%';
    
    return persona;
  },
  
  update: async (id, personaData) => {
    // Create dynamic update query based on provided fields
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(personaData)) {
      // Skip relationships (handled separately)
      if (['platforms', 'interests'].includes(key)) continue;
      
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    if (fields.length === 0) return { affectedRows: 0 };
    
    values.push(id); // Add ID for WHERE clause
    
    const sql = `UPDATE personas SET ${fields.join(', ')} WHERE id = ?`;
    const result = await db.query(sql, values);
    
    // Handle platforms updates if provided
    if (personaData.platforms) {
      // Remove existing relationships
      await db.query('DELETE FROM persona_platforms WHERE persona_id = ?', [id]);
      
      // Add new relationships
      if (personaData.platforms.length > 0) {
        for (const platformName of personaData.platforms) {
          // Find or create platform
          let platformId;
          const existingPlatform = await db.query('SELECT id FROM platforms WHERE name = ?', [platformName]);
          
          if (existingPlatform.length > 0) {
            platformId = existingPlatform[0].id;
          } else {
            const newPlatform = await db.query('INSERT INTO platforms (name) VALUES (?)', [platformName]);
            platformId = newPlatform.insertId;
          }
          
          // Create relationship
          await db.query(
            'INSERT INTO persona_platforms (persona_id, platform_id) VALUES (?, ?)',
            [id, platformId]
          );
        }
      }
    }
    
    // Handle interests updates if provided
    if (personaData.interests) {
      // Remove existing relationships
      await db.query('DELETE FROM persona_interests WHERE persona_id = ?', [id]);
      
      // Add new relationships
      if (personaData.interests.length > 0) {
        for (const interestName of personaData.interests) {
          // Find or create interest
          let interestId;
          const existingInterest = await db.query('SELECT id FROM interests WHERE name = ?', [interestName]);
          
          if (existingInterest.length > 0) {
            interestId = existingInterest[0].id;
          } else {
            const newInterest = await db.query('INSERT INTO interests (name) VALUES (?)', [interestName]);
            interestId = newInterest.insertId;
          }
          
          // Create relationship
          await db.query(
            'INSERT INTO persona_interests (persona_id, interest_id) VALUES (?, ?)',
            [id, interestId]
          );
        }
      }
    }
    
    return result;
  },
  
  delete: async (id) => {
    // First delete relationships to avoid foreign key constraints
    await db.query('DELETE FROM persona_platforms WHERE persona_id = ?', [id]);
    await db.query('DELETE FROM persona_interests WHERE persona_id = ?', [id]);
    await db.query('DELETE FROM content_personas WHERE persona_id = ?', [id]);
    
    // Then delete the persona
    const sql = 'DELETE FROM personas WHERE id = ?';
    return await db.query(sql, [id]);
  },
  
  // Get personas by company
  getByCompany: async (companyId) => {
    return await Persona.getAll({ company_id: companyId });
  },
  
  getPlatforms: async () => {
    return await db.query('SELECT * FROM platforms ORDER BY name ASC');
  },
  
  getInterests: async () => {
    return await db.query('SELECT * FROM interests ORDER BY name ASC');
  }
};

module.exports = Persona;

