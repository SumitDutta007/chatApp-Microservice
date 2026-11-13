import mongoose from "mongoose";

const connectDb = async () => {
  const url = process.env.MONGO_URI;

  if (!url) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(url, {
      dbName: "Chatappmicroserviceapp",
    });
    console.log("Connected to mongodb");
  } catch (error) {
    console.error(
      "Failed to connect to MongoDB. For MongoDB Atlas, allow the current deployment IP in Network Access.",
      error
    );
    throw error;
  }
};

export default connectDb;
