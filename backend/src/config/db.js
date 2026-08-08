import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const URI = process.env.MONGO_URI;
    if (!URI) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }

    const conn = await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    console.log(`✅MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('⚠️ MongoDB connection unavailable:', error.message);
    return false;
  }
};

export default connectDB;