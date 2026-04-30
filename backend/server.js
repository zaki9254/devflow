const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./src/config/db");
require("./src/config/redis");

const authRoutes = require("./src/routes/authRoutes");
const workspaceRoutes = require("./src/routes/workspaceRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const boardRoutes = require("./src/routes/boardRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const billingRoutes = require("./src/routes/billingRoutes");
const errorHandler = require("./src/middleware/errorHandler");

connectDB();

const app = express();
// Trust proxy — required for rate limiting on Render/Railway
app.set("trust proxy", 1);

// Raw body needed for Stripe webhook signature verification
app.use("/api/billing/webhook", express.raw({ type: "application/json" }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://devflow-frontend-five.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/billing", billingRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Global error handler — must be LAST
app.use(errorHandler);

// Socket.io setup
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://devflow-frontend-five.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
});

// Attach io to app so controllers can emit events
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join-board", (boardId) => {
    socket.join(`board:${boardId}`);
  });

  socket.on("leave-board", (boardId) => {
    socket.leave(`board:${boardId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
