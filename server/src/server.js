import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Always start HTTP server so non-DB routes work
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  // Connect to MongoDB if URI provided, but do not block server startup
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000, // Increased timeout for Atlas
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority',
      });
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
    } catch (err) {
      console.warn('MongoDB connection failed. Continuing without DB.', err?.message || err);
      console.warn('Make sure MONGO_URI is set correctly in your .env file');
      console.warn('Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
    }
  } else {
    console.warn('MONGO_URI not set. Skipping MongoDB connection.');
    console.warn('Create a .env file in the server directory with: MONGO_URI=your_connection_string');
  }
};

startServer();