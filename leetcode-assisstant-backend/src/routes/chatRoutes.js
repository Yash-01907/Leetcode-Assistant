import { Router } from "express";
import { chatWithContext } from "../services/ChatServices.js";
import  ProblemModel  from '../../model/problem.model.js';

const router = Router();

router.post("/chat", async (req, res) => {
  // CSRF Protection: Validate origin
  const origin = req.get('Origin');
  const allowedOrigins = ['chrome-extension://', 'http://localhost:3000'];
 
  
  if (!origin || !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return res.status(403).json({ error: "Forbidden: Invalid origin" });
  }

  const { problemSlug, userQuery, chatContext } = req.body;

  if (!problemSlug || !userQuery || !chatContext) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Input validation to prevent NoSQL injection
  if (typeof problemSlug !== 'string' || !/^[a-zA-Z0-9-_]+$/.test(problemSlug)) {
    return res.status(400).json({ error: "Invalid problemSlug format" });
  }
  
  if (typeof userQuery !== 'string' || userQuery.length > 1000) { 
    return res.status(400).json({ error: "Invalid userQuery" });
  }
  
  if (typeof chatContext !== 'string' || !['hints', 'approach', 'solution'].includes(chatContext)) {
    return res.status(400).json({ error: "Invalid chatContext" });
  }

  let problemData;
  try {
    problemData = await ProblemModel.findOne({ problemSlug });
  } catch (dbError) {
    console.error('Database query error:', dbError);
    return res.status(500).json({ error: "Database error" });
  }

  if (!problemData) {
    return res
      .status(404)
      .json({ error: "Guidance not found for this problem." });
  }

  const startTime = Date.now();
  console.log(`Chat request started for problem: ${problemSlug}, context: ${chatContext}`);
  console.log(`User query: ${userQuery.substring(0, 100)}${userQuery.length > 100 ? '...' : ''}`);
  
  try {
    const aiResponse = await chatWithContext({
      problemSlug,
      userQuery,
      chatContext,
      problemData,
    });
    
    const duration = Date.now() - startTime;
    console.log(`Chat request completed in ${duration}ms for problem: ${problemSlug}`);
    console.log(`Response length: ${aiResponse.length} characters`);

    return res.json({ response: aiResponse });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Chat Error after ${duration}ms:`, {
      error: error.message,
      problemSlug,
      chatContext,
      stack: error.stack
    });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;  