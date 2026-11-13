import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendOtpEmail = async (to: string, subject: string, body: string) => {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  if (resendApiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Chat App <onboarding@resend.dev>",
        to: [to],
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Resend rejected the email: ${response.status} ${await response.text()}`
      );
    }

    return;
  }

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim();

  if (!smtpUser || !smtpPassword) {
    throw new Error(
      "SMTP_USER and SMTP_PASSWORD are required when RESEND_API_KEY is empty"
    );
  }

  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = process.env.SMTP_SECURE === "true";
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || smtpUser,
    to,
    subject,
    text: body,
  });
};

export const startSendOtpConsumer = async () => {
  try {
    const connectionUrl = process.env.RABBITMQ_URL;

    if (!connectionUrl) {
      throw new Error("RABBITMQ_URL is not defined in environment variables");
    }

    const connection = await amqp.connect(connectionUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue("send-otp", { durable: true });

    console.log(
      `✅ Mail Service consumer started using ${
        process.env.RESEND_API_KEY?.trim() ? "Resend" : "SMTP"
      }`
    );

    channel.consume("send-otp", async (msg) => {
      if (msg) {
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());

          await sendOtpEmail(to, subject, body);

          console.log(`OTP mail sent to ${to}`);
          channel.ack(msg);
        } catch (error) {
          console.error("Failed to send OTP email", error);
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
    throw error;
  }
};
