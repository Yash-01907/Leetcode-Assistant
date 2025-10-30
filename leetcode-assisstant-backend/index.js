import express from 'express';
import connectDB from './db.js';
import askQuestionRoute from "./src/routes/guidanceRoutes.js"
import chatRoute from "./src/routes/chatRoutes.js"
import cors from 'cors';

import { configDotenv } from 'dotenv';
configDotenv();

try {
  connectDB();
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  process.exit(1);
}

const app = express();

const port = process.env.PORT || 3000;
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST'],
  credentials: true
}))


app.use(express.json());
app.use('/api', askQuestionRoute);
app.use('/api', chatRoute);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origins: ${process.env.NODE_ENV === 'production' ? 'chrome-extension://*' : 'localhost:3000, chrome-extension://*'}`);
  console.log(`API endpoints: /api/guidance, /api/chat`);
  console.log(`Server started at: ${new Date().toISOString()}`);
});

server.on('error', (error) => {
  console.error('Server error:', {
    error: error.message,
    code: error.code,
    port: port,
    timestamp: new Date().toISOString()
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});