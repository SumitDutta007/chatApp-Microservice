import amql from "amqplib";

let channel: amql.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connectionUrl = process.env.RABBITMQ_URL;

    if (!connectionUrl) {
      throw new Error("RABBITMQ_URL is not defined in environment variables");
    }

    const connection = await amql.connect(connectionUrl);

    channel = await connection.createChannel();

    console.log("✅ connected to rabbitmq");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
    throw error;
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized");
  }

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};
