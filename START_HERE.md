# 🚀 WebLauncher - Start Here!

Welcome to **WebLauncher** - Your complete bookmark management solution!

## ⚡ Quick Start (Choose One)

### Option 1: Local Development (Recommended for first-time users)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
copy env.example .env
# Edit .env and update JWT_SECRET and SESSION_SECRET

# 3. Start MongoDB
net start MongoDB  # Windows
# OR
docker run -d -p 27017:27017 --name mongodb mongo:7

# 4. Run the app
npm run dev

# 5. Open browser
http://localhost:3000
```

### Option 2: Docker (Easiest - Everything in containers)

```bash
# 1. Setup environment
copy env.example .env
# Edit .env with your values

# 2. Start everything (MongoDB + App)
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Open browser
http://localhost:3000
```

## 📚 Documentation Files

1. **README.md** - Complete project documentation
2. **QUICK_START.md** - Fast setup guide
3. **SETUP.md** - Detailed setup instructions
4. **PROJECT_SUMMARY.md** - Implementation checklist

## ✨ What You Get

### 🔐 Authentication
- Email/Password registration and login
- Google OAuth 2.0 social login
- Secure JWT-based sessions
- Password hashing with bcrypt

### 📝 URL Management
- Create, read, update, delete bookmarks
- Responsive card-based UI
- Clickable URLs
- User-specific storage

### 🛡️ Security Features
- Input validation
- XSS protection
- Rate limiting
- Security headers
- Secure cookies
- SQL injection prevention

### 📱 Responsive Design
- Works on mobile and desktop
- Bootstrap 5 styling
- Interactive cards
- AJAX operations

## 🎯 First Steps After Installation

1. **Register**: Click "Register here" and create an account
2. **Or Google**: Use "Continue with Google" button
3. **Add URL**: Click "Add URL" button
4. **Navigate**: Click any description to open the URL
5. **Edit/Delete**: Use buttons on each card

## 📋 Default Pages

- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Dashboard**: http://localhost:3000/dashboard
- **Health Check**: http://localhost:3000/health

## 🔧 Troubleshooting

### MongoDB Not Running?
```bash
# Check if running
mongosh

# Start it (Windows)
net start MongoDB

# Or with Docker
docker start mongodb
```

### Port Already in Use?
Edit `.env` and change `PORT=3000` to another port.

### Google OAuth Not Working?
1. Get credentials from https://console.cloud.google.com
2. Add to `.env` file
3. Set redirect URI: `http://localhost:3000/auth/google/callback`

## 📁 Project Structure

```
WebLauncher/
├── server.js              # Main Express server
├── config/                 # Passport authentication
├── models/                 # User and URL models
├── routes/                 # API and auth routes
├── views/                  # EJS templates
├── public/                 # CSS and JavaScript
├── Dockerfile             # Container configuration
├── docker-compose.yml     # Multi-container setup
└── package.json           # Dependencies
```

## 🎨 Features

✅ Complete authentication system  
✅ RESTful API with full CRUD  
✅ Responsive Bootstrap UI  
✅ Google OAuth integration  
✅ JWT token sessions  
✅ Input validation & sanitization  
✅ Security best practices  
✅ Docker support  
✅ Production-ready  
✅ ES Modules  
✅ Error handling  

## 🚀 Ready to Deploy?

See **README.md** for:
- Google Cloud Run deployment
- Production configuration
- Security checklists
- Environment setup

## 💡 Need Help?

1. Check **SETUP.md** for detailed instructions
2. See **PROJECT_SUMMARY.md** for feature list
3. Review **README.md** for full documentation
4. Check `server.js` for comments

## 🎉 Happy Coding!

Your WebLauncher app is ready to use. Start adding your bookmarks! 🔖

