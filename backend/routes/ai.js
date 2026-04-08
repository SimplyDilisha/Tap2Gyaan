import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are a helpful AI study assistant for students. Your role is to:
- Help explain complex concepts in simple terms
- Solve math problems step by step
- Answer questions about any academic subject
- Provide study tips and learning strategies
- Be encouraging and supportive

Keep responses concise but thorough. Use examples when helpful.
For math problems, show your work step by step.
Format code blocks with proper syntax when showing code.
Be friendly and educational in tone.`;

/**
 * POST /api/ai/chat
 * Send a message to the AI and get a response
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Message is required' 
      });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'AI service not configured' 
      });
    }

    // Build messages array with history for context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', errorData);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('Invalid response from AI');
    }

    res.status(200).json({
      status: 'success',
      response: aiResponse,
    });

  } catch (err) {
    console.error('AI Chat Error:', err);
    next(err);
  }
});

export default router;
