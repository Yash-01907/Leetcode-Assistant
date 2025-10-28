import express from 'express';
import connectDB from './db.js';
import askQuestionRoute from "./src/routes/guidanceRoutes.js"
import chatRoute from "./src/routes/chatRoutes.js"
import cors from 'cors';

import { configDotenv } from 'dotenv';
configDotenv();

connectDB();

const app = express();

const port = process.env.PORT || 3000;
app.use(cors())
app.use(express.json());
app.use('/api', askQuestionRoute);
app.use('/api', chatRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});