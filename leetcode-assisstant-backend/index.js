import express from 'express';
import connectDB from './db.js';
import askQuestion from "./src/routes/guidanceRoutes.js"

import { configDotenv } from 'dotenv';
configDotenv();

connectDB();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', askQuestion);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});