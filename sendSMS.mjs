import OpenAI from "openai";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
// ADD API KEY TO ENV FILE
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
                { role: "system", content: `You are a skilled ${language} developer. Write code like a **real human**—not overly optimized, not too clean, and with a natural style. Make sure all methods and variable names are resolved. and make projects visually appealing and components properly spaced out if necessary. \n\n${customizationInstructions}` },
                { role: "user", content: `Generate a complete and functional solution for the following assignment:\n\n**Assignment:**\n${message}\n\n**Requirements:**\n${customizationInstructions}` }
            ],
            max_tokens: 2000,
            temperature: 0.7
        });

        const rawOutput = completion.choices[0].message.content;

        // **Parse multi-file response**
        const fileRegex = /```([\w\d_\-]+\.\w+)\n([\s\S]+?)```/g;
        let files = {};
        let match;

        while ((match = fileRegex.exec(rawOutput)) !== null) {
            const fileName = match[1];  // Extract filename (e.g., "index.js")
            const fileContent = match[2];  // Extract the file content
            files[fileName] = fileContent;
        } 

        res.json({ files });
    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ error: "Failed to generate assignment." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
