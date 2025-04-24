
// Handles OpenAI API interactions for code generation and quiz creation.
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * 
 * @param {*} param0 
 * @returns 
 */
export async function generateCodeCompletion({ message, language, namingConvention, commentStyle, errorHandling, codeComplexity }) {
  const customizationInstructions = `
- Use **${language}** as the programming language.
- Follow the **${namingConvention}** naming convention.
- Apply **${commentStyle}** commenting style.
- ${errorHandling}.
- Code complexity should be **${codeComplexity} level**.
- If multiple files are needed, return them like:
  \`\`\`filename.ext
  (file content here)
  \`\`\`
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: `You are a skilled ${language} developer.\n${customizationInstructions}` },
      { role: "user", content: `Assignment:\n${message}\n\nRequirements:\n${customizationInstructions}` }
    ],
    max_tokens: 2000,
    temperature: 0.7
  });

  const rawOutput = completion.choices[0].message.content;
  const fileRegex = /```([\w\d_.-]+\.\w+)\n([\s\S]+?)```/g;

  const files = {};
  let match;
  while ((match = fileRegex.exec(rawOutput)) !== null) {
    const [_, filename, content] = match;
    files[filename] = content.trim();
  }

  return files;
}

/**
 * 
 * @param {*} code 
 * @param {*} language 
 * @param {*} message 
 * @returns 
 */
export async function generateQuizFromCode(code, language, message) {
  const prompt = `
The student was given this assignment: ${message}
Below is their solution in ${language}.

Generate 10 quiz cards to assess their understanding.

Each quiz must be JSON formatted like:
{
  "snippet": "(optional short snippet)",
  "quiz": {
    "type": "drag-and-drop" | "multiple-choice" | "fill-in-the-blank",
    "question": "Challenging question",
    "options": ["..."],
    "answer": ["..."],
    "resource": {
      "title": "Concept",
      "link": "https://developer.mozilla.org/..."
    }
  }
}

Code:
\`\`\`${language}
${code}
\`\`\`
Return JSON only.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You generate quizzes from student code. Output JSON only." },
      { role: "user", content: prompt }
    ],
    max_tokens: 1800,
    temperature: 0.5
  });

  let text = completion.choices[0].message.content.trim();
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) text = match[1].trim();

  const quizCards = JSON.parse(text);
  quizCards.forEach(card => {
    if (!Array.isArray(card.quiz.answer)) {
      card.quiz.answer = [card.quiz.answer];
    }
  });

  return quizCards;
}
