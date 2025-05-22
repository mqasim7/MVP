# MVP

## Prerequisites

- Node.js 16+ installed
- MySQL 8.0+ installed and running
- Git installed

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your database credentials
# Make sure to set:
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# - JWT_SECRET (use a long, random string)
# - FRONTEND_URL (http://localhost:3000 for development)
```

### 3. Database Setup

```bash
# Create database and tables with sample data
npm run setup-db

# If you have an existing database, run migration instead
npm run migrate
```

### 4. Start the Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The backend will be running on `http://localhost:5000`

### 5. Default Admin Account

After running the setup, you can login with:

- **Email**: `admin@lululemon.com`
- **Password**: `admin123`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit the .env.local file
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start the Frontend Server

```bash
# Development mode
npm run dev

# Build for production
npm run build
npm start
```

The frontend will be running on `http://localhost:3000`

## Database Schema

The application creates the following tables:

### Core Tables

- `companies` - Company information
- `users` - User accounts with company association
- `content` - Marketing content items
- `personas` - Target audience personas
- `insights` - Marketing insights and analytics

### Lookup Tables

- `platforms` - Social media platforms
- `interests` - User interests

### Junction Tables

- `persona_platforms` - Many-to-many: personas ↔ platforms
- `persona_interests` - Many-to-many: personas ↔ interests
- `content_personas` - Many-to-many: content ↔ personas
- `content_platforms` - Many-to-many: content ↔ platforms

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Company Management (Admin Only)

- `GET /api/companies` - List all companies
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company by ID
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company
- `GET /api/companies/:id/users` - Get company users
- `GET /api/companies/:id/stats` - Get company statistics

### User Management (Admin Only)

- `GET /api/users` - List all users (supports ?company=id filter)
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset-password` - Reset user password
- `GET /api/users/stats` - Get user statistics

### Content Management

- `GET /api/content` - List all content
- `POST /api/content` - Create content (Editor/Admin)
- `GET /api/content/:id` - Get content by ID
- `PUT /api/content/:id` - Update content (Editor/Admin)
- `DELETE /api/content/:id` - Delete content (Editor/Admin)
- `POST /api/content/:id/publish` - Publish content (Editor/Admin)

### Insights Management

- `GET /api/insights` - List insights (supports filtering)
- `POST /api/insights` - Create insight (Editor/Admin)
- `GET /api/insights/:id` - Get insight by ID
- `PUT /api/insights/:id` - Update insight (Editor/Admin)
- `DELETE /api/insights/:id` - Delete insight (Editor/Admin)

### Personas Management

- `GET /api/personas` - List all personas
- `POST /api/personas` - Create persona (Editor/Admin)
- `GET /api/personas/:id` - Get persona by ID
- `PUT /api/personas/:id` - Update persona (Editor/Admin)
- `DELETE /api/personas/:id` - Delete persona (Editor/Admin)

### Feed

- `GET /api/feed` - Get content feed
- `POST /api/feed/:id/engagement` - Record engagement

## User Roles

### Admin

- Full access to all features
- Can manage companies, users, content, personas, and insights
- Can access admin dashboard

### Editor

- Can create and manage content
- Can create and manage insights
- Can manage personas
- Cannot manage users or companies

### Viewer

- Read-only access to dashboard and feed
- Can view content and insights
- Cannot create or modify anything

## Company Structure

- **Multi-Company Support**: Admins can create multiple companies
- **User Assignment**: Users are assigned to companies
- **Role Restrictions**: Users in companies default to 'viewer' role
- **Data Isolation**: Companies can manage their own users

## Features

### Dashboard

- Content performance analytics
- User engagement metrics
- Company statistics (admin only)
- Recent activity feed

### Content Management

- Create and manage marketing content
- Associate content with personas and platforms
- Track engagement metrics
- Publishing workflow

### Insights Management

- Create marketing insights and analytics
- Rich content support (HTML)
- Categorization and tagging
- Actionable insights tracking

### User Management

- Company-based user organization
- Role-based access control
- User invitation system
- Password management

### Company Management

- Multi-company support
- Company branding (logo, info)
- User assignment and management
- Company statistics and analytics

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- CORS protection
- Input validation
- SQL injection prevention

## Development Tools

### Backend Scripts

```bash
npm run dev          # Start development server
npm run setup-db     # Initialize database
npm run migrate      # Run migrations
```

### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Check MySQL is running
   - Verify credentials in `.env` file
   - Ensure database exists

2. **CORS Errors**

   - Check `FRONTEND_URL` in backend `.env`
   - Verify `NEXT_PUBLIC_API_URL` in frontend

3. **Authentication Issues**

   - Check `JWT_SECRET` is set
   - Clear browser cookies/storage
   - Verify user exists and is active

4. **Permission Errors**
   - Check user role in database
   - Verify role middleware is working
   - Check company assignment

### Database Reset

To completely reset the database:

```bash
# Drop the database in MySQL
mysql -u root -p
DROP DATABASE lululemon_dashboard;

# Re-run setup
npm run setup-db
```

## Production Deployment

### Backend Deployment

1. Set environment variables for production
2. Use PM2 or similar process manager
3. Set up reverse proxy (Nginx)
4. Configure SSL/TLS
5. Set up database backups

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Set production environment variables
4. Configure custom domain

## Contributing

1. Create feature branch from `main`
2. Make changes with proper testing
3. Update documentation if needed
4. Create pull request
5. Ensure all tests pass

## License

This project is proprietary to Lululemon.
