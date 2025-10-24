import { Router } from 'express';
import  ProblemModel  from '../../model/problem.model.js';
import { generateGuidance } from '../services/AIService.js';

const router = Router();

router.post('/guidance', async (req, res) => {
    const { problemSlug } = req.body;

    if (!problemSlug) {
        return res.status(400).json({ error: "Missing problemSlug" });
    }

    try {
        // 1. CACHE CHECK: Look up the problem in the database
        const cachedData = await ProblemModel.findOne({ problemSlug });

        if (cachedData) {
            console.log(`Cache HIT for ${problemSlug}.`);
            // CACHE HIT: Return stored data
            // .toObject() cleans up the Mongoose object for a pure JSON response
            return res.status(200).json(cachedData.toObject());
        }

        // 2. CACHE MISS: Generate data via AI
        console.log(`Cache MISS for ${problemSlug}. Calling AI...`);
        const generatedData = await generateGuidance(problemSlug);

        // The generateGuidance function already saves to DB, so just return
        return res.status(201).json(generatedData);

    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(500).json({ error: "Server failed to fetch or generate guidance." });
    }
});

export default router;