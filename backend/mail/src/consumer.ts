import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const startSendOtpConsumer = async () => {
  try {
    const connectionUrl = process.env.RABBITMQ_URL;

    if (!connectionUrl) {
      throw new Error("RABBITMQ_URL is not defined in environment variables");
    }

    const connection = await amqp.connect(connectionUrl);

    const channel = await connection.createChannel();

    await channel.assertQueue("send-otp", { durable: true });

    console.log("✅ Mail Service consumer started, listening for otp emails");

    channel.consume("send-otp", async (msg) => {
      if (msg) {
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          });

          await transporter.sendMail({
            from: "Chat app",
            to,
            subject,
            text: body,
          });

          console.log(`OTP mail sent to ${to}`);
          channel.ack(msg);
        } catch (error) {
          console.log("Failed to send otp", error);
        }
      }
    });
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
    throw error;
  }
};
