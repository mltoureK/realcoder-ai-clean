// HandlesGPT endpoints

import { Router } from 'express';
import { generateCodeCompletion, generateQuizFromCode } from '../services/openaiService.mjs';

const router = Router();

router.post('/sendSMS', async (req, res) => {
    const { message, language, namingConvention, commentStyle, errorHandling, codeComplexity } = req.body;
  
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }
  
    try {
      const files = await generateCodeCompletion({ message, language, namingConvention, commentStyle, errorHandling, codeComplexity });
      res.json({ files });
    } catch (err) {
      console.error("OpenAI Error:", err);
      res.status(500).json({ error: "Failed to generate assignment." });
    }
  });

  router.post('/generateQuiz', async (req, res) => {
    const { code, language, message } = req.body;
  
    if (!code || !language) {
      return res.status(400).json({ error: "Missing code or language." });
    }
  
    console.log(`Generating quiz for language: ${language}, code length: ${code.length}`);
  
    try {
      // Limit code size to prevent OpenAI rate limits
      const maxCodeLength = 50000; // 50KB limit
      let limitedCode = code;
      
      if (code.length > maxCodeLength) {
        console.log(`Code too large (${code.length} chars), truncating to ${maxCodeLength} chars`);
        limitedCode = code.substring(0, maxCodeLength) + '\n\n// ... (truncated due to size limits)';
      }
      
      console.log('Calling generateQuizFromCode...');
      const quizCards = await generateQuizFromCode(limitedCode, language, message);
      console.log('Quiz generation successful, returning cards:', quizCards.length);
      res.json({ quizCards });
    } catch (err) {
      console.error("Quiz Gen Error:", err);
      console.error("Error details:", err.message);
      console.error("Error stack:", err.stack);
      res.status(500).json({ error: "Failed to generate quiz.", details: err.message });
    }
  });

  export default router;