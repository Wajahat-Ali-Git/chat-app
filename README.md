# 💬 ChatWe - Real-Time Chat Application

A modern, full-stack real-time chat application built with Next.js and Node.js, featuring a sleek UI with gradient themes, instant messaging, typing indicators, and live presence tracking.

![Chat Application](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)

---

## ✨ Features

### Core Functionality
- 🔐 **Secure Authentication** - JWT-based user authentication and authorization
- 💬 **Real-Time Messaging** - Instant messaging with Socket.IO integration
- 👥 **Contact Management** - Search and connect with users in your network
- 🗂️ **Conversation Management** - Organize and track multiple conversations
- 🎨 **Modern UI/UX** - Beautiful gradient designs with Tailwind CSS
- 📱 **Responsive Design** - Fully responsive across all devices
- 🌙 **Dark Theme** - Elegant dark mode interface

### Real-Time Features
- ⚡ **Live Presence Tracking** - See who's online with green indicators
- ⏰ **Last Active Time** - Smart time formatting (5m ago, 2h ago, 3d ago)
- ✍️ **Typing Indicators** - See when someone is typing in real-time
  - Shown in chat header with animated green dots
  - Typing bubble in message area
  - Auto-hides after 3 seconds of inactivity
- � **Instant Status Updates** - Real-time online/offline notifications

### User Experience
- �🔍 **Search Functionality** - Find contacts quickly by name or email
- 📊 **User Profiles** - View and manage user information
- 🎭 **Avatar System** - Dynamic gradient avatars with user initials
- ⚡ **Smart Features** - Auto-scroll, keyboard shortcuts, smooth animations

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.2 (React 19, App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **HTTP Client:** Axios
- **Icons:** React Icons
- **Real-time:** Socket.IO Client

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt.js
- **Real-time:** Socket.IO
- **CORS:** Enabled for cross-origin requests

---

## 📁 Project Structure

```
chat-app/
├── docs/                           # Documentation files
│   ├── API.md                     # Complete API reference
│   ├── FEATURES.md                # Detailed features documentation
│   └── SETUP.md                   # Setup and installation guide
│
├── chat-app-frontend/              # Next.js frontend application
│   ├── app/
│   │   ├── components/            # Reusable React components
│   │   ├── contacts/              # Contacts page
│   │   ├── home/                  # Main chat interface
│   │   ├── login/                 # Login page
│   │   ├── signup/                # Registration page
│   │   └── profile/               # User profile page
│   ├── src/
│   │   ├── components/            # Shared components (Header)
│   │   └── logo/                  # Application logo assets
│   ├── public/                    # Static assets
│   └── README.md                  # Frontend documentation
│
└── chat-app-backend/               # Express.js backend API
    ├── src/
    │   ├── config/                # Database configuration
    │   ├── controllers/           # Business logic handlers
    │   ├── middleware/            # Authentication middleware
    │   ├── models/                # Mongoose schemas
    │   ├── routes/                # API route definitions
    │   └── server.js              # Application entry point
    └── README.md                  # Backend documentation
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chat-app.git
   cd chat-app
   ```

2. **Setup Backend**
   ```bash
   cd chat-app-backend
   npm install
   ```

   Create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Setup Frontend**
   ```bash
   cd ../chat-app-frontend
   npm install
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd chat-app-backend
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

2. **Start Frontend Development Server**
   ```bash
   cd chat-app-frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

3. **Access the Application**
   
   Open your browser and navigate to `http://localhost:3000`

---

## � Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Features](docs/FEATURES.md)** - Feature details and implementation
- **[Frontend README](chat-app-frontend/README.md)** - Frontend-specific docs
- **[Backend README](chat-app-backend/README.md)** - Backend-specific docs

---

## �📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (with search query support)
- `GET /api/users/:id` - Get user by ID

### Conversations
- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create or get conversation with another user

### Messages
- `GET /api/messages/:conversationId` - Get messages for a conversation
- `POST /api/messages` - Send a new message

---

## 🎨 UI Features

- **Gradient Color Schemes** - Beautiful gradient combinations throughout the UI
- **Avatar System** - Dynamic gradient avatars with user initials
- **Custom Scrollbars** - Styled scrollbars for better aesthetics
- **Hover Effects** - Smooth transitions and interactive elements
- **Loading States** - User-friendly loading indicators
- **Empty States** - Informative empty state messages
- **Responsive Grid Layout** - Adapts to different screen sizes
- **Typing Animations** - Bouncing dots for typing indicators

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- CORS configuration
- Secure HTTP headers
- Input validation

---

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop screens (1024px+)
- 🖥️ Large displays (1440px+)

---

## � Testing the Features

### Test Real-Time Messaging
1. Open the app in two different browsers
2. Register/login as different users in each
3. Start a conversation
4. Send messages and see them appear instantly

### Test Typing Indicators
1. Type in one browser
2. See "typing..." indicator in the other
3. Stop typing - indicator disappears after 3 seconds

### Test Presence Tracking
1. Close one browser tab
2. See "last seen" time in the other browser
3. Reopen - see "Online" status immediately

---

## �🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

Your Name - [@yourusername](https://github.com/yourusername)

Project Link: [https://github.com/yourusername/chat-app](https://github.com/yourusername/chat-app)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- React Icons for the icon library
- Tailwind CSS for the utility-first CSS framework
- Socket.IO for real-time communication capabilities
- MongoDB for the database solution

---

## 📸 Screenshots

### Home Dashboard
The main chat interface with conversation list and active chat window featuring real-time typing indicators.

### Contacts Directory
Browse and search through your network contacts with live online status indicators.

### Authentication
Secure login and registration pages with modern gradient design.

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Ensure MongoDB is running
- Check `.env` file configuration
- Verify port 5000 is not in use

**Frontend can't connect:**
- Verify backend is running on port 5000
- Check CORS settings in backend
- Inspect browser console for errors

**Real-time features not working:**
- Check Socket.IO connection in browser console
- Verify WebSocket connections aren't blocked
- Ensure both servers are running

For detailed troubleshooting, see [SETUP.md](docs/SETUP.md)

---

## 🔮 Future Enhancements

- File and image sharing
- Group chat functionality
- Message editing and deletion
- Voice and video calling
- Message reactions
- Push notifications
- Read receipts
- Message encryption

See [FEATURES.md](docs/FEATURES.md) for the complete roadmap.

---

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

**Built with ❤️ using Next.js and Node.js**

⭐ If you found this project helpful, please consider giving it a star!
