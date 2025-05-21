require('dotenv').config();
const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

// Database setup queries
const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${dbConfig.DB}`;

const useDatabase = `USE ${dbConfig.DB}`;

const createTablesQueries = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    department VARCHAR(100),
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Content table
  `CREATE TABLE IF NOT EXISTS content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('video', 'article', 'gallery', 'event') NOT NULL,
    status ENUM('published', 'draft', 'scheduled', 'review') DEFAULT 'draft',
    content_url VARCHAR(255),
    thumbnail_url VARCHAR(255),
    author_id INT,
    scheduled_date DATETIME,
    publish_date DATETIME,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  )`,

  // Personas table
  `CREATE TABLE IF NOT EXISTS personas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    age_range VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Platforms table
  `CREATE TABLE IF NOT EXISTS platforms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Interests table
  `CREATE TABLE IF NOT EXISTS interests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Junction tables
  `CREATE TABLE IF NOT EXISTS persona_platforms (
    persona_id INT,
    platform_id INT,
    PRIMARY KEY (persona_id, platform_id),
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS persona_interests (
    persona_id INT,
    interest_id INT,
    PRIMARY KEY (persona_id, interest_id),
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS content_personas (
    content_id INT,
    persona_id INT,
    PRIMARY KEY (content_id, persona_id),
    FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS content_platforms (
    content_id INT,
    platform_id INT,
    PRIMARY KEY (content_id, platform_id),
    FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
  )`,

  // Insights table
  `CREATE TABLE IF NOT EXISTS insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    platform VARCHAR(100),
    trend VARCHAR(100),
    image_url VARCHAR(255),
    actionable BOOLEAN DEFAULT FALSE,
    category ENUM('Content', 'Audience', 'Engagement', 'Conversion'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`
];

// Initial data to seed the database
const seedData = async (connection) => {
  try {
    // Check if admin user exists
    const [adminExists] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@lululemon.com']
    );
    
    if (adminExists.length === 0) {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await connection.query(
        'INSERT INTO users (name, email, password, role, status, department) VALUES (?, ?, ?, ?, ?, ?)',
        ['Admin User', 'admin@lululemon.com', hashedPassword, 'admin', 'active', 'IT']
      );
      
      logger.info('Admin user created');
    }
    
    // Seed initial platforms if they don't exist
    const platforms = ['Instagram', 'TikTok', 'YouTube', 'Website', 'LinkedIn', 'Facebook'];
    
    for (const platform of platforms) {
      const [platformExists] = await connection.query(
        'SELECT * FROM platforms WHERE name = ?',
        [platform]
      );
      
      if (platformExists.length === 0) {
        await connection.query(
          'INSERT INTO platforms (name) VALUES (?)',
          [platform]
        );
      }
    }
    
    // Seed initial interests if they don't exist
    const interests = ['Yoga', 'Running', 'Fitness', 'Mindfulness', 'Outdoor', 'Wellness', 'Sustainability'];
    
    for (const interest of interests) {
      const [interestExists] = await connection.query(
        'SELECT * FROM interests WHERE name = ?',
        [interest]
      );
      
      if (interestExists.length === 0) {
        await connection.query(
          'INSERT INTO interests (name) VALUES (?)',
          [interest]
        );
      }
    }
    
    // Seed initial personas if they don't exist
    const [personaExists] = await connection.query(
      'SELECT * FROM personas WHERE name = ?',
      ['Mindful Movers (Gen Z)']
    );
    
    if (personaExists.length === 0) {
      // Create persona
      const [result] = await connection.query(
        'INSERT INTO personas (name, description, age_range, active) VALUES (?, ?, ?, ?)',
        ['Mindful Movers (Gen Z)', 'Health-conscious Gen Z focused on mindfulness and movement', '18-24', true]
      );
      
      const personaId = result.insertId;
      
      // Add platforms
      const [instagramResult] = await connection.query('SELECT id FROM platforms WHERE name = ?', ['Instagram']);
      const [tiktokResult] = await connection.query('SELECT id FROM platforms WHERE name = ?', ['TikTok']);
      
      if (instagramResult.length > 0) {
        await connection.query(
          'INSERT INTO persona_platforms (persona_id, platform_id) VALUES (?, ?)',
          [personaId, instagramResult[0].id]
        );
      }
      
      if (tiktokResult.length > 0) {
        await connection.query(
          'INSERT INTO persona_platforms (persona_id, platform_id) VALUES (?, ?)',
          [personaId, tiktokResult[0].id]
        );
      }
      
      // Add interests
      const [yogaResult] = await connection.query('SELECT id FROM interests WHERE name = ?', ['Yoga']);
      const [mindfulnessResult] = await connection.query('SELECT id FROM interests WHERE name = ?', ['Mindfulness']);
      const [sustainabilityResult] = await connection.query('SELECT id FROM interests WHERE name = ?', ['Sustainability']);
      
      if (yogaResult.length > 0) {
        await connection.query(
          'INSERT INTO persona_interests (persona_id, interest_id) VALUES (?, ?)',
          [personaId, yogaResult[0].id]
        );
      }
      
      if (mindfulnessResult.length > 0) {
        await connection.query(
          'INSERT INTO persona_interests (persona_id, interest_id) VALUES (?, ?)',
          [personaId, mindfulnessResult[0].id]
        );
      }
      
      if (sustainabilityResult.length > 0) {
        await connection.query(
          'INSERT INTO persona_interests (persona_id, interest_id) VALUES (?, ?)',
          [personaId, sustainabilityResult[0].id]
        );
      }
      
      logger.info('Initial persona created');
    }
    
  } catch (error) {
    logger.error(`Error seeding database: ${error.message}`);
    throw error;
  }
};

// Main setup function
async function setup() {
  let connection;
  
  try {
    // Create connection without database
    connection = await mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD
    });
    
    logger.info('Connected to MySQL server');
    
    // Create database if it doesn't exist
    // Using query() instead of execute() for DDL statements
    await connection.query(createDatabaseQuery);
    logger.info(`Database ${dbConfig.DB} created or already exists`);
    
    // Use the database
    await connection.query(useDatabase);
    
    // Create tables
    for (const query of createTablesQueries) {
      await connection.query(query);
    }
    logger.info('Tables created or already exist');
    
    // Seed initial data
    await seedData(connection);
    logger.info('Database setup completed successfully');
    
  } catch (error) {
    logger.error(`Database setup error: ${error.message}`);
  } finally {
    if (connection) {
      await connection.end();
      logger.info('Database connection closed');
    }
    
    // Exit process
    process.exit(0);
  }
}

// Run the setup
setup();