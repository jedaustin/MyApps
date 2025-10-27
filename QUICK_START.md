# Quick Start Guide

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Minimum required changes:
- Update `MONGODB_URI` if not using default
- Update `JWT_SECRET` (minimum 32 characters)
- Update `SESSION_SECRET` (minimum 32 characters)

### 3. Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

**Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Docker Quick Start

### Option 1: Complete Stack (MongoDB + App)

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

### Option 2: App Only (with external MongoDB)

```bash
# Build
docker build -t weblauncher .

# Run
docker run -p 3000:3000 --env-file .env weblauncher
```

## First Steps After Installation

1. Navigate to `http://localhost:3000`
2. Click "Register here" to create an account
3. Or use "Continue with Google" (if configured)
4. Start adding your URLs!

## Common Issues

### Port Already in Use
Change PORT in `.env` or stop the conflicting service.

### MongoDB Connection Error
- Check if MongoDB is running: `mongosh` or check service status
- Verify MONGODB_URI in `.env`
- For Docker: ensure MongoDB container is running

### Google OAuth Not Working
- Check `.env` has GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Verify callback URL in Google Cloud Console
- Ensure callback URL matches exactly: `http://localhost:3000/auth/google/callback`

## Testing the API

### Using curl:

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","username":"johndoe","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"password123"}' \
  --cookie-jar cookies.txt --cookie cookies.txt
```

**Get URLs:**
```bash
curl http://localhost:3000/api/urls \
  --cookie cookies.txt
```

**Add URL:**
```bash
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"description":"Google","url":"https://google.com"}' \
  --cookie cookies.txt
```

## Production Deployment Checklist

- [ ] Change NODE_ENV to `production` in `.env`
- [ ] Update JWT_SECRET and SESSION_SECRET with strong random strings
- [ ] Configure MongoDB Atlas or production database
- [ ] Update Google OAuth callback URL for production domain
- [ ] Set secure cookies (HTTPS required)
- [ ] Configure proper CORS origins
- [ ] Use reverse proxy (nginx) for static assets in production
- [ ] Set up SSL/TLS certificates
- [ ] Configure backup strategy for MongoDB
- [ ] Set up monitoring and logging
- [ ] Review and update rate limiting settings

## Project URLs

- Home/Dashboard: `http://localhost:3000/dashboard`
- Login: `http://localhost:3000/login`
- Register: `http://localhost:3000/register`
- API Base: `http://localhost:3000/api`
- Health Check: `http://localhost:3000/health`

