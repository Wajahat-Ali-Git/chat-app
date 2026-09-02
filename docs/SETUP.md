# Setup Guide

Complete guide to set up and run the ChatWe application locally.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** - Local installation or cloud (MongoDB Atlas)
- **Git** - [Download](https://git-scm.com/)

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app
```

---

### 2. Backend Setup

#### Navigate to Backend Directory
```bash
cd chat-app-backend
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `chat-app-backend` directory:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/chatapp
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp

# JWT Secret (use a strong random string)
JWT_SECRET=your_very_secure_jwt_secret_key_here_change_this

# Node Environment
NODE_ENV=development
```

**Important Security Notes:**
- Never commit `.env` files to version control
- Use a strong, random JWT secret
- Change default credentials in production

#### Start Backend Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The backend will run on `http://localhost:5000`

---

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd ../chat-app-frontend
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment Variables (Optional)

Create a `.env.local` file in the `chat-app-frontend` directory if you need custom configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

**Note:** By default, the app is configured to connect to `http://localhost:5000`

#### Start Frontend Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

---

## Verify Installation

### 1. Check Backend Health
Open your browser and navigate to:
```
http://localhost:5000
```
You should see: `API Running`

### 2. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Test Registration
1. Click on "Sign Up"
2. Create a new account
3. Login with your credentials

### 4. Test Real-Time Features
1. Open the app in two different browsers (or use incognito mode)
2. Register/login as different users in each
3. Start a conversation
4. Test messaging and typing indicators

---

## MongoDB Setup

### Option 1: Local MongoDB

#### Install MongoDB
- **Windows**: [Download MongoDB](https://www.mongodb.com/try/download/community)
- **Mac**: `brew install mongodb-community`
- **Linux**: Follow [official guide](https://docs.mongodb.com/manual/administration/install-on-linux/)

#### Start MongoDB Service
```bash
# Mac/Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

#### Default Connection String
```
mongodb://localhost:27017/chatapp
```

---

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account**: Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Follow the free tier setup
3. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
4. **Update .env**: Paste the connection string in `MONGO_URI`

---

## Troubleshooting

### Backend Won't Start

**Problem**: `EADDRINUSE` error
```bash
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**: Port 5000 is already in use. Either:
1. Stop the process using port 5000
2. Change `PORT` in `.env` to a different port (e.g., 5001)

---

**Problem**: MongoDB connection error
```bash
MongooseError: connect ECONNREFUSED
```

**Solution**:
1. Ensure MongoDB is running
2. Check `MONGO_URI` in `.env`
3. For local: Verify MongoDB service is started
4. For Atlas: Check network access and database user credentials

---

### Frontend Won't Start

**Problem**: Module not found errors

**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Problem**: Can't connect to backend

**Solution**:
1. Verify backend is running on port 5000
2. Check for CORS errors in browser console
3. Ensure `http://localhost:3000` is allowed in backend CORS configuration

---

### Socket.IO Issues

**Problem**: Real-time features not working

**Solution**:
1. Check browser console for Socket.IO connection errors
2. Verify both frontend and backend are using same Socket.IO version
3. Ensure WebSocket connections aren't blocked by firewall
4. Check browser network tab for WebSocket upgrade requests

---

## Development Tips

### Hot Reload
Both servers support hot reload:
- **Backend**: Uses `nodemon` - automatically restarts on file changes
- **Frontend**: Next.js Fast Refresh - updates on save

### Debugging
- **Backend logs**: Check terminal running backend server
- **Frontend logs**: Check browser console (F12)
- **Database**: Use MongoDB Compass for visual database inspection

### Testing with Multiple Users
1. Use different browsers (Chrome, Firefox, Edge)
2. Use incognito/private windows
3. Use browser profiles
4. Test on different devices (phone, tablet)

---

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

---

## Next Steps

- Read [FEATURES.md](./FEATURES.md) to understand available features
- Check [API.md](./API.md) for detailed API documentation
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design

---

## Getting Help

- **Issues**: Open an issue on GitHub
- **Questions**: Check existing issues or discussions
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md)
