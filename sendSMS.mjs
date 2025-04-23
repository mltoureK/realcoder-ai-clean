import OpenAI from "openai";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/sendSMS", async (req, res) => {
  const { message, language, namingConvention, commentStyle, errorHandling, codeComplexity } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const customizationInstructions = `
    - Use **${language}** as the programming language.
    - Follow the **${namingConvention}** naming convention.
    - Apply **${commentStyle}** commenting style.
    - ${errorHandling}.
    - Code complexity should be **${codeComplexity} level**.
    - If multiple files are needed, **return each file clearly in this format**:

      \`\`\`filename.ext
      (file content here)
      \`\`\`
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `You are a skilled ${language} developer. Write code like a real human.\n${customizationInstructions}` },
        { role: "user", content: `Generate a complete and functional solution for the following assignment:\n\n**Assignment:**\n${message}\n\n**Requirements:**\n${customizationInstructions}` }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const rawOutput = completion.choices[0].message.content;
    const fileRegex = /```([\w\d_\-]+\.\w+)\n([\s\S]+?)```/g;
    let files = {};
    let match;

    while ((match = fileRegex.exec(rawOutput)) !== null) {
      const fileName = match[1];
      const fileContent = match[2];
      files[fileName] = fileContent;
    }

    res.json({ files });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to generate assignment." });
  }
});

app.post("/generateQuiz", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Missing code or language." });
  }

  const prompt = `
You are an expert programming instructor. Based on the following ${language} code, generate 10 challenging quiz cards.

For drag-and-drop:
- Focus only on **pure code logic** (no HTML or markup).
- Ask the student to reconstruct the **correct order of statements** for a function.
- Options should be realistic lines like: "for (...) {", "return x;", "if (condition) {", "die.roll();", etc.
- The "answer" array must reflect the correct logical execution order.
- DO NOT use UI or text content like labels, inputs, HTML tags, or visual layout.

For multiple-choice:
- Make the question deeply conceptual. Do NOT use the explanation field.
- Include tricky but valid distractors. No low-effort answers.

Format:
{
  "snippet": "optional short snippet for context",
  "quiz": {
    "type": "drag-and-drop" | "multiple-choice" | "fill-in-the-blank",
    "question": "Clear and logical",
    "options": ["..."],
    "answer": ["..."]
  }
}
Here is the code:
\`\`\`${language}
${code}
\`\`\`
Return ONLY the JSON array of quiz cards. No markdown, explanation, or summaries.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You generate quizzes from student code. Return valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1800
    });

    let text = completion.choices[0].message.content.trim();
    console.log("Raw response from OpenAI:\n", text);

    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      text = match[1].trim();
    }

    try {
      const quizCards = JSON.parse(text);
      quizCards.forEach(card => {
        if (card.quiz && card.quiz.answer && !Array.isArray(card.quiz.answer)) {
          card.quiz.answer = [card.quiz.answer];
        }
      });
      res.json({ quizCards });
    } catch (parseError) {
      console.error("❌ Failed to parse OpenAI response:", parseError.message);
      res.status(500).json({ error: "Failed to parse quiz from OpenAI" });
    }
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    res.status(500).json({ error: "Failed to generate quiz." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
