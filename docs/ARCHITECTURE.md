# Architecture Overview

High-level architecture and design decisions for the ChatWe application.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js Frontend (Port 3000)                  │  │
│  │  - React Components                                   │  │
│  │  - TypeScript                                         │  │
│  │  - Tailwind CSS                                       │  │
│  │  - Socket.IO Client                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                    HTTP + WebSocket
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Express.js Backend (Port 5000)                  │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  REST API Routes                              │    │  │
│  │  │  - Auth, Users, Conversations, Messages       │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  Socket.IO Server                             │    │  │
│  │  │  - Real-time events                           │    │  │
│  │  │  - Presence tracking                          │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  Middleware                                   │    │  │
│  │  │  - JWT Authentication                         │    │  │
│  │  │  - CORS                                       │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                        Mongoose ODM
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MongoDB Database                         │  │
│  │  - Users Collection                                   │  │
│  │  - Conversations Collection                           │  │
│  │  - Messages Collection                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Communication Flow

### 1. HTTP Request Flow (REST API)
```
Client → Axios Request → Express Route → Controller
  ↓
Middleware (Auth) → Database Query → Response
  ↓
Client Updates State
```

### 2. WebSocket Flow (Real-Time)
```
Client A → Socket.emit → Server → Socket.to(room).emit → Client B
```

### 3. Authentication Flow
```
User Signup/Login → Hash Password → Generate JWT
  ↓
Store Token (localStorage) → Include in Headers
  ↓
Middleware Validates Token → Allow/Deny Access
```

---

## Component Architecture

### Frontend (Next.js)

```
app/
├── layout.tsx                 # Root layout (global providers)
├── page.tsx                   # Landing page
├── home/page.tsx              # Main chat interface
│   ├── Conversation List      # Shows all conversations
│   ├── Chat Window            # Active conversation messages
│   └── Message Input          # Send new messages
├── contacts/page.tsx          # User directory
│   └── Contact Cards          # Individual contact components
├── login/page.tsx             # Authentication
└── signup/page.tsx            # User registration

src/components/
└── Header.tsx                 # Shared navigation component
```

### Backend (Express.js)

```
src/
├── server.js                  # Entry point + Socket.IO setup
├── routes/                    # API route definitions
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── conversationsRoutes.js
│   └── messageRoutes.js
├── controllers/               # Business logic
│   ├── authControllers.js
│   ├── userController.js
│   ├── conversationController.js
│   └── messageController.js
├── middleware/                # Request interceptors
│   └── authMiddleware.js
├── models/                    # Database schemas
│   ├── user.js
│   ├── conversation.js
│   └── Message.js
└── config/                    # Configuration
    └── db.js
```

---

## Data Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  isOnline: Boolean,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- User → Many Conversations (as participant)
- User → Many Messages (as sender)

---

### Conversation Schema
```javascript
{
  participants: [ObjectId → User],
  lastMessage: ObjectId → Message,
  isGroup: Boolean,
  groupName: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- Conversation → Many Users (participants)
- Conversation → One Message (lastMessage)
- Conversation → Many Messages

---

### Message Schema
```javascript
{
  conversation: ObjectId → Conversation,
  sender: ObjectId → User,
  text: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Relationships:**
- Message → One Conversation
- Message → One User (sender)

---

## State Management

### Frontend State (React Hooks)

**Global State:**
- User authentication (localStorage)
- Socket.IO connection

**Component State:**
```typescript
// Home Component
- conversations: Conversation[]
- messages: Message[]
- conversationId: string | null
- text: string
- typingUsers: Set<string>
- isTyping: boolean
- socket: Socket
```

**State Updates:**
- REST API responses
- Socket.IO events
- User interactions

---

## Real-Time Events

### Socket.IO Event Flow

#### User Setup
```
Client connects → emit('setup', userId)
  ↓
Server marks user online
  ↓
Broadcast 'user_status_changed' to all clients
```

#### Sending Messages
```
User types message → HTTP POST /api/messages
  ↓
Server saves to database
  ↓
Server emits 'new_message' to conversation room
  ↓
All participants receive message instantly
```

#### Typing Indicators
```
User types → emit('typing', { conversationId, userId })
  ↓
Server forwards to conversation room
  ↓
Other participants see typing indicator
  ↓
3 seconds timeout → emit('stop_typing')
```

#### User Disconnect
```
Client disconnects → Socket disconnect event
  ↓
Server marks user offline + updates lastSeen
  ↓
Broadcast 'user_status_changed' to all clients
```

---

## Security Measures

### Authentication
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens signed with secret key
- Tokens stored in localStorage (consider httpOnly cookies for production)

### Authorization
- Protected routes check JWT validity
- User can only access their own conversations
- Middleware validates token on every protected request

### Data Validation
- Required fields enforced by Mongoose schemas
- Email uniqueness enforced at database level
- Input sanitization (should add for production)

### CORS
- Configured for cross-origin requests
- Should be restricted to specific origins in production

---

## Performance Considerations

### Frontend Optimizations
- Next.js automatic code splitting
- React component memoization where needed
- Lazy loading for images/assets
- Debounced search inputs
- Virtual scrolling for long message lists (future)

### Backend Optimizations
- Database indexes on frequently queried fields
- Population of references only when needed
- Socket.IO rooms for efficient message delivery
- Connection pooling for MongoDB

### Database Optimization
```javascript
// Indexes that should be added:
User: { email: 1 }  // Unique index
Conversation: { participants: 1 }
Message: { conversation: 1, createdAt: 1 }
```

---

## Scalability Considerations

### Current Limitations
- Single server instance
- In-memory Socket.IO (no Redis adapter)
- No message pagination
- No caching layer

### Future Improvements
1. **Horizontal Scaling**
   - Add Redis adapter for Socket.IO
   - Load balancer for multiple backend instances
   - Session store for distributed auth

2. **Database Scaling**
   - Read replicas for MongoDB
   - Sharding for large datasets
   - Separate analytics database

3. **Caching**
   - Redis for conversation lists
   - CDN for static assets
   - Browser caching strategies

4. **Message Handling**
   - Pagination for message history
   - Message archiving after 30 days
   - Lazy loading conversations

---

## Error Handling

### Frontend
```typescript
try {
  await axios.post(url, data);
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error message
}
```

### Backend
```javascript
try {
  // Business logic
} catch (error) {
  res.status(500).json({ message: error.message });
}
```

**Improvements Needed:**
- Custom error classes
- Global error handler
- Error logging service
- User-friendly error messages

---

## Testing Strategy (Future)

### Unit Tests
- Controller logic
- Utility functions
- React components

### Integration Tests
- API endpoints
- Database operations
- Socket.IO events

### E2E Tests
- User flows (signup, login, chat)
- Real-time features
- Cross-browser testing

---

## Deployment Architecture (Future)

```
┌─────────────────────────────────────┐
│         CDN (Static Assets)         │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Vercel (Next.js Frontend)      │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│       Heroku/AWS (Backend API)      │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      MongoDB Atlas (Database)       │
└─────────────────────────────────────┘
```

---

## Technology Choices

### Why Next.js?
- Server-side rendering for SEO
- File-based routing
- Built-in optimization
- Great developer experience

### Why Express.js?
- Lightweight and flexible
- Large ecosystem
- Easy Socket.IO integration
- Simple REST API creation

### Why MongoDB?
- Flexible schema for chat data
- Good performance for read-heavy workloads
- Easy to scale horizontally
- Rich query capabilities

### Why Socket.IO?
- Automatic fallback mechanisms
- Built-in room support
- Easy event-based communication
- Battle-tested for real-time apps

---

## Future Architecture Improvements

1. **Microservices** - Split into auth, messaging, and presence services
2. **Message Queue** - RabbitMQ/Kafka for async operations
3. **API Gateway** - Centralized routing and rate limiting
4. **Service Discovery** - For dynamic service registration
5. **Monitoring** - Prometheus, Grafana for metrics
6. **Logging** - ELK stack for centralized logging
7. **CI/CD** - Automated testing and deployment
8. **Infrastructure as Code** - Terraform/CloudFormation

---

## Design Patterns Used

- **MVC Pattern** - Separation of routes, controllers, and models
- **Repository Pattern** - Database access through models
- **Middleware Pattern** - Request/response interceptors
- **Observer Pattern** - Socket.IO event-driven architecture
- **Singleton Pattern** - Database connection
- **Factory Pattern** - JWT token generation

---

## API Design Principles

- RESTful endpoints
- Consistent naming conventions
- HTTP status codes
- JSON responses
- Versioning ready (future: /api/v1/)
- HATEOAS ready (future: include links in responses)
