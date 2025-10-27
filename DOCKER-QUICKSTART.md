# Docker Quick Start Guide

Get WebLauncher running with Docker in 3 steps!

## ⚡ Quick Start

### Step 1: Configure

```bash
copy env.example .env
# Edit .env with minimum: JWT_SECRET and SESSION_SECRET
```

### Step 2: Start

```bash
docker-compose up -d
```

### Step 3: Access

Open http://localhost:3000

## 🎯 What's Running?

- **WebLauncher App** - Port 3000
- **MongoDB** - Port 27017
- **Optional Admin UI** - Port 8081 (with `--profile admin`)

## 📝 Basic Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f app

# Restart
docker-compose restart app

# Status
docker-compose ps
```

## 🔍 Troubleshooting

**Check logs**:
```bash
docker-compose logs app
docker-compose logs mongodb
```

**Check health**:
```bash
curl http://localhost:3000/health
```

**Rebuild**:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📚 Full Documentation

See `DOCKER.md` for complete Docker guide.

## ✅ Verify

Run: `docker-compose ps`

All services should show "Up" status.

Done! 🎉

