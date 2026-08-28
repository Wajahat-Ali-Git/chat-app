# 💬 ChatWe - Real-Time Chat Application

A modern, full-stack real-time chat application built with Next.js and Node.js, featuring a sleek UI with gradient themes and instant messaging capabilities.

![Chat Application](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based user authentication and authorization
- 💬 **Real-Time Messaging** - Instant messaging with Socket.IO integration
- 👥 **Contact Management** - Search and connect with users in your network
- 🗂️ **Conversation Management** - Organize and track multiple conversations
- 🎨 **Modern UI/UX** - Beautiful gradient designs with Tailwind CSS
- 📱 **Responsive Design** - Fully responsive across all devices
- 🌙 **Dark Theme** - Elegant dark mode interface
- 🔍 **Search Functionality** - Find contacts quickly by name or email
- 📊 **User Profiles** - View and manage user information

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.2 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
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

## 📁 Project Structure

```
chat-app/
├── chat-app-frontend/          # Next.js frontend application
│   ├── app/
│   │   ├── components/         # Reusable React components
│   │   ├── contacts/          # Contacts page
│   │   ├── home/              # Main chat interface
│   │   ├── login/             # Login page
│   │   ├── signup/            # Registration page
│   │   └── profile/           # User profile page
│   ├── src/
│   │   ├── components/        # Shared components (Header)
│   │   └── logo/              # Application logo assets
│   └── public/                # Static assets
│
└── chat-app-backend/           # Express.js backend API
    └── src/
        ├── config/            # Database configuration
        ├── controllers/       # Business logic handlers
        ├── middleware/        # Authentication middleware
        ├── models/           # Mongoose schemas
        ├── routes/           # API route definitions
        └── server.js         # Application entry point
```

## 🚀 Getting Started

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

   Create a `.env` file in the `chat-app-backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Setup Frontend**
   ```bash
   cd ../chat-app-frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd chat-app-backend
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd chat-app-frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

3. **Access the Application**
   
   Open your browser and navigate to `http://localhost:3000`

## 📡 API Endpoints

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

## 🎨 UI Features

- **Gradient Color Schemes** - Beautiful gradient combinations throughout the UI
- **Avatar System** - Dynamic gradient avatars with user initials
- **Custom Scrollbars** - Styled scrollbars for better aesthetics
- **Hover Effects** - Smooth transitions and interactive elements
- **Loading States** - User-friendly loading indicators
- **Empty States** - Informative empty state messages
- **Responsive Grid Layout** - Adapts to different screen sizes

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- CORS configuration
- Secure HTTP headers

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices
- 📱 Tablets
- 💻 Desktop screens
- 🖥️ Large displays

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

Your Name - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- React Icons for the icon library
- Tailwind CSS for the utility-first CSS framework
- Socket.IO for real-time communication capabilities

## 📸 Screenshots

### Home Dashboard
The main chat interface with conversation list and active chat window.

### Contacts Directory
Browse and search through your network contacts.

### Authentication
Secure login and registration pages.

---

⭐ If you found this project helpful, please consider giving it a star!

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature suggestion? Please open an issue on GitHub.

## 📞 Support

For support, email your-email@example.com or join our Slack channel.

---

**Built with ❤️ using Next.js and Node.js**
