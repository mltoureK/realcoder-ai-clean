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
  
    try {
      const quizCards = await generateQuizFromCode(code, language, message);
      res.json({ quizCards });
    } catch (err) {
      console.error("Quiz Gen Error:", err);
      res.status(500).json({ error: "Failed to generate quiz." });
    }
  });

  export default router;