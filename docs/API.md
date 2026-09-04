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
    "unreadCount": 3,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

> `unreadCount` is computed server-side via a single aggregation query and attached to every conversation object. It reflects the number of messages the requesting user has not yet read.

**Errors**:
- `401` - Unauthorized
- `500` - Server error

---

#### Create or Get 1-to-1 Conversation
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

#### Create Group Conversation
```http
POST /api/conversations/group
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Request Body**:
```json
{
  "groupName": "Design Team",
  "participantIds": [
    "60d5ec49f1b2c72b8c8e4f1b",
    "60d5ec49f1b2c72b8c8e4f1c"
  ]
}
```

**Response** (201 Created):
```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f1d",
  "groupName": "Design Team",
  "participants": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1b",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  "isGroup": true,
  "createdBy": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-15T09:00:00.000Z"
}
```

**Errors**:
- `400` - groupName or participantIds required
- `401` - Unauthorized
- `500` - Server error

---

#### Invite User to Group
```http
POST /api/conversations/:id/invite
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Request Body**:
```json
{
  "userId": "60d5ec49f1b2c72b8c8e4f1e"
}
```

**Response** (201 Created):
```json
{
  "message": "Invite sent",
  "inviteMessage": {
    "_id": "60d5ec49f1b2c72b8c8e4f2a",
    "conversation": "60d5ec49f1b2c72b8c8e4f2b",
    "sender": {
      "_id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "text": "You have been invited to join \"Design Team\"",
    "type": "group_invite",
    "groupInvite": {
      "groupId": "60d5ec49f1b2c72b8c8e4f1d",
      "groupName": "Design Team",
      "invitedBy": {
        "_id": "60d5ec49f1b2c72b8c8e4f1a",
        "name": "John Doe"
      },
      "status": "pending"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "dmConversationId": "60d5ec49f1b2c72b8c8e4f2b"
}
```

> This endpoint **does NOT** directly add the user to the group. Instead, it finds (or creates) a 1‑on‑1 direct message conversation between the inviter and the invited user, inserts a `group_invite` message there, and emits a `new_message` socket event to both users. The invited user must respond via the invite card in the DM.

**Errors**:
- `400` - userId required, user already in group, not a group conversation, or a pending invite already exists
- `401` - Unauthorized
- `403` - You are not a member of this group
- `404` - Group not found
- `500` - Server error

---

#### Leave Group
```http
POST /api/conversations/:id/leave
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Response** (200 OK):
```json
{
  "message": "Successfully left the group",
  "conversation": {
    "_id": "60d5ec49f1b2c72b8c8e4f1d",
    "groupName": "Design Team",
    "participants": ["60d5ec49f1b2c72b8c8e4f1b"],
    "isGroup": true,
    "createdBy": "60d5ec49f1b2c72b8c8e4f1b"
  }
}
```

**Note**: If the creator leaves, ownership is automatically transferred to the first remaining participant. If no participants remain, the group is deleted.

**Errors**:
- `400` - Not a group conversation or not a member
- `401` - Unauthorized
- `404` - Conversation not found
- `500` - Server error

---

### Message Routes

#### Get Messages
```http
GET /api/messages/:conversationId
```

**Headers**: `Authorization: Bearer <token>` (Required)

> This endpoint also marks all messages in the conversation as read for the requesting user and emits a `messages_read` Socket.IO event to the conversation room.

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

**Note**: This endpoint also emits a `new_message` Socket.IO event to all participants in the conversation room, **and** directly to each participant's personal `userId` room so they receive the notification even when a different conversation is open.

**Errors**:
- `400` - Missing required fields
- `401` - Unauthorized
- `500` - Server error

---

#### Get Unread Count
```http
GET /api/messages/:conversationId/unread
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Response** (200 OK):
```json
{
  "conversationId": "60d5ec49f1b2c72b8c8e4f1c",
  "unreadCount": 5
}
```

**Errors**:
- `401` - Unauthorized
- `500` - Server error

---

#### Respond to Group Invite
```http
POST /api/messages/:messageId/respond-invite
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Request Body**:
```json
{
  "response": "accepted"  // or "rejected"
}
```

**Response** (200 OK):
```json
{
  "message": "Joined the group!",
  "inviteMessage": {
    "_id": "60d5ec49f1b2c72b8c8e4f2a",
    "conversation": "60d5ec49f1b2c72b8c8e4f2b",
    "sender": {
      "_id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "John Doe"
    },
    "text": "You have been invited to join \"Design Team\"",
    "type": "group_invite",
    "groupInvite": {
      "groupId": "60d5ec49f1b2c72b8c8e4f1d",
      "groupName": "Design Team",
      "invitedBy": {
        "_id": "60d5ec49f1b2c72b8c8e4f1a",
        "name": "John Doe"
      },
      "status": "accepted"  // or "rejected"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:02:00.000Z"
  }
}
```

> This endpoint is called when the recipient of a group invite clicks **Accept** or **Decline** in the DM. On `"accepted"`, the user is automatically added to the group's participants. The updated `group_invite` message is emitted via `invite_response` socket event so both sides see the response live.

**Errors**:
- `400` - invalid response, message is not a group invite, or invite already responded to
- `401` - Unauthorized
- `403` - You cannot respond to this invite
- `404` - Message not found
- `500` - Server error

---

#### React to Message
```http
POST /api/messages/:messageId/react
```

**Headers**: `Authorization: Bearer <token>` (Required)

**Request Body**:
```json
{
  "emoji": "👍"
}
```

**Response** (200 OK):
```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f1d",
  "conversation": "60d5ec49f1b2c72b8c8e4f1c",
  "sender": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe"
  },
  "text": "Hello there!",
  "reactions": [
    { "emoji": "👍", "userId": "60d5ec49f1b2c72b8c8e4f1b" }
  ],
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:01:00.000Z"
}
```

> Toggle behaviour: clicking the same emoji again removes your reaction; clicking a different emoji replaces the old one. Each user can have at most one reaction per message. The updated message is emitted via `reaction_updated` socket event to the conversation room.

**Errors**:
- `400` - emoji required
- `401` - Unauthorized
- `404` - Message not found
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

#### messages_read
Emitted when a user opens a conversation and reads all messages. Allows other clients to clear their unread badge for that conversation.
```javascript
socket.on('messages_read', ({ conversationId, userId }) => {
  // Clear unread badge for this conversation
});
```

#### invite_response
Emitted when a group invite is accepted or declined.
```javascript
socket.on('invite_response', (updatedMessage) => {
  // Update the invite card to show accepted/declined status
});
```

#### reaction_updated
Emitted when a reaction is added/removed on a message.
```javascript
socket.on('reaction_updated', (updatedMessage) => {
  // Update the message's reaction chips in the UI
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
