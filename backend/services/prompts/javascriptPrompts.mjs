export const javascriptPrompts = {
  multipleChoice: {
    system: `You are an expert JavaScript instructor. You MUST create multiple-choice questions ONLY. NEVER create function-variant questions.`,
    
    user: (code) => `Analyze this JavaScript code and create 5 multiple-choice questions based on ACTUAL functions and patterns found:

${code}

🚨 CRITICAL REQUIREMENTS - READ CAREFULLY:
1. Extract ACTUAL functions from the provided code (like generateQuizFromCode, handleRepoLoad, etc.)
2. Create questions about the specific code patterns and functions found
3. Use actual function names, variable names, and patterns from the code
4. Randomize the correct answer position (A, B, C, or D) - don't always use A
5. Use MULTIPLE-CHOICE format, NOT function-variant format
6. DO NOT use "variants" - use "options" array instead
7. DO NOT use "isCorrect" - use "answer" with letter (A, B, C, or D)

🚫 FORBIDDEN FORMATS:
- DO NOT use function-variant format
- DO NOT use "variants" array
- DO NOT use "isCorrect" boolean
- DO NOT use code snippets in options

✅ REQUIRED FORMAT: Return ONLY a JSON array with this exact structure:
[
  {
    "snippet": "Brief description of the code being tested",
  "quiz": {
      "type": "multiple-choice",
      "question": "Your question here?",
      "options": [
        "Option A text only",
        "Option B text only", 
        "Option C text only",
        "Option D text only"
      ],
      "answer": "A",
      "explanation": "Explanation of why this answer is correct"
    }
  }
]

IMPORTANT: Options should be TEXT ONLY, not code snippets. Questions should be about understanding concepts, not debugging code variants.`,

    fallback: {
      snippet: "JavaScript Fundamentals",
      quiz: {
        type: "multiple-choice",
        question: "What is the purpose of the 'async' keyword in JavaScript?",
        options: [
          "To make a function run faster",
          "To enable the use of 'await' inside the function",
          "To prevent the function from being called",
          "To make the function return a promise"
        ],
        answer: "B",
        explanation: "The 'async' keyword enables the use of 'await' inside the function and makes it return a promise."
      }
    }
  }
};
