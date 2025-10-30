import { Router } from 'express';
import  ProblemModel  from '../../model/problem.model.js';
import { generateGuidance } from '../services/AIService.js';

const router = Router();

router.post('/guidance', async (req, res) => {
    // CSRF Protection: Validate origin
    const origin = req.get('Origin');
    const allowedOrigins = ['chrome-extension://', 'http://localhost:3000'];
    
    if (!origin || !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        return res.status(403).json({ error: "Forbidden: Invalid origin" });
    }

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
        console.error('API Error:', {
            message: error.message,
            stack: error.stack,
            problemSlug,
            timestamp: new Date().toISOString()
        });
        
        // Handle specific error types
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: "Invalid problem data" });
        }
        if (error.name === 'MongoError' || error.name === 'MongooseError') {
            return res.status(503).json({ error: "Database temporarily unavailable" });
        }
        
        return res.status(500).json({ error: "Server failed to fetch or generate guidance." });
    }
});

export default router;