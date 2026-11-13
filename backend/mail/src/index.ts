import express from "express";
import dotenv from "dotenv";
import { startSendOtpConsumer } from "./consumer.js";

dotenv.config();

const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "mail" });
});

const port = Number(process.env.PORT || 5001);

const startServer = async () => {
  await startSendOtpConsumer();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error(
    "Mail service startup failed. Start RabbitMQ locally or set RABBITMQ_URL to a reachable broker.",
    error
  );
  process.exit(1);
});
