# WebLauncher - Docker Guide

Complete guide for running WebLauncher with Docker.

## 📋 Prerequisites

- Docker installed and running
- Docker Compose installed
- `.env` file configured

## 🚀 Quick Start

### 1. Configure Environment

```bash
# Copy example environment
copy env.example .env

# Edit .env and add your values:
# - JWT_SECRET (strong random string)
# - SESSION_SECRET (strong random string)
# - GOOGLE_CLIENT_ID (optional)
# - GOOGLE_CLIENT_SECRET (optional)
# - MONGO_USERNAME (optional, default: admin)
# - MONGO_PASSWORD (optional, default: changeme)
```

### 2. Start Services

```bash
# Start all services (MongoDB + App)
docker-compose up -d

# View logs
docker-compose logs -f app

# Check status
docker-compose ps
```

### 3. Access Application

- **WebLauncher**: http://localhost:3000
- **MongoDB Express Admin**: http://localhost:8081 (optional)
- **MongoDB**: localhost:27017

### 4. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean data)
docker-compose down -v
```

## 🎯 Docker Compose Services

### 1. MongoDB Service

**Purpose**: Database for WebLauncher

**Configuration**:
- Image: `mongo:7`
- Port: `27017`
- Volumes: Persistent data storage
- Healthcheck: Auto-checks MongoDB availability
- Authentication: Enabled (admin/admin by default)

**Access**:
```bash
# Connect to MongoDB
docker exec -it weblauncher-mongodb mongosh

# Or from host
mongosh "mongodb://admin:changeme@localhost:27017/weblauncher?authSource=admin"
```

### 2. WebLauncher App

**Purpose**: Main application

**Configuration**:
- Multi-stage build: Optimized production image
- Non-root user: Security best practice
- Healthcheck: Monitors app availability
- Auto-restart: On failure
- Depends on: MongoDB (waits for healthy state)

**Access**:
```bash
# View logs
docker-compose logs -f app

# Check health
docker inspect weblauncher-app | grep Health -A 10

# Exec into container
docker exec -it weblauncher-app sh
```

### 3. MongoDB Express (Optional)

**Purpose**: Web-based MongoDB admin UI

**Configuration**:
- Image: `mongo-express:latest`
- Port: `8081`
- Profile: `admin` (only starts with profile)
- Login: admin/admin

**Start with admin UI**:
```bash
docker-compose --profile admin up -d
```

## 🔧 Docker Commands

### Basic Operations

```bash
# Build images
docker-compose build

# Build without cache
docker-compose build --no-cache

# Start services in background
docker-compose up -d

# Start and view logs
docker-compose up

# Stop services
docker-compose down

# Restart a service
docker-compose restart app

# View logs
docker-compose logs app
docker-compose logs mongodb

# View logs with timestamps
docker-compose logs -f -t app
```

### Health Checks

```bash
# Check MongoDB health
docker inspect weblauncher-mongodb | grep Health -A 10

# Check app health
docker inspect weblauncher-app | grep Health -A 10

# Check all services
docker-compose ps
```

### Data Management

```bash
# Backup database
docker exec weblauncher-mongodb mongodump --archive=/data/db/backup.archive --db=weblauncher

# Restore database
docker exec -i weblauncher-mongodb mongorestore --archive=/data/db/backup.archive --db=weblauncher

# View volumes
docker volume ls

# Remove volumes (data)
docker-compose down -v
```

### Debugging

```bash
# Inspect container
docker inspect weblauncher-app

# View container logs
docker logs weblauncher-app
docker logs weblauncher-mongodb

# Exec into container
docker exec -it weblauncher-app sh
docker exec -it weblauncher-mongodb bash

# Check network
docker network inspect weblauncher_weblauncher-network
```

## 🏗️ Dockerfile Features

### Multi-Stage Build

1. **Builder Stage**: Installs all dependencies
2. **Production Stage**: Only production dependencies

**Benefits**:
- Smaller final image
- Better security
- Faster builds

### Security Features

- ✅ Non-root user
- ✅ Minimal base image (Alpine)
- ✅ dumb-init for signal handling
- ✅ Health checks
- ✅ No sensitive data in image

### Optimization

- Production dependencies only
- NPM cache cleared
- Multi-stage build
- Layer caching

## 📦 Environment Variables

### Required Variables

```env
JWT_SECRET=<strong-random-string>
SESSION_SECRET=<strong-random-string>
```

### Optional Variables

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGO_USERNAME=admin
MONGO_PASSWORD=changeme

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## 🎛️ Profiles

### Default Profile (MongoDB + App)

```bash
docker-compose up -d
```

### With Admin UI

```bash
docker-compose --profile admin up -d
```

This starts:
- MongoDB
- WebLauncher app
- MongoDB Express (admin UI)

## 🔄 Updates

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build app
docker-compose up -d app

# Or one command
docker-compose up -d --build app
```

### Update MongoDB

```bash
docker-compose pull mongodb
docker-compose up -d mongodb
```

## 🧪 Testing

### Test Health Endpoints

```bash
# App health
curl http://localhost:3000/health

# MongoDB from app
docker exec weblauncher-app ping -c 1 mongodb
```

### Test Database Connection

```bash
# From within app container
docker exec weblauncher-app node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected'))
    .catch(err => console.log('Error:', err));
"
```

## 🚨 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check dependencies
docker-compose ps

# Rebuild
docker-compose build --no-cache app
docker-compose up -d app
```

### MongoDB Connection Issues

```bash
# Check if MongoDB is healthy
docker inspect weblauncher-mongodb | grep Health

# Test connection
docker exec weblauncher-mongodb mongosh --eval "db.version()"

# Restart MongoDB
docker-compose restart mongodb
```

### Port Already in Use

```bash
# Check what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                   # Linux/Mac

# Change port in docker-compose.yml
ports:
  - "3001:3000"
```

### Volume Permissions

```bash
# Fix permissions
sudo chown -R $USER:$USER ~/.docker/volumes

# Or recreate volumes
docker-compose down -v
docker-compose up -d
```

## 📊 Monitoring

### Container Stats

```bash
# All containers
docker stats

# Specific container
docker stats weblauncher-app

# Docker Compose stats
docker-compose top
```

### Log Management

```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100 app

# Since timestamp
docker-compose logs --since 2024-10-26T10:00:00 app
```

## 🎯 Production Deployment

### With Docker Compose

```bash
# Production environment
NODE_ENV=production docker-compose up -d

# With specific port
PORT=3000 docker-compose up -d
```

### Environment File

For production, use a secure `.env` file:

```env
NODE_ENV=production
MONGODB_URI=mongodb://user:pass@host:27017/weblauncher
JWT_SECRET=<generate-strong-secret>
SESSION_SECRET=<generate-strong-secret>
FRONTEND_URL=https://yourdomain.com
PORT=3000
```

## ✅ Verification

```bash
# Check all services are running
docker-compose ps

# Check health
curl http://localhost:3000/health

# Test database
docker exec weblauncher-mongodb mongosh --eval "db.version()"

# View logs for errors
docker-compose logs app
```

## 🎉 Done!

Your WebLauncher application is now running with Docker!

**Quick Access**:
- Application: http://localhost:3000
- MongoDB: localhost:27017
- Admin UI: http://localhost:8081 (with `--profile admin`)

For issues, check logs with: `docker-compose logs -f`

