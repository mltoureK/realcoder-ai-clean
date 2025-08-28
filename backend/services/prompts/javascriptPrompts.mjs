export const javascriptPrompts = {
  multipleChoice: {
    system: `You are an expert JavaScript instructor creating educational quiz questions. You MUST return ONLY valid JSON. Do NOT include any markdown, HTML, or explanatory text.`,
    
    user: (code) => `Create 3 multiple-choice questions that test understanding of the ACTUAL code provided:

${code}

EDUCATIONAL REQUIREMENTS:
1. Questions must test understanding of SPECIFIC functions, variables, and patterns from the provided code
2. Focus on WHY certain approaches were chosen and HOW the code works
3. Test understanding of the code's purpose, logic, and implementation details
4. Use actual function names, variable names, and patterns from the code
5. Randomize answer positions (A, B, C, D)

Return ONLY a JSON array with this exact format:

[
  {
    "snippet": "Specific function or feature being tested",
    "quiz": {
      "type": "multiple-choice",
      "question": "Question about the specific code implementation and logic?",
      "options": [
        "Answer that shows understanding of the actual code",
        "Answer that misunderstands the code's purpose",
        "Answer that confuses different patterns in the code",
        "Answer that shows lack of understanding of the specific implementation"
      ],
      "answer": "A",
      "explanation": "Why this answer is correct based on the actual code logic and purpose"
    }
  }
]

IMPORTANT: Questions must test understanding of the ACTUAL code provided, not general JavaScript concepts. Focus on the specific implementation, purpose, and logic of the functions and patterns in the code.

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
    system: `You are an expert JavaScript instructor creating educational quiz questions. You MUST return ONLY valid JSON. Do NOT include any markdown, HTML, or explanatory text.`,
    
    user: (code) => `CRITICAL: You MUST analyze the ACTUAL code provided below and create questions based ONLY on the specific functions, variables, and patterns found in that code. DO NOT use generic examples.

Create 2 function-variant questions that test understanding of the ACTUAL code provided:

${code}

MANDATORY REQUIREMENTS:
1. You MUST use ONLY functions, variables, and patterns that actually exist in the provided code
2. You MUST reference specific function names, variable names, and code patterns from the provided code
3. You MUST NOT use generic examples like "fetchData", "sumArray", etc. unless they actually exist in the code
4. Each question MUST be about a specific function or feature that is actually present in the provided code
5. The variants MUST be based on the actual implementation details from the provided code
6. Each question MUST have exactly 4 variants (A, B, C, D) - no more, no less
7. NO COMMENTS in the code variants - just pure code

Return ONLY a JSON array with this exact format:

[
  {
    "snippet": "Name of the actual function or feature from the provided code",
    "quiz": {
      "type": "function-variant",
      "question": "Which version correctly implements the [ACTUAL FUNCTION NAME] from the provided code?",
      "variants": [
        {
          "id": "A",
          "code": "// Use the ACTUAL function name and implementation from the provided code",
          "isCorrect": true,
          "explanation": "Correct: This version properly implements the actual function from the provided code."
        },
        {
          "id": "B", 
          "code": "// Create a buggy version of the ACTUAL function from the provided code",
          "isCorrect": false,
          "explanation": "Bug: This version has an error in the actual function implementation."
        },
        {
          "id": "C",
          "code": "// Create another buggy version of the ACTUAL function from the provided code",
          "isCorrect": false,
          "explanation": "Bug: This version has a different error in the actual function implementation."
        },
        {
          "id": "D",
          "code": "// Create a third buggy version of the ACTUAL function from the provided code",
          "isCorrect": false,
          "explanation": "Bug: This version has another error in the actual function implementation."
        }
      ]
    }
  }
]

CRITICAL: If you cannot find specific functions or patterns in the provided code, DO NOT generate generic questions. Instead, analyze the code structure, variable names, or any other specific elements that are actually present.`,

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
