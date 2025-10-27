# Google OAuth Setup Guide

How to extract Google OAuth credentials from the JSON file and configure WebLauncher.

## 📁 Understanding Google Credentials

Google provides a `credentials.json` file when you download OAuth 2.0 credentials.  
**You need to extract values from this JSON to your .env file.**

## 🔍 Your credentials.json File

If you downloaded credentials from Google Cloud Console, you have a file like this:

```json
{
  "web": {
    "client_id": "123456789-abc.apps.googleusercontent.com",
    "project_id": "your-project-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "GOCSPX-abcdefghijklmnop",
    "redirect_uris": [
      "http://localhost:3000/auth/google/callback"
    ]
  }
}
```

## ✅ What You Need for .env

From the JSON file, extract these values:

### 1. GOOGLE_CLIENT_ID

From `client_id` in the JSON:
```
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

### 2. GOOGLE_CLIENT_SECRET

From `client_secret` in the JSON:
```
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
```

### 3. GOOGLE_CALLBACK_URL

This should match your redirect URI:
```
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## 📝 Quick Setup Steps

### Step 1: Open Your credentials.json

Locate the file you downloaded from Google Cloud Console.

### Step 2: Extract Values

Look for these keys in your JSON:
- `client_id` → becomes `GOOGLE_CLIENT_ID`
- `client_secret` → becomes `GOOGLE_CLIENT_SECRET`

### Step 3: Add to .env

Open your `.env` file and add:

```env
GOOGLE_CLIENT_ID=<paste-client_id-value-here>
GOOGLE_CLIENT_SECRET=<paste-client_secret-value-here>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

**Example**:
```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## 🎯 Complete .env Example

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/weblauncher

# JWT (REQUIRED)
JWT_SECRET=your-jwt-secret-here

# Session (REQUIRED)
SESSION_SECRET=your-session-secret-here

# Google OAuth (OPTIONAL)
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 🔐 Security Note

**IMPORTANT**: 
- ❌ Never commit `credentials.json` to Git
- ❌ Never commit `.env` to Git
- ✅ Both files are already in `.gitignore`
- ✅ Keep these files local only

## 📸 Visual Guide

If you have credentials.json, here's what it looks like:

```
credentials.json
└── "web"
    ├── "client_id" → GOOGLE_CLIENT_ID
    ├── "client_secret" → GOOGLE_CLIENT_SECRET
    └── "redirect_uris" → GOOGLE_CALLBACK_URL
```

## ✅ Verification

After adding to .env, verify your setup:

```bash
# Check if variables are loaded
npm run dev

# Try accessing the app
# http://localhost:3000

# Test Google OAuth
# Click "Continue with Google" button
```

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error

This means your callback URL doesn't match Google Console.

**Fix**:
1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Edit your OAuth 2.0 Client
4. Add to "Authorized redirect URIs":
   - `http://localhost:3000/auth/google/callback`
5. Save

### "invalid_client" Error

Your GOOGLE_CLIENT_SECRET is incorrect.

**Fix**:
1. Double-check the JSON file
2. Copy the exact value from `client_secret`
3. Paste to GOOGLE_CLIENT_SECRET in .env
4. No extra spaces or quotes

### "client_id is missing"

GOOGLE_CLIENT_ID is not set.

**Fix**:
1. Add GOOGLE_CLIENT_ID to .env
2. Get from credentials.json
3. Restart the app

## 📚 Alternative: Getting Credentials Directly

If you haven't created credentials yet:

### Option 1: Download JSON File

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Click "Create Credentials" → OAuth client ID
4. Configure:
   - Type: Web application
   - Name: WebLauncher
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
5. Click "Create"
6. Click "Download JSON"
7. Extract values from the downloaded file

### Option 2: Copy from Console

Instead of downloading JSON:
1. Go to your OAuth 2.0 Client in Google Console
2. Copy "Client ID" → paste as GOOGLE_CLIENT_ID
3. Copy "Client secret" → paste as GOOGLE_CLIENT_SECRET

## 🎉 Summary

**What to put in .env**:
```env
GOOGLE_CLIENT_ID=value-from-json-client_id
GOOGLE_CLIENT_SECRET=value-from-json-client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

**Where to get values**:
- From the `credentials.json` file you downloaded
- Or from Google Cloud Console credentials page

**Need Help?**: See `SETUP-ASSISTANT.md` or `ENVIRONMENT_SETUP.md`

