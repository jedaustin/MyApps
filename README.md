# MyApps

A full-stack Node.js web application for managing bookmarks with user authentication. Features include user registration, Google OAuth 2.0 login, and CRUD operations for URL management, all running in Docker.

## Features

- **User Authentication**
  - Email/Password registration and login
  - Google OAuth 2.0 integration
  - JWT-based session management
  - Secure password hashing with bcrypt

- **URL Management**
  - Create, read, update, and delete bookmarks
  - Responsive card-based UI
  - Clickable descriptions that navigate to URLs
  - User-specific URL storage

- **Security**
  - Input validation and sanitization
  - OWASP security best practices
  - Helmet.js for HTTP headers security
  - Rate limiting
  - XSS protection
  - CORS configuration

- **Technology Stack**
  - **Backend**: Express.js with ES Modules
  - **Database**: MongoDB with Mongoose ORM
  - **Authentication**: Passport.js with Google OAuth and JWT
  - **Frontend**: EJS templating with Bootstrap 5
  - **Security**: Helmet, express-rate-limit, express-validator

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Docker (optional, for containerized deployment)

## Project Structure

```
WebLauncher/
├── config/
│   └── passport.js          # Passport.js authentication strategies
├── models/
│   ├── User.js              # User model
│   └── Url.js                # URL/Bookmark model
├── routes/
│   ├── auth.js              # Authentication routes
│   └── api.js                # API routes for URLs
├── views/
│   ├── login.ejs            # Login page
│   ├── register.ejs         # Registration page
│   ├── dashboard.ejs        # Main dashboard
│   └── error.ejs            # Error page
├── public/
│   ├── css/
│   │   └── style.css        # Custom styles
│   └── js/
│       ├── main.js          # Main JavaScript
│       ├── auth.js          # Authentication logic
│       └── dashboard.js     # Dashboard functionality
├── server.js                # Express server
├── package.json             # Dependencies and scripts
├── Dockerfile               # Container configuration
├── docker-compose.yml       # Multi-container setup
└── README.md                # This file
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd WebLauncher
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```bash
copy env.example .env
```

Edit `.env` and update the following values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/weblauncher

# JWT Configuration
JWT_SECRET=your-secret-key-minimum-32-characters-long

# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Set up Google OAuth (Optional but recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

### 5. Start MongoDB

**Option A: Using local MongoDB**

```bash
# On Windows
net start MongoDB

# On Linux/Mac
sudo systemctl start mongod
```

**Option B: Using Docker**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Mode

```bash
npm start
```

## Docker Deployment

### Using Docker Compose (Recommended)

This will start both MongoDB and the application:

```bash
docker-compose up -d
```

To stop:

```bash
docker-compose down
```

### Building and Running Individual Container

```bash
# Build the image
docker build -t weblauncher .

# Run the container
docker run -p 3000:3000 --env-file .env weblauncher
```

## Deployment on Google Cloud Run

### Prerequisites

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Authenticate: `gcloud auth login`
3. Set your project: `gcloud config set project YOUR_PROJECT_ID`

### Steps

1. **Update environment variables in Cloud Run**

   Update your `.env` file with production values:
   
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/weblauncher
   FRONTEND_URL=https://your-domain.com
   GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
   ```

2. **Build the container image**

   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/weblauncher
   ```

3. **Deploy to Cloud Run**

   ```bash
   gcloud run deploy weblauncher \
     --image gcr.io/YOUR_PROJECT_ID/weblauncher \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars "MONGODB_URI=your-mongo-uri,JWT_SECRET=your-secret,NODE_ENV=production,GOOGLE_CLIENT_ID=your-client-id,GOOGLE_CLIENT_SECRET=your-client-secret,GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback,SESSION_SECRET=your-session-secret"
   ```

4. **Set up MongoDB Atlas** (Recommended)

   - Create a MongoDB Atlas account
   - Create a cluster (free tier available)
   - Get the connection string
   - Add your Cloud Run IP to the whitelist
   - Update `MONGODB_URI` in Cloud Run environment variables

5. **Update Google OAuth redirect URI**

   In Google Cloud Console, add your Cloud Run URL to authorized redirect URIs:
   `https://your-service-url.a.run.app/auth/google/callback`

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with username/password
- `POST /auth/logout` - Logout current user
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/me` - Get current user

### URL Management

- `GET /api/urls` - Get all user's URLs
- `POST /api/urls` - Create a new URL
- `PUT /api/urls/:id` - Update a URL
- `DELETE /api/urls/:id` - Delete a URL

## Development

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint errors
npm run lint:fix

# Format code with Prettier
npm run format
```

### Code Structure

- **ES Modules**: The project uses ES6 import/export syntax
- **MVC Pattern**: Routes handle HTTP requests, models define data structure
- **Middleware**: Authentication and validation middleware for security
- **Static Files**: CSS and JS files in `public/` directory

## Security Features

- **Input Validation**: Express-validator for request validation
- **SQL Injection Prevention**: Mongoose ORM with parameterized queries
- **XSS Protection**: Input sanitization with mongo-sanitize
- **CSRF Protection**: Session-based authentication
- **Rate Limiting**: Prevent brute force attacks
- **Helmet.js**: Security headers
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify network accessibility

### Google OAuth Not Working

- Check client ID and secret in `.env`
- Verify callback URL matches exactly
- Ensure Google+ API is enabled in Cloud Console

### Port Already in Use

- Change the PORT in `.env` file
- Or stop the process using the port

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
