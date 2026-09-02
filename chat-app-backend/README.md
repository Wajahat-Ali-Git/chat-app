# Chat App - Backend

Express.js backend server with Socket.IO for real-time messaging.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt.js for password hashing

---

## Project Structure

```
chat-app-backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── authControllers.js    # Authentication logic
│   │   ├── conversationController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/
│   │   ├── conversation.js       # Conversation schema
│   │   ├── Message.js            # Message schema
│   │   └── user.js               # User schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── conversationsRoutes.js
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   └── server.js                 # Main server file
├── .env                          # Environment variables
├── package.json
└── README.md
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 3. Start Server

Development mode (auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (not configured yet)
- `npm run migrate:up` - Run database migrations
- `npm run migrate:down` - Rollback migrations
- `npm run migrate:create` - Create new migration

---

## API Endpoints

### Health Check
```
GET / → "API Running"
```

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)

### Conversations
- `GET /api/conversations` - Get user conversations (protected)
- `POST /api/conversations` - Create conversation (protected)

### Messages
- `GET /api/messages/:conversationId` - Get messages (protected)
- `POST /api/messages` - Send message (protected)

---

## Socket.IO Events

### Client Events (Emitted by client)
- `setup` - User authentication and online status
- `join_conversation` - Join conversation room
- `typing` - User started typing
- `stop_typing` - User stopped typing
- `disconnect` - User disconnected

### Server Events (Emitted to clients)
- `user_status_changed` - User online/offline status
- `new_message` - New message in conversation
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing

---

## Database Models

### User
- name, email, password (hashed)
- isOnline, lastSeen
- Timestamps

### Conversation
- participants (array of user IDs)
- lastMessage reference
- isGroup, groupName
- Timestamps

### Message
- conversation reference
- sender reference
- text content
- Timestamps

---

## Authentication

Protected routes require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

Token is returned on login/register and should be stored client-side.

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/chatapp` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secure_secret` |
| `NODE_ENV` | Environment mode | `development` or `production` |

---

## Development

### Adding New Routes

1. Create controller in `src/controllers/`
2. Create route file in `src/routes/`
3. Add route to `src/server.js`

Example:
```javascript
// In server.js
app.use("/api/your-route", require("./routes/yourRoutes"));
```

### Database Migrations

```bash
# Create migration
npm run migrate:create your-migration-name

# Run migrations
npm run migrate:up

# Rollback
npm run migrate:down
```

---

## Security Considerations

- Passwords are hashed with bcrypt before storage
- JWT tokens expire (configure expiration as needed)
- CORS is configured for frontend origin
- Input validation should be added for production
- Add rate limiting for production
- Use HTTPS in production

---

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify database user permissions

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process using port 5000

### JWT Verification Failed
- Check if `JWT_SECRET` matches between environments
- Verify token is being sent in Authorization header

---

## Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `socket.io` - Real-time communication
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - CORS middleware
- `dotenv` - Environment variables

### Development
- `nodemon` - Auto-restart server on changes

---

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## License

MIT License - See LICENSE file for details
