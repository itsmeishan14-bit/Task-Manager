# API Testing Guide

## 🧪 Testing with cURL

### Setup Variables
```bash
BASE_URL="http://localhost:5000/api"
EMAIL="test@example.com"
PASSWORD="Test@12345"
```

## 🔐 Authentication Tests

### 1. Register New User
```bash
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "username": "testuser",
    "password": "'$PASSWORD'"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "email": "test@example.com",
    "username": "testuser"
  }
}
```

### 2. Login User
```bash
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

**Save the token:**
```bash
TOKEN="eyJhbGc..." # From response
```

### 3. Verify Token
```bash
curl -X GET $BASE_URL/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

## 📋 Task Tests

### 1. Create Task
```bash
curl -X POST $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Complete Project",
    "description": "Finish the task management app",
    "priority": "high",
    "due_date": "2024-12-31",
    "due_time": "18:00"
  }'
```

### 2. Get All Tasks
```bash
curl -X GET "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get Tasks with Filters
```bash
curl -X GET "$BASE_URL/tasks?status=pending&priority=high" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Search Tasks
```bash
curl -X GET "$BASE_URL/tasks?search=project" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Filter by Date
```bash
curl -X GET "$BASE_URL/tasks?due_date=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

## 🏷️ Category Tests

### 1. Get Categories
```bash
curl -X GET $BASE_URL/categories \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Create Category
```bash
curl -X POST $BASE_URL/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Work",
    "color": "#3B82F6",
    "icon": "briefcase"
  }'
```

## 📅 Calendar Tests

### 1. Get Calendar Events
```bash
curl -X GET "$BASE_URL/calendar/events?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Analytics Tests

### 1. Get Daily Stats
```bash
curl -X GET "$BASE_URL/analytics/stats?date=2024-01-15" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Get Weekly Stats
```bash
curl -X GET "$BASE_URL/analytics/weekly?startDate=2024-01-01&endDate=2024-01-07" \
  -H "Authorization: Bearer $TOKEN"
```

## 👤 User Tests

### 1. Get Profile
```bash
curl -X GET $BASE_URL/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Update Profile
```bash
curl -X PUT $BASE_URL/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "newusername",
    "timezone": "UTC",
    "theme_preference": "dark"
  }'
```

### 3. Change Password
```bash
curl -X POST $BASE_URL/users/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "oldPassword": "'$PASSWORD'",
    "newPassword": "NewPassword@123"
  }'
```

## 🔔 Notification Tests

### Get Notifications
```bash
curl -X GET "$BASE_URL/notifications?limit=20&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

## 💡 Error Testing

### Test Invalid Token
```bash
curl -X GET $BASE_URL/users/profile \
  -H "Authorization: Bearer invalid_token"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Test Missing Required Field
```bash
curl -X POST $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "description": "No title" }'
```

## 🧪 Using Postman

### Import Collection
1. Open Postman
2. Create new collection "TaskManager"
3. Add the following folders:
   - Authentication
   - Tasks
   - Categories
   - Calendar
   - Analytics
   - Users

### Set Environment Variables
```json
{
  "base_url": "http://localhost:5000/api",
  "token": "{{ response from login }}",
  "email": "test@example.com",
  "password": "Test@12345"
}
```

## 🚀 Testing with Node.js/JavaScript

### Test Script
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Test registration
async function testRegister() {
  try {
    const response = await api.post('/auth/register', {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test@12345'
    });
    console.log('Register success:', response.data);
  } catch (error) {
    console.error('Register error:', error.response.data);
  }
}

// Test login
async function testLogin() {
  try {
    const response = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'Test@12345'
    });
    const { token } = response.data.data;
    localStorage.setItem('token', token);
    console.log('Login success:', response.data);
  } catch (error) {
    console.error('Login error:', error.response.data);
  }
}

// Run tests
testRegister().then(() => testLogin());
```

## 📊 Load Testing

### Using Apache Bench
```bash
# Test health endpoint
ab -n 100 -c 10 http://localhost:5000/api/health

# Test API endpoint
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/tasks
```

## 🔍 Debugging

### Enable Verbose Output
```bash
curl -v -X GET http://localhost:5000/api/health
```

### Check Headers
```bash
curl -i -X GET http://localhost:5000/api/health
```

### Test with Pretty JSON
```bash
curl -s http://localhost:5000/api/health | jq
```

## ✅ Test Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Token authentication works
- [ ] Can create tasks
- [ ] Can retrieve tasks
- [ ] Can update tasks
- [ ] Can delete tasks
- [ ] Can create categories
- [ ] Can filter tasks
- [ ] Can search tasks
- [ ] Can get analytics
- [ ] Can update profile
- [ ] Password change works
- [ ] Errors are handled properly
- [ ] Rate limiting works

## 🎯 Expected Response Times

- Health check: < 50ms
- Login: < 100ms
- Get tasks: < 200ms
- Create task: < 150ms
- Search: < 300ms
- Analytics: < 500ms

## 🚨 Common Issues & Solutions

### 401 Unauthorized
- Token expired or invalid
- Solution: Login again to get new token

### 400 Bad Request
- Invalid data format
- Solution: Check request body format

### 404 Not Found
- Endpoint doesn't exist
- Solution: Check URL spelling

### 500 Internal Server Error
- Server error
- Solution: Check server logs

### Connection Refused
- Server not running
- Solution: Start backend with `npm run dev`

---

Happy testing! 🧪
