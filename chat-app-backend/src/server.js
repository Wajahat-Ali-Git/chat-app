const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./config/db");

connectDB();

const app = express();
const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/user");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
  },
});

app.set("io", io);

const userSocketMap = new Map(); // Map<userId, socketId>

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setup", async (userId) => {
    if (userId) {
      userSocketMap.set(userId, socket.id);
      socket.userId = userId;
      
      // Update database
      await User.findByIdAndUpdate(userId, { isOnline: true });
      
      // Broadcast status change
      io.emit("user_status_changed", { userId, isOnline: true });
      console.log(`User ${userId} is now online`);
    }
  });

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Typing indicator
  socket.on("typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("user_typing", { conversationId, userId });
  });

  // Stop typing indicator
  socket.on("stop_typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("user_stop_typing", { conversationId, userId });
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    if (socket.userId) {
      userSocketMap.delete(socket.userId);
      const lastSeen = new Date();
      
      // Update database
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false, 
        lastSeen 
      });
      
      // Broadcast status change
      io.emit("user_status_changed", { 
        userId: socket.userId, 
        isOnline: false, 
        lastSeen 
      });
      console.log(`User ${socket.userId} is now offline`);
    }
  });
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/conversations", require("./routes/conversationsRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
