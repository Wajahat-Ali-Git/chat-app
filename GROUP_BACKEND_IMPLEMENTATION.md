# Group Chat Backend Implementation

This document details the backend API implementation for group chat functionality.

## Overview

Implemented three new API endpoints to support group chat operations:
1. Create group conversations
2. Invite members to groups
3. Leave groups

---

## Database Changes

### Conversation Model
Added `createdBy` field to track group creator:

```javascript
createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
}
```

**Full Schema:**
- `participants`: Array of User IDs
- `lastMessage`: Reference to last Message
- `isGroup`: Boolean flag
- `groupName`: String (for group conversations)
- `createdBy`: User ID of group creator (new field)
- `timestamps`: Auto-generated createdAt/updatedAt

---

## API Endpoints

### 1. Create Group

**Endpoint:** `POST /api/conversations/group`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "groupName": "Design Team",
  "participantIds": [
    "60d5ec49f1b2c72b8c8e4f1b",
    "60d5ec49f1b2c72b8c8e4f1c"
  ]
}
```

**Response (201):**
```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f1d",
  "groupName": "Design Team",
  "participants": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "John Doe",
      "email": "john@example.com"
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

**Features:**
- Automatically includes creator in participants
- Removes duplicate participant IDs
- Populates participant and creator details in response
- Validates required fields (groupName, participantIds)

**Error Responses:**
- `400` - Missing groupName or participantIds
- `401` - Unauthorized (invalid/missing token)
- `500` - Server error

---

### 2. Invite Member to Group

**Endpoint:** `POST /api/conversations/:id/invite`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "userId": "60d5ec49f1b2c72b8c8e4f1e"
}
```

**Response (200):**
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
      "_id": "60d5ec49f1b2c72b8c8e4f1e",
      "name": "New User",
      "email": "newuser@example.com"
    }
  ],
  "isGroup": true,
  "createdBy": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "lastMessage": null,
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-15T09:00:00.000Z"
}
```

**Features:**
- Validates user is a group member (only members can invite)
- Checks if conversation is a group
- Prevents duplicate invites
- Returns fully populated conversation

**Error Responses:**
- `400` - Missing userId, user already in group, or not a group conversation
- `401` - Unauthorized
- `403` - Requester is not a member of the group
- `404` - Conversation not found
- `500` - Server error

---

### 3. Leave Group

**Endpoint:** `POST /api/conversations/:id/leave`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
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

**Features:**
- Removes user from participants array
- Transfers ownership if creator leaves (to first remaining participant)
- Auto-deletes group if last member leaves
- Validates user is a member

**Special Behaviors:**

**If creator leaves:**
```json
{
  "message": "Successfully left the group",
  "conversation": {
    "createdBy": "60d5ec49f1b2c72b8c8e4f1b"  // Transferred to first remaining participant
  }
}
```

**If last member leaves:**
```json
{
  "message": "Group deleted as no members remain"
}
```

**Error Responses:**
- `400` - Not a group conversation or not a member
- `401` - Unauthorized
- `404` - Conversation not found
- `500` - Server error

---

## Implementation Details

### Controller Functions

**File:** `chat-app-backend/src/controllers/conversationController.js`

Three new exported functions:
- `createGroup` - Handles group creation
- `inviteMember` - Handles adding members
- `leaveGroup` - Handles member removal and cleanup

### Routes

**File:** `chat-app-backend/src/routes/conversationsRoutes.js`

Added three new routes:
```javascript
router.post("/group", protect, createGroup);
router.post("/:id/invite", protect, inviteMember);
router.post("/:id/leave", protect, leaveGroup);
```

All routes are protected by JWT authentication middleware.

---

## Testing the APIs

### 1. Create a Group
```bash
curl -X POST http://localhost:5000/api/conversations/group \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupName": "Test Group",
    "participantIds": ["USER_ID_1", "USER_ID_2"]
  }'
```

### 2. Invite Member
```bash
curl -X POST http://localhost:5000/api/conversations/GROUP_ID/invite \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "NEW_USER_ID"
  }'
```

### 3. Leave Group
```bash
curl -X POST http://localhost:5000/api/conversations/GROUP_ID/leave \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Frontend Integration

The frontend groups page (`app/groups/page.tsx`) can now use these endpoints:

**Create Group:**
```typescript
const response = await axios.post(
  'http://localhost:5000/api/conversations/group',
  { groupName, participantIds },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

**Invite Member:**
```typescript
const response = await axios.post(
  `http://localhost:5000/api/conversations/${groupId}/invite`,
  { userId },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

**Leave Group:**
```typescript
const response = await axios.post(
  `http://localhost:5000/api/conversations/${groupId}/leave`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
);
```

---

## Security Considerations

✅ **Implemented:**
- JWT authentication required for all endpoints
- Membership verification (only members can invite)
- Prevents duplicate invites
- Group validation (ensures conversation is a group)

⚠️ **Future Enhancements:**
- Role-based permissions (admin/member)
- Invite approval system
- Maximum group size limit
- Audit log for group actions

---

## Next Steps

**Recommended enhancements:**
1. Add Socket.IO events for real-time group updates
2. Implement role-based permissions (admin, member)
3. Add group settings (avatar, description, privacy)
4. Create group activity/audit log
5. Add member kick/ban functionality (admin only)
6. Implement group message notifications

---

## Files Modified

1. `chat-app-backend/src/models/conversation.js` - Added `createdBy` field
2. `chat-app-backend/src/controllers/conversationController.js` - Added 3 new functions
3. `chat-app-backend/src/routes/conversationsRoutes.js` - Added 3 new routes
4. `docs/API.md` - Updated API documentation
5. `CONTRIBUTING.md` - Marked group chat as completed

---

## Status

✅ **Completed** - All three group endpoints are implemented and ready for use.

The frontend can now fully integrate with these APIs to provide complete group chat functionality.
