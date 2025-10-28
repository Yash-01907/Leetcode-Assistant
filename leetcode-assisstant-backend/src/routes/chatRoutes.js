import { Router } from "express";
import { chatWithContext } from "../services/ChatServices.js";
import  ProblemModel  from '../../model/problem.model.js';

const router = Router();

router.post("/chat", async (req, res) => {
  const { problemSlug, userQuery, chatContext } = req.body;

  if (!problemSlug || !userQuery || !chatContext) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const problemData = await ProblemModel.findOne({ problemSlug });

  if (!problemData) {
    return res
      .status(404)
      .json({ error: "Guidance not found for this problem." });
  }

  console.log("Started with AI thinking.")
  try {
    const aiResponse = await chatWithContext({
      problemSlug,
      userQuery,
      chatContext,
      problemData,
    });
      console.log("Ended AI thinking.")

    return res.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;  