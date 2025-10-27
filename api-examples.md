# WebLauncher - API Examples

Complete API examples for testing and integration.

## Base URL

- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

## Authentication Flow

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "password": "password123"
  }'
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "userId": "64f5a7b8c9d1e2f3a4b5c6d7",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }' \
  -c cookies.txt
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "userId": "64f5a7b8c9d1e2f3a4b5c6d7",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Current User

```bash
curl http://localhost:3000/auth/me -b cookies.txt
```

**Response (200 OK):**
```json
{
  "user": {
    "_id": "64f5a7b8c9d1e2f3a4b5c6d7",
    "name": "John Doe",
    "username": "johndoe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Logout

```bash
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

## URL Management

### 1. Get All URLs

```bash
curl http://localhost:3000/api/urls -b cookies.txt
```

**Response (200 OK):**
```json
{
  "urls": [
    {
      "_id": "64f5a7b8c9d1e2f3a4b5c6d8",
      "userId": "64f5a7b8c9d1e2f3a4b5c6d7",
      "description": "Google Search",
      "url": "https://google.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Create New URL

```bash
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{
    "description": "GitHub",
    "url": "https://github.com"
  }' \
  -b cookies.txt
```

**Response (201 Created):**
```json
{
  "message": "URL created successfully",
  "url": {
    "_id": "64f5a7b8c9d1e2f3a4b5c6d9",
    "userId": "64f5a7b8c9d1e2f3a4b5c6d7",
    "description": "GitHub",
    "url": "https://github.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Update URL

```bash
curl -X PUT http://localhost:3000/api/urls/64f5a7b8c9d1e2f3a4b5c6d9 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "GitHub - Code Repository",
    "url": "https://github.com"
  }' \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "message": "URL updated successfully",
  "url": {
    "_id": "64f5a7b8c9d1e2f3a4b5c6d9",
    "userId": "64f5a7b8c9d1e2f3a4b5c6d7",
    "description": "GitHub - Code Repository",
    "url": "https://github.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 4. Delete URL

```bash
curl -X DELETE http://localhost:3000/api/urls/64f5a7b8c9d1e2f3a4b5c6d9 \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "message": "URL deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "msg": "Description is required",
      "param": "description",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "error": "URL not found or access denied"
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "message": "Internal server error"
  }
}
```

---

## Using with JavaScript/Fetch

### Example: Complete Flow

```javascript
// 1. Register user
const registerResponse = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'John Doe',
    username: 'johndoe',
    password: 'password123'
  })
});
const { token } = await registerResponse.json();

// 2. Create URL
const createResponse = await fetch('http://localhost:3000/api/urls', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  credentials: 'include',
  body: JSON.stringify({
    description: 'GitHub',
    url: 'https://github.com'
  })
});
const { url } = await createResponse.json();

// 3. Get all URLs
const listResponse = await fetch('http://localhost:3000/api/urls', {
  credentials: 'include'
});
const { urls } = await listResponse.json();

// 4. Update URL
await fetch(`http://localhost:3000/api/urls/${url._id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    description: 'GitHub - Updated',
    url: 'https://github.com'
  })
});

// 5. Delete URL
await fetch(`http://localhost:3000/api/urls/${url._id}`, {
  method: 'DELETE',
  credentials: 'include'
});
```

---

## Using with Postman

### Collection Setup

1. **Base URL**: `http://localhost:3000`
2. **Environment Variables**:
   - `base_url`: `http://localhost:3000`
   - `token`: (set after login)

### Authentication

1. Create folder: "Authentication"
2. Import requests for register, login, logout
3. Set up tests to save token automatically

### API Requests

1. Create folder: "URL Management"
2. Import all CRUD operations
3. Use `{{base_url}}` for URL prefix
4. Set Authorization header with `Bearer {{token}}`

---

## Rate Limiting

API endpoints are rate-limited:
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Includes `X-RateLimit-*` headers in response

---

## Health Check

```bash
curl http://localhost:3000/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Testing Script

Save as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# Register
echo "Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","password":"test123"}')

echo "Register: $REGISTER_RESPONSE"

# Login
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  -c cookies.txt)

echo "Login: $LOGIN_RESPONSE"

# Add URL
echo "Adding URL..."
ADD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/urls" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test URL","url":"https://example.com"}' \
  -b cookies.txt)

echo "Add URL: $ADD_RESPONSE"

# List URLs
echo "Listing URLs..."
LIST_RESPONSE=$(curl -s "$BASE_URL/api/urls" -b cookies.txt)

echo "List URLs: $LIST_RESPONSE"

echo "Test complete!"
```

Run: `chmod +x test-api.sh && ./test-api.sh`

