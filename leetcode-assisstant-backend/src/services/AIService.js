import { GoogleGenAI } from '@google/genai';
import  ProblemModel  from '../../model/problem.model.js';
import 'dotenv/config'; // Load env variables

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

// Define the expected JSON structure for the AI output
const guidanceSchema = {
    type: 'object',
    properties: {
        hints: {
            type: 'array',
            items: { type: 'string' },
            description: '3 small, non-spoilery, strategic nudges or concepts.'
        },
        approach: {
            type: 'string',
            description: 'A detailed, high-level, step-by-step logical plan (pseudocode style).'
        },
        solution1: {
            type: 'string',
            description: 'A full, well-commented Python solution for a simple approach (e.g., Brute Force).'
        },
        solution2: {
            type: 'string',
            description: 'A full, well-commented Python solution for the optimal/most efficient approach (e.g., O(n) or Dynamic Programming).'
        }
    },
    required: ['hints', 'approach', 'solution1', 'solution2']
};

export async function generateGuidance(problemSlug) {
    // 1. You'll need to fetch the actual problem statement here!
    // For MVE, assume the slug is the title, and the AI knows the problem.
    // LATER: You'll integrate a LeetCode scraper/API to get the full question text.
    
    const prompt = `You are a coding tutor. Generate detailed guidance for the LeetCode problem with the slug: ${problemSlug}. Follow these instructions strictly:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // A fast, capable model
            contents: prompt,
            config: {
                // FORCE the output to be JSON matching the schema
                responseMimeType: 'application/json',
                responseSchema: guidanceSchema,
                // Add system instructions here for tone, format, and complexity
                systemInstruction: 'Your output MUST be a JSON object that strictly adheres to the provided schema. Ensure solutions are in Python and highly readable. Hints must be very subtle.',
            },
        });

        const jsonText = response.text.trim();
        const guidanceData = JSON.parse(jsonText);

        // 2. Store in DB
        const newProblem = new ProblemModel({
            problemSlug: problemSlug,
            ...guidanceData,
        });
        await newProblem.save();

        return guidanceData;

    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate guidance from AI.");
    }
}