import mongoose from "mongoose";

function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI environment variable is not defined");
    process.exit(1);
  }

  mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB at ${process.env.MONGO_URI}`);
    console.log(`Database connection state: ${mongoose.connection.readyState}`);
    console.log(`Connection established at: ${new Date().toISOString()}`);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", {
      error: err.message,
      code: err.code,
      uri: process.env.MONGO_URI,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  });

  // Add connection event listeners for monitoring
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected at:', new Date().toISOString());
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected at:', new Date().toISOString());
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', {
      error: err.message,
      timestamp: new Date().toISOString()
    });
  });
}

export default connectDB;

