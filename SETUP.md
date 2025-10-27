# WebLauncher - Setup Instructions

## 📋 Overview

WebLauncher is a complete full-stack Node.js web application for managing bookmarks with user authentication, Google OAuth 2.0, and MongoDB.

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Copy the example environment file:

```bash
copy env.example .env
```

Edit `.env` file and update these minimum required values:
- `JWT_SECRET`: Generate a random 32+ character string
- `SESSION_SECRET`: Generate a random 32+ character string  
- `MONGODB_URI`: Leave as default or update if using Atlas

### Step 3: Start MongoDB

**Option A: Windows Service**
```bash
net start MongoDB
```

**Option B: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### Step 4: Run the Application

```bash
npm run dev
```

Visit: `http://localhost:3000`

## 🐳 Docker Setup (All-in-One)

If you want MongoDB + App in containers:

```bash
docker-compose up -d
```

Access at: `http://localhost:3000`

View logs:
```bash
docker-compose logs -f app
```

Stop:
```bash
docker-compose down
```

## ☁️ Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Secret to `.env`

## 📁 Project Structure

```
WebLauncher/
├── config/
│   └── passport.js          # Authentication strategies
├── models/
│   ├── User.js             # User model with bcrypt
│   └── Url.js              # Bookmark model
├── routes/
│   ├── auth.js             # Registration, login, OAuth
│   └── api.js              # CRUD operations for URLs
├── views/
│   ├── login.ejs           # Login page
│   ├── register.ejs        # Registration page
│   ├── dashboard.ejs       # Main app (cards layout)
│   └── error.ejs           # Error page
├── public/
│   ├── css/
│   │   └── style.css       # Custom Bootstrap styles
│   └── js/
│       ├── main.js         # Shared utilities
│       ├── auth.js         # Login/register logic
│       └── dashboard.js    # URL CRUD operations
├── server.js               # Express app entry point
├── Dockerfile              # Production container
├── docker-compose.yml      # Multi-container setup
├── package.json            # Dependencies
└── README.md              # Full documentation
```

## 🔐 Security Features Implemented

✅ Input validation with express-validator  
✅ XSS protection (input sanitization)  
✅ SQL injection prevention (Mongoose ORM)  
✅ Rate limiting (100 req/15min per IP)  
✅ Helmet.js security headers  
✅ bcrypt password hashing (10 salt rounds)  
✅ JWT token-based sessions  
✅ Secure session cookies  
✅ CORS protection  
✅ Request sanitization  

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Email/password login
- `POST /auth/logout` - End session
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/me` - Get current user

### URL Management
- `GET /api/urls` - List all bookmarks
- `POST /api/urls` - Create bookmark
- `PUT /api/urls/:id` - Update bookmark
- `DELETE /api/urls/:id` - Delete bookmark

## 🧪 Testing

### Register a user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","password":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  -c cookies.txt
```

### Add URL:
```bash
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"description":"Google","url":"https://google.com"}' \
  -b cookies.txt
```

### Get URLs:
```bash
curl http://localhost:3000/api/urls -b cookies.txt
```

## 🎨 Frontend Features

- **Responsive Design**: Mobile-first with Bootstrap 5
- **Interactive Cards**: Hover effects, animations
- **Modal Forms**: Add/Edit URLs
- **AJAX Operations**: No page reloads
- **Real-time Updates**: Instant UI feedback
- **Google Sign In**: Social authentication
- **Validation**: Client-side + server-side

## 🔧 Development Commands

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production mode
npm run lint     # Check code quality
npm run lint:fix # Auto-fix lint errors
npm run format   # Format code with Prettier
```

## 🚢 Production Deployment

### Prerequisites
- Docker installed
- MongoDB Atlas account (or host MongoDB)
- Google OAuth credentials

### Deploy to Google Cloud Run

1. **Build and push:**
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT/weblauncher
```

2. **Deploy:**
```bash
gcloud run deploy weblauncher \
  --image gcr.io/YOUR_PROJECT/weblauncher \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. **Set environment variables:**
Update via Cloud Console or CLI with:
- MONGODB_URI (Atlas connection string)
- JWT_SECRET (strong random string)
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_CALLBACK_URL (production URL)
- NODE_ENV=production
- SESSION_SECRET

## 📚 Tech Stack

- **Backend**: Express.js, MongoDB, Mongoose
- **Auth**: Passport.js, JWT, bcrypt
- **Frontend**: EJS, Bootstrap 5, Vanilla JS
- **Security**: Helmet, express-rate-limit, express-validator
- **Dev Tools**: ESLint, Prettier, nodemon

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# Or check service status
net start MongoDB  # Windows
sudo systemctl status mongod  # Linux
```

### Port Already in Use
Edit `.env` and change `PORT=3000` to another port.

### Google OAuth Issues
1. Verify Client ID and Secret in `.env`
2. Check redirect URI matches exactly
3. Ensure Google+ API is enabled

### Module Not Found Errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

## 📞 Next Steps

1. **Try the app**: Register → Login → Add URLs
2. **Customize**: Edit `public/css/style.css` for styling
3. **Extend**: Add more features (tags, categories, etc.)
4. **Deploy**: Follow production deployment guide
5. **Secure**: Change all secrets before deploying

## 🎉 You're All Set!

The application is production-ready with:
- ✅ User authentication (email + Google OAuth)
- ✅ CRUD operations for bookmarks
- ✅ Responsive UI (mobile + desktop)
- ✅ Security best practices
- ✅ Docker support
- ✅ RESTful API
- ✅ JWT sessions
- ✅ Input validation
- ✅ Error handling

Happy coding! 🚀

