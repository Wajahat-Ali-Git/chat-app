# API Documentation

Complete reference for all backend API endpoints.

**Base URL**: `http://localhost:5000/api`

---

## Authentication

All protected routes require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (201 Created):
```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f1a",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `400` - User already exists or validation error
- `500` - Server error

---

#### Login User
```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f1a",
  "name": "John Doe",
  "email": "john@example.com",
  "isOnline": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `401` - Invalid credentials
- `500` - Server error

---

### User Routes

#### Get All Users
```http
GET /api/users?search=john
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Query Parameters**:
- `search` (optional) - Search by name or email

**Response** (200 OK):
```json
[
  {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john@example.com",
    "isOnline": true,
    "lastSeen": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "60d5ec49f1b2c72b8c8e4f1b",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "isOnline": false,
    "lastSeen": "2024-01-15T09:15:00.000Z"
  }
]
```

**Errors**:
- `401` - Unauthorized (invalid or missing token)
- `500` - Server error

---

#### Get User by ID
```http
GET /api/users/:id
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Response** (200 OK):
```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f1a",
  "name": "John Doe",
  "email": "john@example.com",
  "isOnline": true,
  "lastSeen": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors**:
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

### Conversation Routes

#### Get User Conversations
```http
GET /api/conversations
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Response** (200 OK):
```json
[
  {
    "_id": "60d5ec49f1b2c72b8c8e4f1c",
    "participants": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4f1a",
        "name": "John Doe",
        "email": "john@example.com",
        "isOnline": true,
        "lastSeen": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "60d5ec49f1b2c72b8c8e4f1b",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "isOnline": false,
        "lastSeen": "2024-01-15T09:15:00.000Z"
      }
    ],
    "lastMessage": {
      "_id": "60d5ec49f1b2c72b8c8e4f1d",
      "text": "Hello there!",
      "sender": "60d5ec49f1b2c72b8c8e4f1a",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    "isGroup": false,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

**Errors**:
- `401` - Unauthorized
- `500` - Server error

---

#### Create or Get Conversation
```http
POST /api/conversations
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Request Body**:
```json
{
  "userId": "60d5ec49f1b2c72b8c8e4f1b"
}
```

**Response** (200 OK or 201 Created):
```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f1c",
  "participants": ["60d5ec49f1b2c72b8c8e4f1a", "60d5ec49f1b2c72b8c8e4f1b"],
  "isGroup": false,
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-15T09:00:00.000Z"
}
```

**Errors**:
- `400` - userId required
- `401` - Unauthorized
- `500` - Server error

---

### Message Routes

#### Get Messages
```http
GET /api/messages/:conversationId
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Response** (200 OK):
```json
[
  {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "conversation": "60d5ec49f1b2c72b8c8e4f1c",
    "sender": {
      "_id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "text": "Hello there!",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "_id": "60d5ec49f1b2c72b8c8e4f1e",
    "conversation": "60d5ec49f1b2c72b8c8e4f1c",
    "sender": {
      "_id": "60d5ec49f1b2c72b8c8e4f1b",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "text": "Hi! How are you?",
    "createdAt": "2024-01-15T10:01:00.000Z",
    "updatedAt": "2024-01-15T10:01:00.000Z"
  }
]
```

**Errors**:
- `401` - Unauthorized
- `500` - Server error

---

#### Send Message
```http
POST /api/messages
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Request Body**:
```json
{
  "conversationId": "60d5ec49f1b2c72b8c8e4f1c",
  "text": "Hello there!"
}
```

**Response** (201 Created):
```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f1d",
  "conversation": "60d5ec49f1b2c72b8c8e4f1c",
  "sender": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john@example.com",
    "isOnline": true
  },
  "text": "Hello there!",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Note**: This endpoint also emits a `new_message` Socket.IO event to all participants

**Errors**:
- `400` - Missing required fields
- `401` - Unauthorized
- `500` - Server error

---

## Socket.IO Events

### Client → Server Events

#### setup
Connect user and mark as online
```javascript
socket.emit('setup', userId);
```

#### join_conversation
Join a conversation room
```javascript
socket.emit('join_conversation', conversationId);
```

#### typing
Notify others that user is typing
```javascript
socket.emit('typing', { conversationId, userId });
```

#### stop_typing
Notify others that user stopped typing
```javascript
socket.emit('stop_typing', { conversationId, userId });
```

---

### Server → Client Events

#### user_status_changed
Broadcast when user goes online/offline
```javascript
socket.on('user_status_changed', ({ userId, isOnline, lastSeen }) => {
  // Update user status in UI
});
```

#### new_message
Receive new message in conversation
```javascript
socket.on('new_message', (message) => {
  // Add message to UI
});
```

#### user_typing
Another user started typing
```javascript
socket.on('user_typing', ({ conversationId, userId }) => {
  // Show typing indicator
});
```

#### user_stop_typing
Another user stopped typing
```javascript
socket.on('user_stop_typing', ({ conversationId, userId }) => {
  // Hide typing indicator
});
```

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - OK (Request successful)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Invalid input data)
- `401` - Unauthorized (Invalid or missing authentication)
- `404` - Not Found (Resource doesn't exist)
- `500` - Internal Server Error (Server-side error)

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding it for production deployment.

---

## CORS

CORS is enabled for all origins in development. Update in production:

```javascript
// chat-app-backend/src/server.js
const io = new Server(server, {
  cors: {
    origin: "https://your-production-domain.com",
    methods: ["GET", "POST"]
  }
});
```
