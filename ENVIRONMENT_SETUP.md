# Environment Setup Guide

Complete guide for configuring environment variables in WebLauncher.

## 🎯 Quick Setup (5 minutes)

### Step 1: Create .env File

```bash
# Copy the example file
copy env.example .env

# On Linux/Mac:
# cp env.example .env
```

### Step 2: Generate Required Secrets

You need to generate 2 secrets: JWT_SECRET and SESSION_SECRET.

#### Option A: Using Node.js (Recommended)

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output lines to your `.env` file.

#### Option B: Using PowerShell

```powershell
# Generate JWT_SECRET
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
"JWT_SECRET=" + [Convert]::ToHexString($bytes)

# Generate SESSION_SECRET  
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
"SESSION_SECRET=" + [Convert]::ToHexString($bytes)
```

#### Option C: Online Tool

Visit https://randomkeygen.com/ and use "Fort Knox Password" or "CodeIgniter Encryption Keys"

---

## ⚙️ Configuration Guide

### 1. JWT_SECRET (Required)

**What it is**: Secret key for JWT token generation and verification

**Security**: Must be at least 32 characters, preferably 64+

**How to generate**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Example**:
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-production-use
```

### 2. SESSION_SECRET (Required)

**What it is**: Secret key for session cookie encryption

**Security**: Must be at least 32 characters, preferably 64+

**How to generate**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Example**:
```
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters-long-for-production
```

### 3. GOOGLE_CLIENT_ID (Optional but Recommended)

**What it is**: Google OAuth 2.0 Client ID for "Login with Google"

**How to get it**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable **Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "WebLauncher"
   - Authorized redirect URIs:
     - Development: `http://localhost:3000/auth/google/callback`
     - Production: `https://yourdomain.com/auth/google/callback`
   - Click "Create"
5. Copy the "Client ID"

**Example**:
```
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### 4. GOOGLE_CLIENT_SECRET (Optional)

**What it is**: Secret key for Google OAuth

**Where to find it**: Same credentials page where you got Client ID

**Security**: Keep this secret! Never commit to Git.

**Example**:
```
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

### 5. GOOGLE_CALLBACK_URL (Optional)

**What it is**: URL where Google redirects after authentication

**Format**: `http://localhost:3000/auth/google/callback` (development)
**Format**: `https://yourdomain.com/auth/google/callback` (production)

**Development**:
```
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

**Production**:
```
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
```

---

## 📝 Complete .env Example

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/weblauncher

# JWT Configuration (REQUIRED)
JWT_SECRET=your-secret-key-minimum-32-characters-long-change-this-in-production

# Session Configuration (REQUIRED)
SESSION_SECRET=your-session-secret-key-minimum-32-characters-change-this-in-production

# Google OAuth 2.0 Configuration (OPTIONAL)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## 🔐 Production Environment Variables

For production deployment, ensure all variables are set:

```env
# Server
NODE_ENV=production
PORT=3000

# MongoDB (use Atlas connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/weblauncher

# Security (REQUIRED - use strong secrets)
JWT_SECRET=<generate-64-character-random-string>
SESSION_SECRET=<generate-64-character-random-string>

# Google OAuth (REQUIRED if using Google login)
GOOGLE_CLIENT_ID=<your-production-client-id>
GOOGLE_CLIENT_SECRET=<your-production-client-secret>
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

# Frontend
FRONTEND_URL=https://yourdomain.com
```

---

## 🚀 Setup Instructions

### Development Setup

**Step 1: Generate Secrets**
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Step 2: Create .env File**
```bash
copy env.example .env
```

**Step 3: Edit .env**
Add your generated secrets and configure:

Minimum required:
```env
JWT_SECRET=<paste-generated-secret>
SESSION_SECRET=<paste-generated-secret>
```

Optional (for Google OAuth):
```env
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

**Step 4: Start MongoDB**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Step 5: Run Application**
```bash
npm install
npm run dev
```

**Step 6: Access**
```
http://localhost:3000
```

---

### Production Setup

**Step 1: Generate Strong Secrets**
```bash
# Generate production secrets
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Run twice to get two different secrets for JWT_SECRET and SESSION_SECRET.

**Step 2: Set Up MongoDB Atlas**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string
4. Whitelist your server IP
5. Set `MONGODB_URI` in `.env`

**Step 3: Configure Google OAuth for Production**
1. Go to Google Cloud Console
2. Update OAuth consent screen for production
3. Add production callback URL
4. Get production Client ID and Secret

**Step 4: Deploy**
- See `DEPLOYMENT_GUIDE.md` for platform-specific instructions

---

## ✅ Verification

### Check if .env is Configured

```bash
# Windows
if (Test-Path .env) { Write-Host "✓ .env exists" } else { Write-Host "✗ .env missing" }

# Linux/Mac
if [ -f .env ]; then echo "✓ .env exists"; else echo "✗ .env missing"; fi
```

### Test Configuration

```bash
# Start app
npm run dev

# Check if it loads
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-..."}
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit .env to Git**
   - Already in `.gitignore`
   - Use `.env.example` for templates

2. ✅ **Use Strong Secrets**
   - Minimum 32 characters
   - Preferably 64+ characters
   - Use cryptographically random strings

3. ✅ **Different Secrets for Each Environment**
   - Development: local secrets
   - Production: strong production secrets
   - Staging: different from production

4. ✅ **Rotate Secrets Regularly**
   - Change JWT_SECRET periodically
   - Change SESSION_SECRET periodically
   - Update users will need to re-login

5. ✅ **Store Secrets Securely**
   - Use environment variables in production
   - Use secret management (AWS Secrets Manager, etc.)
   - Never hardcode in code

---

## 🐛 Troubleshooting

### "JWT_SECRET is not defined"

**Solution**: Add JWT_SECRET to your .env file

### "Google OAuth not working"

**Check**:
1. GOOGLE_CLIENT_ID is set
2. GOOGLE_CLIENT_SECRET is set
3. GOOGLE_CALLBACK_URL matches Google Console
4. Google+ API is enabled
5. Correct callback URL in Google Console

### "MongoDB connection failed"

**Check**:
1. MongoDB is running
2. MONGODB_URI is correct
3. Network/firewall allows connection
4. For Atlas: IP is whitelisted

### ".env file not loading"

**Check**:
1. File is named `.env` (not `.env.txt`)
2. File is in project root
3. No typos in variable names
4. Using `dotenv` package (already configured)

---

## 📚 Related Documentation

- **Quick Start**: `QUICK_START.md`
- **Full Setup**: `SETUP.md`
- **Deployment**: `DEPLOYMENT_GUIDE.md`
- **Docker**: `DOCKER.md`

---

## 🎉 You're All Set!

Once your `.env` file is configured:

1. ✅ Start MongoDB: `docker run -d -p 27017:27017 --name mongodb mongo:7`
2. ✅ Install dependencies: `npm install`
3. ✅ Run app: `npm run dev`
4. ✅ Visit: http://localhost:3000

Enjoy WebLauncher! 🚀

