// Main Server launcher

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
  const { code, language, message } = req.body;

  if (!code || !language || !message) {
    return res.status(400).json({ error: "Missing code, language, or assignment message." });
  }

  const prompt = `
The student was given this assignment: ${message}
Below is their code solution in ${language}.

Generate 10 highly relevant and challenging quiz cards to test their understanding of the exact concepts used in the assignment and code. 

Focus the questions around:
- The code's actual logic and structure
- Key methods, APIs, or syntax used
- Things they should have learned by doing this assignment

**Examples:**
- If they used fetch() → quiz them on HTTP methods, response parsing, async behavior
- If SVG is involved → ask about attributes, rendering, viewBox
- If it’s a loop-heavy assignment → ask about loop behavior, break/continue, scope

**Drag-and-Drop:**
- Use only code lines. No HTML. Force them to reconstruct the logic.

**Multiple-Choice:**
- Distractors should be confusing but valid. No "dumb" answers.
- Avoid giving away the answer in the question or structure

**Each quiz must be in this format:**
{
  "snippet": "(optional short snippet)",
  "quiz": {
    "type": "drag-and-drop" | "multiple-choice" | "fill-in-the-blank",
    "question": "Challenging question based on the code",
    "options": ["..."],
    "answer": ["..."],
    "resource": {
      "title": "Concept to review",
      "link": "https://developer.mozilla.org/..."
    }
  }
}

Here is the code:
\`\`\`${language}
${code}
\`\`\`
Only return the JSON array. No markdown. No explanation. No intros.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You generate quizzes from code. Focus on the code and the assignment. Output JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1800
    });

    let text = completion.choices[0].message.content.trim();
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) text = match[1].trim();

    const quizCards = JSON.parse(text);
    quizCards.forEach(card => {
      if (card.quiz && card.quiz.answer && !Array.isArray(card.quiz.answer)) {
        card.quiz.answer = [card.quiz.answer];
      }
    });

    res.json({ quizCards });
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    res.status(500).json({ error: "Failed to generate quiz." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
