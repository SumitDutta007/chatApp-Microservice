import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import chatRoutes from "./routes/chat.js";
import cors from "cors";
import { app, server } from "./config/socket.js";

dotenv.config();

connectDb();

app.use(express.json());

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

app.use("/api/v1", chatRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "chat" });
});

const port = Number(process.env.PORT || 5002);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
