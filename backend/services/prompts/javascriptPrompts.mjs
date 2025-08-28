export const javascriptPrompts = {
  multipleChoice: {
    system: `You are an expert JavaScript instructor. You MUST return ONLY valid JSON. Do NOT include any markdown, HTML, or explanatory text.`,
    
    user: (code) => `Create 3 multiple-choice questions about this JavaScript code:

${code}

RULES:
1. Return ONLY a JSON array - no other text
2. Use ACTUAL functions, variables, and patterns from the provided code
3. Ask about specific implementation details, not general concepts
4. Randomize answer positions (A, B, C, D)
5. Create descriptive snippets that clearly explain what the question is about
6. Use this exact format:

[
  {
    "snippet": "Clear description of the specific function, feature, or code pattern being tested",
    "quiz": {
      "type": "multiple-choice",
      "question": "Specific question about the actual code implementation?",
      "options": ["Specific option A", "Specific option B", "Specific option C", "Specific option D"],
      "answer": "A",
      "explanation": "Why this specific answer is correct based on the code"
    }
  }
]

IMPORTANT: 
- Questions must be about the ACTUAL code provided, not general JavaScript concepts
- Use specific function names, variable names, and patterns from the code
- Snippets should clearly describe what part of the code the question is testing
- Make snippets descriptive and informative

NO MARKDOWN. NO HTML. ONLY JSON.`,

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
  },

  functionVariant: {
    system: `You are an expert JavaScript instructor. You MUST return ONLY valid JSON. Do NOT include any markdown, HTML, or explanatory text.`,
    
    user: (code) => `Create 2 function-variant questions about this JavaScript code:

${code}

RULES:
1. Return ONLY a JSON array - no other text
2. Use ACTUAL functions, variables, and patterns from the provided code
3. Create subtle bugs in the variants (missing semicolons, wrong variable names, etc.)
4. Randomize answer positions (A, B, C, D)
5. Create descriptive snippets that clearly explain what the question is about
6. Use this exact format:

[
  {
    "snippet": "Clear description of the specific function or feature being tested with function-variant bugs",
    "quiz": {
      "type": "function-variant",
      "question": "Which version correctly implements this function?",
      "variants": [
        {
          "id": "A",
          "code": "// Correct version\nfunction example() {\n  // correct code here\n}",
          "isCorrect": true,
          "explanation": "Correct: This version works properly."
        },
        {
          "id": "B", 
          "code": "// Buggy version\nfunction example() {\n  // buggy code here\n}",
          "isCorrect": false,
          "explanation": "Bug: Missing semicolon or other issue."
        },
        {
          "id": "C",
          "code": "// Another buggy version\nfunction example() {\n  // more buggy code\n}",
          "isCorrect": false,
          "explanation": "Bug: Wrong variable name or logic error."
        },
        {
          "id": "D",
          "code": "// Yet another buggy version\nfunction example() {\n  // even more buggy code\n}",
          "isCorrect": false,
          "explanation": "Bug: Incorrect function call or syntax error."
        }
      ]
    }
  }
]

IMPORTANT: 
- Questions must be about the ACTUAL code provided, not general JavaScript concepts
- Use specific function names, variable names, and patterns from the code
- Snippets should clearly describe what function or feature is being tested
- Make snippets descriptive and informative

NO MARKDOWN. NO HTML. ONLY JSON.`,

    fallback: {
      snippet: "JavaScript Function Implementation",
      quiz: {
        type: "function-variant",
        question: "Which version correctly implements an async function?",
        variants: [
          {
            id: "A",
            code: "async function fetchData() {\n  const response = await fetch('/api/data');\n  return response.json();\n}",
            isCorrect: true,
            explanation: "Correct: Properly uses async/await syntax."
          },
          {
            id: "B",
            code: "function fetchData() {\n  const response = await fetch('/api/data');\n  return response.json();\n}",
            isCorrect: false,
            explanation: "Bug: Missing async keyword."
          },
          {
            id: "C",
            code: "async function fetchData() {\n  const response = fetch('/api/data');\n  return response.json();\n}",
            isCorrect: false,
            explanation: "Bug: Missing await keyword."
          },
          {
            id: "D",
            code: "async function fetchData() {\n  const response = await fetch('/api/data');\n  return response;\n}",
            isCorrect: false,
            explanation: "Bug: Missing .json() call."
          }
        ]
      }
    }
  }
};
