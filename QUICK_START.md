# Quick Reference & Getting Started

## 📦 Installation (5 Minutes)

### 1. Navigate to Project
```bash
cd c:\Xampp2\htdocs\task-manager
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env

# Edit .env with your database credentials
# Then install and run:
npm install
npm run dev
```

### 3. Database (PostgreSQL)
```bash
# Create database
createdb task_manager

# Import schema
psql -U postgres task_manager < database/schema.sql
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Open Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔑 Test Credentials

After setup, create a test account:
1. Go to http://localhost:5173
2. Click "Sign up"
3. Register with email: test@example.com
4. Password must have: uppercase, lowercase, number, special char

Example: `Test@12345`

## 📂 Key Files

### Backend
- `src/app.js` - Main Express app
- `src/config/database.js` - Database connection
- `src/routes/` - API endpoints
- `src/services/` - Business logic
- `.env.example` - Environment template
- `package.json` - Dependencies

### Frontend
- `src/App.jsx` - Main React component
- `src/pages/` - Page components
- `src/components/` - Reusable components
- `src/services/api.js` - API client
- `src/utils/store.js` - State management
- `tailwind.config.js` - Styling config

### Database
- `database/schema.sql` - Table definitions
- 15 tables with relationships
- Indexes for performance
- Triggers for timestamps

## 🔧 Configuration

### Required Variables (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_NAME=task_manager
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### Optional Variables
```
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email
SMTP_PASSWORD=your_app_password
```

## 📊 Database Tables

```
Users → Categories → Tasks → Subtasks
                   ↘ Tags (via task_tags)
                   ↘ Notes
                   ↘ Attachments
                   ↘ History
Calendar Events ← Tasks
Notifications ← Tasks
Productivity Stats ← Daily calculations
Habits, Quick Notes, Pomodoro Sessions
```

## 🚀 Common Commands

### Backend
```bash
npm run dev          # Start with auto-reload
npm start            # Production start
npm test             # Run tests
npm run seed         # Seed sample data
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Check code
```

### Database
```bash
psql -U postgres     # Connect to PostgreSQL
\dt                  # List tables
\q                   # Quit
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or kill process
lsof -i :5000
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready -h localhost

# Or restart service
sudo systemctl restart postgresql
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### CORS Error
```bash
# Check CLIENT_URL in backend .env
CLIENT_URL=http://localhost:5173
```

## 🔐 Security Notes

1. **Never commit .env file** - Use .env.example
2. **Generate strong JWT_SECRET** - At least 32 characters
3. **Use HTTPS in production** - Configure SSL certificates
4. **Secure database password** - Use strong, unique password
5. **Enable rate limiting** - Already configured
6. **Update dependencies** - Run `npm audit fix`

## 📱 Features by Page

### Dashboard
- Daily greeting
- Progress percentage
- Task statistics
- Quick add button
- Recent activity

### Tasks
- List all tasks
- Filter by status
- Search functionality
- Create/Edit/Delete
- Mark complete
- Add to calendar

### Calendar
- Month view
- Day selection
- Event display
- Task scheduling
- Due date overview

### Analytics
- Daily charts
- Weekly reports
- Monthly statistics
- Productivity score
- Streak counter

### Settings
- Profile management
- Theme selection
- Notification preferences
- Password change
- Logout

## 🎨 Styling Guide

### Tailwind Classes Used
```
Colors:  bg-blue-600, text-gray-700
Spacing: p-6, m-4, gap-4
Sizing:  w-full, h-screen
Layout:  flex, grid, relative
Effects: shadow, rounded, transition
```

### Custom Classes
```
.glass-morphism    - Glassmorphism effect
.card-shadow       - Card shadow effect
.gradient-primary  - Blue gradient
.gradient-text     - Gradient text
```

## 📚 API Response Format

All responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error response:
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🔗 Important Links

- Frontend URL: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
- Health Check: `http://localhost:5000/api/health`

## 📞 Support Resources

1. **INSTALLATION.md** - Detailed setup guide
2. **README.md** - Complete documentation
3. **DEPLOYMENT.md** - Production deployment
4. **PROJECT_SUMMARY.md** - Project overview

## ✨ Next Features to Add

1. Real-time notifications
2. File upload handling
3. Email notifications
4. Advanced filtering
5. Bulk operations
6. Data export
7. Team collaboration
8. Mobile app

---

You're all set! Start with the installation steps and enjoy building your productivity app! 🚀
