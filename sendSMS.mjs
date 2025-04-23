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
You are an expert programming instructor. Based on the following ${language} code, generate 10 high-quality quiz cards that help a student deeply understand key parts of the code. Focus on meaningful logic, control flow, DOM manipulation, interactivity, and how parts work together.

For drag-and-drop:
- Use it for rearranging code steps to match logical execution or function flow.
- Provide multiple options and a correct sequence in "answer".

For multiple-choice:
- Create challenging and realistic distractors — avoid obvious or trivial answers.
- Mix up functions, syntax, and concept-level understanding.
- Example: "What does create() do?" should be replaced with deeper logic like "What kind of data structure is returned by create()?"

Each card must follow this JSON format:
{
  "snippet": "short code snippet",
  "explanation": "clearly explains what it does",
  "quiz": {
    "type": "drag-and-drop" | "multiple-choice" | "fill-in-the-blank",
    "question": "Well-written, challenging question based on the snippet",
    "options": ["Option A", "Option B", "Option C"],
    "answer": ["Correct Answer"] // Always use an array for drag-and-drop
  }
}
Here is the code:
\`\`\`${language}
${code}
\`\`\`
Return only the JSON array — no intro, no outro, no explanation.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You generate quizzes from student code in clean JSON format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1800
    });

    let text = completion.choices[0].message.content.trim();
    console.log("Raw response from OpenAI:\n", text);

    // Extract JSON content between markdown code block if present
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      text = match[1].trim();
    }

    try {
      const quizCards = JSON.parse(text);
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
