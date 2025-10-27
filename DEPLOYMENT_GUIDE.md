# WebLauncher - Deployment Guide

## 🚀 Production Deployment Checklist

This guide covers deploying WebLauncher to production environments.

---

## 📋 Pre-Deployment Checklist

### Environment Configuration
- [ ] Copy `env.example` to `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Update `MONGODB_URI` (use MongoDB Atlas for production)
- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Generate strong `SESSION_SECRET` (32+ characters)
- [ ] Configure `FRONTEND_URL` with production domain
- [ ] Set up Google OAuth credentials
- [ ] Update `GOOGLE_CALLBACK_URL` to production URL
- [ ] Configure CORS origins
- [ ] Set up SSL/TLS certificates

### Security Checklist
- [ ] Change all default secrets
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting
- [ ] Configure backups for MongoDB
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Review and update Helmet config
- [ ] Test all authentication flows

### Infrastructure
- [ ] Choose hosting provider
- [ ] Set up MongoDB Atlas or instance
- [ ] Configure domain name
- [ ] Set up DNS records
- [ ] Configure reverse proxy (nginx)
- [ ] Set up CDN (optional)
- [ ] Configure backups
- [ ] Set up monitoring alerts

---

## 🐳 Deployment Options

### Option 1: Docker Compose (Recommended for VPS)

**Best for**: Single server deployments

```bash
# 1. Clone repository
git clone <your-repo-url>
cd WebLauncher

# 2. Configure environment
cp env.example .env
nano .env  # Edit with production values

# 3. Start services
docker-compose up -d

# 4. View logs
docker-compose logs -f app

# 5. Stop services
docker-compose down
```

**Advantages:**
- Single command deployment
- MongoDB included
- Easy updates
- Persistent data with volumes

---

### Option 2: Google Cloud Run

**Best for**: Serverless, auto-scaling deployments

#### Prerequisites
1. Google Cloud account
2. MongoDB Atlas account
3. Google Cloud SDK installed
4. Project created in GCP

#### Steps

**1. Set up MongoDB Atlas**
```bash
# Create cluster at https://www.mongodb.com/cloud/atlas
# Get connection string
# Add Cloud Run IP to whitelist
```

**2. Build and push image**
```bash
# Login to GCP
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/weblauncher
```

**3. Deploy to Cloud Run**
```bash
gcloud run deploy weblauncher \
  --image gcr.io/YOUR_PROJECT_ID/weblauncher \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --set-env-vars "NODE_ENV=production,MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/weblauncher,JWT_SECRET=your-strong-secret,SESSION_SECRET=your-strong-secret,GOOGLE_CLIENT_ID=...,GOOGLE_CLIENT_SECRET=...,GOOGLE_CALLBACK_URL=https://yourapp.a.run.app/auth/google/callback,FRONTEND_URL=https://yourapp.a.run.app"
```

**4. Update Google OAuth**
- Go to Google Cloud Console
- Update redirect URI: `https://your-service.a.run.app/auth/google/callback`

**5. Set up custom domain (optional)**
```bash
# Map custom domain
gcloud run domain-mappings create \
  --service weblauncher \
  --domain yourdomain.com \
  --region us-central1
```

**Advantages:**
- Auto-scaling
- Pay per use
- Global CDN
- Managed SSL
- Easy rollbacks

---

### Option 3: AWS Elastic Beanstalk

**Best for**: AWS ecosystem deployments

**1. Install EB CLI**
```bash
pip install awsebcli
```

**2. Initialize EB**
```bash
eb init
# Select region and platform (Node.js)
```

**3. Create environment**
```bash
eb create weblauncher-prod
```

**4. Set environment variables**
```bash
eb setenv \
  NODE_ENV=production \
  MONGODB_URI=your-mongo-uri \
  JWT_SECRET=your-secret \
  SESSION_SECRET=your-secret
```

**5. Deploy**
```bash
eb deploy
```

---

### Option 4: Traditional VPS (DigitalOcean, Linode, etc.)

**Best for**: Full control over infrastructure

#### Setup Steps

**1. Connect to server**
```bash
ssh root@your-server-ip
```

**2. Install dependencies**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

**3. Clone and setup app**
```bash
cd /var/www
git clone <your-repo-url> weblauncher
cd weblauncher

# Install dependencies
npm install --production

# Configure environment
cp env.example .env
nano .env  # Edit with production values
```

**4. Run with PM2**
```bash
pm2 start server.js --name weblauncher
pm2 save
pm2 startup
```

**5. Install and configure Nginx**
```bash
apt install -y nginx certbot python3-certbot-nginx

# Create nginx config
nano /etc/nginx/sites-available/weblauncher
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**6. Enable site and SSL**
```bash
ln -s /etc/nginx/sites-available/weblauncher /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
certbot --nginx -d yourdomain.com
```

---

## 🔒 Security Configuration

### 1. Environment Variables

Ensure all production values are strong and unique:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/weblauncher
JWT_SECRET=<generate-strong-random-32-chars>
SESSION_SECRET=<generate-strong-random-32-chars>
FRONTEND_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
```

### 2. Generate Strong Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. MongoDB Atlas Configuration

1. Create cluster
2. Create database user
3. Whitelist deployment IPs
4. Enable network encryption
5. Set up automatic backups

### 4. Google OAuth Setup

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - Production: `https://yourdomain.com/auth/google/callback`
   - Development: `http://localhost:3000/auth/google/callback`
4. Copy Client ID and Secret

---

## 📊 Monitoring and Logging

### PM2 Monitoring (VPS)

```bash
# View logs
pm2 logs weblauncher

# Monitor performance
pm2 monit

# View info
pm2 info weblauncher
```

### Application Logs

Logs are automatically written to console. For production, consider:
- CloudWatch (AWS)
- Stackdriver (Google Cloud)
- ELK Stack
- Sentry for error tracking

---

## 🔄 Updates and Maintenance

### Updating Application

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install --production

# Restart application
pm2 restart weblauncher

# Or for Docker
docker-compose down
docker-compose up -d
```

### Backup Strategy

**MongoDB Backup:**
```bash
# Manual backup
mongodump --uri="mongodb+srv://..."

# Restore
mongorestore --uri="mongodb+srv://..." dump/
```

**Application Backup:**
- Use Git repository
- Database backups (automated)
- Configuration backups

---

## 🧪 Testing Production

### Health Check
```bash
curl https://yourdomain.com/health
```

### API Testing
```bash
# Register user
curl -X POST https://yourdomain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","username":"test","password":"test123"}'

# Login
curl -X POST https://yourdomain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' \
  -c cookies.txt

# Add URL
curl -X POST https://yourdomain.com/api/urls \
  -H "Content-Type: application/json" \
  -d '{"description":"Test","url":"https://example.com"}' \
  -b cookies.txt

# Get URLs
curl https://yourdomain.com/api/urls -b cookies.txt
```

---

## 📈 Performance Optimization

### 1. Enable Gzip Compression
Already configured in server.js

### 2. CDN for Static Assets
Configure CDN for `/public` directory

### 3. Database Indexing
Indexes are already set in models

### 4. Caching
Consider adding Redis for session caching

### 5. Load Balancing
Use multiple instances behind load balancer

---

## 🆘 Troubleshooting

### Cannot connect to MongoDB
- Check connection string
- Verify IP whitelist (Atlas)
- Check firewall rules
- Ensure network accessibility

### Google OAuth not working
- Verify callback URL matches exactly
- Check Client ID and Secret
- Enable Google+ API
- Check redirect URIs in console

### High memory usage
- Check for memory leaks
- Adjust PM2 max memory
- Use Cloud Run auto-scaling

### SSL errors
- Renew certificates (certbot)
- Check certificate expiration
- Verify DNS configuration

---

## 📞 Support

For deployment issues:
1. Check logs: `pm2 logs` or `docker logs`
2. Review server.js for errors
3. Verify environment variables
4. Test MongoDB connection
5. Check firewall rules

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] SSL certificate valid
- [ ] Authentication working (email + Google)
- [ ] CRUD operations working
- [ ] Responsive design verified
- [ ] Performance acceptable
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Error tracking enabled
- [ ] Documentation updated
- [ ] Team notified

---

**🎉 Deployment Complete!**

Your WebLauncher application is now live in production!

