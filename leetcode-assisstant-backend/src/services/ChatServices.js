// src/services/ChatService.js (Placeholder logic using problemData)
import { GoogleGenAI } from '@google/genai';
// Assume AI and ProblemModel imports are handled

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

export async function chatWithContext({ problemSlug, userQuery, chatContext, problemData }) {
    let systemInstruction = "";
    
    // 1. Define the System Instruction based on the context
    switch (chatContext) {
        case 'hints':
            systemInstruction = `You are a subtle, conceptual coding tutor. The user is currently looking for hints for the problem ${problemSlug}. Answer the query, "${userQuery}", ONLY with a conceptual nudge or strategy suggestion. NEVER provide any code, pseudocode, or explicit logical steps. Do not spoil the solution.`;
            break;
        case 'approach':
            systemInstruction = `You are a logical tutor. The user is clarifying the stepwise approach. The core approach is: ${problemData.approach}. Answer the query, "${userQuery}", by clarifying the logic or a specific step in the approach. NEVER provide the full solution code (solution1 or solution2).`;
            break;
        case 'solution':
            systemInstruction = `You are a detailed code explainer. The user is asking about the solutions. Review and explain Solution 1: ${problemData.solution1} and Solution 2: ${problemData.solution2}. Answer the query, "${userQuery}", thoroughly.`;
            break;
        default:
            systemInstruction = "You are a general coding assistant. Answer the user's query.";
    }

    // 2. Call the AI with the constrained prompt
    console.log(`Starting AI chat for problem: ${problemSlug}, context: ${chatContext}`);
    console.log(`System instruction length: ${systemInstruction.length} characters`);
    
    const startTime = Date.now();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: userQuery, // You can also put the full context/chat history here for advanced chat
            config: {
                systemInstruction: systemInstruction,
            },
        });

        const duration = Date.now() - startTime;
        console.log(`AI chat completed in ${duration}ms for problem: ${problemSlug}`);
        console.log(`Response length: ${response.text.length} characters`);
        
        return response.text; // Return the AI's plain text response

    } catch (error) {
        console.error("AI Chat Error:", {
            error: error.message,
            problemSlug,
            userQuery: userQuery.substring(0, 100),
            chatContext,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        return "Sorry, I ran into an error generating that response.";
    }
}