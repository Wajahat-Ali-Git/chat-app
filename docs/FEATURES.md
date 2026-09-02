# Features Documentation

## Core Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Password hashing with bcrypt
- Protected routes and middleware
- Session management

### 💬 Real-Time Messaging
- Instant message delivery via Socket.IO
- Message history persistence
- Conversation threading
- Message timestamps

### 👥 User Management
- User registration and login
- Profile management
- Online/offline status tracking
- Last seen timestamps

### 🔄 Real-Time Features

#### User Presence Tracking
- **Online Status**: Live updates when users go online/offline
- **Last Active Time**: Displays when offline users were last active
  - Less than 1 minute: "Just now"
  - Less than 60 minutes: "Xm ago"
  - Less than 24 hours: "Xh ago"
  - Less than 7 days: "Xd ago"
  - More than 7 days: Shows actual date

#### Typing Indicators
Real-time typing indicators shown in two locations:

**1. Chat Header (Active Conversation)**
- Animated green dots with "typing..." text
- Appears below the contact's name
- Replaces online/offline status while typing

**2. Messages Area**
- Animated typing bubble at the bottom
- Three bouncing dots with "typing..." label
- Styled like a received message
- Auto-hides after 3 seconds of inactivity

**Smart Features:**
- Automatically stops after 3 seconds of no typing
- Stops immediately when message is sent
- Real-time updates across all clients
- No duplicate messages

### 🎨 User Interface
- Modern gradient-based design
- Dark theme with slate color palette
- Responsive layout for all devices
- Custom scrollbars
- Smooth animations and transitions
- Avatar system with user initials
- Loading and empty states

### 🔍 Search & Discovery
- Contact search by name or email
- Conversation filtering
- Real-time search results

---

## Technical Implementation

### Socket.IO Events

#### User Status Events
- `setup` - User connects and goes online
- `disconnect` - User disconnects and goes offline
- `user_status_changed` - Broadcast status updates to all clients

#### Messaging Events
- `join_conversation` - User joins a conversation room
- `new_message` - New message sent in conversation

#### Typing Events
- `typing` - User starts typing
- `stop_typing` - User stops typing
- `user_typing` - Broadcast typing status to conversation
- `user_stop_typing` - Broadcast stop typing to conversation

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (with search)
- `GET /api/users/:id` - Get user by ID

### Conversations
- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create or get conversation

### Messages
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Send new message

---

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  isOnline: Boolean (default: false),
  lastSeen: Date (default: Date.now),
  timestamps: true
}
```

### Conversation Model
```javascript
{
  participants: [ObjectId] (ref: User),
  lastMessage: ObjectId (ref: Message),
  isGroup: Boolean (default: false),
  groupName: String (optional),
  timestamps: true
}
```

### Message Model
```javascript
{
  conversation: ObjectId (ref: Conversation),
  sender: ObjectId (ref: User),
  text: String (required),
  timestamps: true
}
```

---

## Future Enhancements

### Planned Features
- [ ] File and image sharing
- [ ] Group chat functionality
- [ ] Message editing and deletion
- [ ] Message reactions (emoji)
- [ ] Voice messages
- [ ] Video calling
- [ ] Read receipts
- [ ] Message search within conversations
- [ ] Push notifications
- [ ] User blocking
- [ ] Message encryption

### UI Improvements
- [ ] Custom themes
- [ ] Light mode
- [ ] Custom emoji picker
- [ ] GIF support
- [ ] Message formatting (bold, italic, code)
- [ ] Link previews

### Performance
- [ ] Message pagination
- [ ] Lazy loading conversations
- [ ] Image optimization
- [ ] Caching strategies
