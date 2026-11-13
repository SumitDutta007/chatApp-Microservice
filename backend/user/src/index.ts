import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

const app = express();

app.use(express.json());

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

app.use("/api/v1", userRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "user" });
});

const port = Number(process.env.PORT || 5000);

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not defined in environment variables");
  }

  await connectDb();
  await redisClient.connect();
  console.log("Connected to Redis");
  await connectRabbitMQ();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("User service startup failed", error);
  process.exit(1);
});
