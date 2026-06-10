git remote -v# Deployment Guide

## Production Deployment Checklist

### Pre-Deployment
- [ ] Update environment variables
- [ ] Review security settings
- [ ] Run production build
- [ ] Test all features
- [ ] Backup database
- [ ] Review API endpoints
- [ ] Check CORS settings
- [ ] Enable SSL/TLS certificates

## Deployment Options

### 1. Docker Deployment

```bash
# Build and push images
docker build -t taskmanager-backend:latest ./backend
docker build -t taskmanager-frontend:latest ./frontend

docker tag taskmanager-backend:latest your-registry/taskmanager-backend:latest
docker tag taskmanager-frontend:latest your-registry/taskmanager-frontend:latest

docker push your-registry/taskmanager-backend:latest
docker push your-registry/taskmanager-frontend:latest

# Deploy
docker-compose -f docker-compose.yml up -d
```

### 2. Heroku Deployment

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create task-manager-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set GOOGLE_CLIENT_ID=your_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_client_secret

# Deploy
git push heroku main
```

### 3. AWS Deployment

```bash
# Using Elastic Beanstalk
eb init task-manager
eb create production
eb deploy

# Or using ECS
aws ecs create-cluster --cluster-name task-manager
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster task-manager --service-name api --task-definition task-manager:1
```

### 4. DigitalOcean Deployment

```bash
# Create Droplet (Ubuntu 22.04)
# SSH into droplet and run:

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository and deploy
git clone <repo-url>
cd task-manager
docker-compose up -d
```

### 5. Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

## Production Environment Variables

### Backend

```
NODE_ENV=production
PORT=5000
API_URL=https://api.yourdomain.com
CLIENT_URL=https://yourdomain.com

DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=task_manager
DB_USER=postgres
DB_PASSWORD=strong_password_here

JWT_SECRET=generate_strong_random_string_here
JWT_EXPIRY=7d

GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/auth/google/callback

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
SENDER_EMAIL=noreply@yourdomain.com

MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/uploads
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

BACKUP_INTERVAL=86400
DEFAULT_TIMEZONE=UTC
```

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

## Database Backup

```bash
# Automated daily backup
0 2 * * * pg_dump -U postgres -h localhost task_manager | gzip > /backups/task_manager_$(date +\%Y\%m\%d).sql.gz

# Restore from backup
gunzip < /backups/task_manager_20240101.sql.gz | psql -U postgres -h localhost task_manager
```

## Monitoring & Logging

### PM2 Process Manager

```bash
npm install -g pm2

pm2 start src/app.js --name "task-manager-api"
pm2 save
pm2 startup

# Monitor
pm2 monit
pm2 logs
```

### Log Management

```bash
# Using ELK Stack
docker run -d -p 9200:9200 docker.elastic.co/elasticsearch/elasticsearch:8.0.0
docker run -d -p 5601:5601 docker.elastic.co/kibana/kibana:8.0.0
```

## Performance Optimization

- Enable Redis caching
- Implement CDN for static assets
- Use database connection pooling
- Enable gzip compression
- Implement rate limiting
- Use load balancer (Nginx/HAProxy)
- Monitor application performance
- Optimize images and assets
- Implement caching headers

## Security Hardening

- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up DDoS protection
- [ ] Enable database encryption
- [ ] Implement Web Application Firewall (WAF)
- [ ] Regular security audits
- [ ] Update dependencies regularly
- [ ] Implement API key rotation
- [ ] Enable database backups
- [ ] Set up monitoring alerts

## Rollback Procedure

```bash
# If deployment fails
docker-compose down
docker pull your-registry/taskmanager-backend:previous
docker-compose up -d

# Or with Heroku
heroku releases
heroku rollback v123
```

## Post-Deployment

- Verify all endpoints working
- Test user authentication
- Check database connectivity
- Monitor error logs
- Test email notifications
- Verify file uploads
- Check API response times
- Validate UI/UX functionality
- Test on different devices/browsers
- Monitor server resources

## Support & Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check connection pool
netstat -an | grep 5432
```

**API not responding**
```bash
# Check service status
pm2 status

# View logs
docker logs taskmanager_backend

# Restart service
docker-compose restart backend
```

**High memory usage**
```bash
# Check Node process
node --max-old-space-size=4096 src/app.js

# Optimize database queries
# Add indexes on frequently queried columns
```

For more help, check the main README.md or open an issue on GitHub.
