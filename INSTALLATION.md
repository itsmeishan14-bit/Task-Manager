# Task Manager - Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v20 or higher)
- PostgreSQL (v16 or higher)
- Git
- npm or yarn package manager

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd task-manager
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```bash
# Nano editor
nano .env

# Or VS Code
code .env
```

### 3. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE task_manager;
CREATE USER taskmanager WITH PASSWORD 'strong_password_here';
ALTER ROLE taskmanager SET client_encoding TO 'utf8mb4';
ALTER ROLE taskmanager SET default_transaction_isolation TO 'read committed';
ALTER ROLE taskmanager SET default_transaction_deferrable TO on;
ALTER ROLE taskmanager SET default_time_zone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE task_manager TO taskmanager;

# Exit PostgreSQL
\q
```

#### Import Database Schema

```bash
psql -U taskmanager -d task_manager < database/schema.sql
```

### 4. Backend Installation

Navigate to backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend should now be running on `http://localhost:5000`

### 5. Frontend Installation

In a new terminal, navigate to frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend should now be running on `http://localhost:5173`

## Verification

### Check Backend Health

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

### Test Authentication

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test@1234"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

## Docker Installation (Optional)

If you prefer to use Docker:

```bash
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

### Port Already in Use

If port 5000 or 5173 is already in use:

```bash
# Change in backend .env
PORT=5001

# Or kill the process using the port (Linux/macOS)
lsof -i :5000
kill -9 <PID>
```

### Database Connection Error

Verify PostgreSQL is running:

```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Check Services application or use pgAdmin
```

### Dependencies Installation Failed

Try clearing cache:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### CORS Errors

Make sure the `CLIENT_URL` in backend `.env` matches your frontend URL:

```bash
CLIENT_URL=http://localhost:5173
```

## Next Steps

1. **Create your first task** - Login and navigate to the Tasks page
2. **Set up categories** - Go to Settings to create task categories
3. **Configure notifications** - Set up email and browser notifications
4. **Explore features** - Try calendar, analytics, and other features

## Additional Configuration

### Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `https://yourdomain.com/api/auth/google/callback` (for production)
6. Copy Client ID and Secret to `.env`

### Email Service Setup (Optional)

For Gmail:
1. Enable 2-factor authentication
2. Generate App Password
3. Add to `.env`:
```
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## Development Commands

### Backend

```bash
npm run dev        # Start development server
npm start          # Start production server
npm test           # Run tests
npm run seed       # Seed sample data
```

### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run linter
```

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Support

For issues and questions:
- Check [README.md](README.md) for feature documentation
- Open an issue on GitHub
- Contact support@taskmanager.com

## License

This project is licensed under the MIT License.
