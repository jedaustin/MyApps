# Setup Assistant - Guided Configuration

Follow these steps to set up your WebLauncher environment.

## 🎯 I. Required Setup (Minimum to Run)

### 1. Create .env File

```bash
copy env.example .env
```

### 2. Generate and Add JWT_SECRET

Run this command and **copy the entire output line**:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Example output**:
```
JWT_SECRET=abc123def456...copy-this-entire-line
```

**Add to .env file**:
```env
JWT_SECRET=abc123def456...paste-generated-value-here
```

### 3. Generate and Add SESSION_SECRET

Run this command and **copy the entire output line**:
```bash
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Add to .env file**:
```env
SESSION_SECRET=xyz789uvw012...paste-generated-value-here
```

### 4. Your .env Should Now Have:

```env
JWT_SECRET=<paste-your-generated-jwt-secret-here>
SESSION_SECRET=<paste-your-generated-session-secret-here>
```

### 5. Start MongoDB

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### 6. Install and Run

```bash
npm install
npm run dev
```

### 7. Access Application

Open: http://localhost:3000

**✅ You can now use the app without Google OAuth!**

---

## 🎯 II. Optional Setup (Google OAuth)

To enable "Login with Google" button, follow these steps:

### Step 1: Go to Google Cloud Console

Visit: https://console.cloud.google.com/

### Step 2: Create/Select Project

- Click "Select a project" → "New Project"
- Name: "WebLauncher"
- Click "Create"

### Step 3: Enable Google+ API

1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on "Google+ API"
4. Click "Enable"

### Step 4: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" → "Create"
3. Fill in:
   - App name: WebLauncher
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
4. Click "Save and Continue"
5. Skip scopes (click "Save and Continue")
6. Add yourself as test user
7. Click "Back to Dashboard"

### Step 5: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure:
   - Application type: Web application
   - Name: WebLauncher
   - Authorized JavaScript origins:
     - http://localhost:3000
   - Authorized redirect URIs:
     - http://localhost:3000/auth/google/callback
4. Click "Create"
5. **Copy Client ID and Client Secret**

### Step 6: Add to .env

```env
GOOGLE_CLIENT_ID=<paste-client-id-here>
GOOGLE_CLIENT_SECRET=<paste-client-secret-here>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### Step 7: Restart Application

```bash
npm run dev
```

**✅ Google OAuth now works!**

---

## 🎯 III. Production Setup

### For Production Deployment:

**1. Stronger Secrets**
```bash
# Generate 64-character secrets
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**2. MongoDB Atlas**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create cluster
- Get connection string
- Update `MONGODB_URI`

**3. Production Callback URL**
```env
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
```

**4. Deploy**
See `DEPLOYMENT_GUIDE.md`

---

## ✅ Checklist

**Minimum Required (To Run App)**:
- [ ] .env file created
- [ ] JWT_SECRET set
- [ ] SESSION_SECRET set
- [ ] MongoDB running
- [ ] npm install completed
- [ ] npm run dev successful
- [ ] Can access http://localhost:3000

**Google OAuth (Optional)**:
- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] Client ID created
- [ ] Client Secret obtained
- [ ] GOOGLE_CLIENT_ID in .env
- [ ] GOOGLE_CLIENT_SECRET in .env
- [ ] GOOGLE_CALLBACK_URL in .env
- [ ] Google OAuth button works

---

## 🐛 Common Issues

### "Cannot find module" errors
```bash
npm install
```

### "MongoDB connection failed"
```bash
# Check if MongoDB is running
docker ps

# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### "Port already in use"
Edit `.env` and change `PORT=3000` to another port

### "Invalid JWT_SECRET"
Make sure it's at least 32 characters long

### Google OAuth "redirect_uri_mismatch"
- Check GOOGLE_CALLBACK_URL in .env
- Must match exactly with Google Console
- Check authorized URIs in Google Console

---

## 📞 Need Help?

- **Environment Variables**: See `ENVIRONMENT_SETUP.md`
- **Quick Start**: See `QUICK_START.md`
- **Full Setup**: See `SETUP.md`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Docker**: See `DOCKER.md`

---

**You're ready to go!** 🚀

