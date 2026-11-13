import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendOtpEmail = async (to: string, subject: string, body: string) => {
  const brevoApiKey = process.env.BREVO_API_KEY?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  if (brevoApiKey) {
    const senderEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM;

    if (!senderEmail) {
      throw new Error("EMAIL_FROM or SMTP_FROM is required for Brevo");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail },
        to: [{ email: to }],
        subject,
        textContent: body,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Brevo rejected the email: ${response.status} ${await response.text()}`
      );
    }

    return;
  }

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
        process.env.BREVO_API_KEY?.trim()
          ? "Brevo API"
          : process.env.RESEND_API_KEY?.trim()
            ? "Resend"
            : "SMTP"
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
