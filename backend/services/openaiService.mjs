import OpenAI from 'openai';
import { FunctionVariantQuiz } from './quizTypes/functionVariantQuiz.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const functionVariantQuiz = new FunctionVariantQuiz();

export async function generateCodeCompletion(prompt) {
  try {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
        {
          role: "system",
          content: "You are a helpful coding assistant."
        },
        {
          role: "user",
          content: prompt
        }
    ],
    max_tokens: 2000,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}

// Language-specific prompts for sophisticated quiz generation
const languagePrompts = {
  javascript: `Generate advanced JavaScript quiz questions focusing on sophisticated understanding of:
- Algorithm complexity and optimization
- Design patterns (Observer, Factory, Singleton, Module)
- Memory leaks and garbage collection
- Security vulnerabilities (XSS, injection attacks)
- Advanced concurrency (Web Workers, SharedArrayBuffer)
- Functional programming concepts (currying, composition, monads)
- Advanced debugging techniques and performance profiling
- Code refactoring and architectural patterns
- Performance optimization strategies
- Advanced error handling patterns`,

  python: `Generate advanced Python quiz questions focusing on sophisticated understanding of:
- Algorithm complexity and Big O notation
- Design patterns and SOLID principles
- Memory management and garbage collection
- Security best practices and vulnerabilities
- Advanced concurrency (asyncio, threading, multiprocessing)
- Functional programming and decorators
- Advanced debugging and profiling techniques
- Code refactoring and clean code principles
- Performance optimization and caching strategies
- Advanced exception handling and context managers`,

  java: `Generate advanced Java quiz questions focusing on sophisticated understanding of:
- Algorithm complexity and data structures
- Design patterns and enterprise patterns
- Memory management and JVM internals
- Security vulnerabilities and secure coding
- Advanced concurrency and multithreading
- Functional programming with streams and lambdas
- Advanced debugging and performance tuning
- Code refactoring and architectural design
- Performance optimization and JIT compilation
- Advanced exception handling and resource management`,

  cpp: `Generate advanced C++ quiz questions focusing on sophisticated understanding of:
- Algorithm complexity and STL optimization
- Design patterns and RAII principles
- Memory management and smart pointers
- Security vulnerabilities and buffer overflows
- Advanced concurrency and thread safety
- Template metaprogramming and SFINAE
- Advanced debugging and profiling techniques
- Code refactoring and modern C++ practices
- Performance optimization and compiler optimizations
- Advanced exception handling and error codes`,

  csharp: `Generate advanced C# quiz questions focusing on sophisticated understanding of:
- Algorithm complexity and LINQ optimization
- Design patterns and dependency injection
- Memory management and garbage collection
- Security vulnerabilities and secure coding
- Advanced concurrency and async/await patterns
- Functional programming and immutable data
- Advanced debugging and performance profiling
- Code refactoring and clean architecture
- Performance optimization and memory efficiency
- Advanced exception handling and error propagation`
};

export async function generateQuizFromCode(code, language) {
  try {
    console.log(`Generating quiz for language: ${language}, code length: ${code.length}`);
    
    // Truncate code if too large to prevent token limits
    const maxCodeLength = 50000;
    if (code.length > maxCodeLength) {
      console.log(`Code too large (${code.length} chars), truncating to ${maxCodeLength} chars`);
      code = code.substring(0, maxCodeLength);
    }

    // Use the new modular function variant quiz system
    return await functionVariantQuiz.generateQuiz(code, language, openai);

    console.log('Calling generateQuizFromCode...');

    const prompt = `
Find 2 REAL functions from this ${language} code and create SHORT, DIVERSE function-variant questions.

🎯 CRITICAL: Create SHORT code snippets (5-10 lines max) and focus on specific programming concepts!

Code:
\`\`\`${language}
${code}
\`\`\`

Create JSON with this EXACT format:
[
  {
    "snippet": "Function Name - Brief description of what it does",
    "quiz": {
      "type": "function-variant", 
      "question": "Which version correctly implements the intended functionality?",
      "variants": [
        {
          "id": "A", 
          "code": "// Correct implementation", 
          "isCorrect": true, 
          "explanation": "Correct - Brief explanation of why this works"
        },
        {
          "id": "B", 
          "code": "// Buggy implementation", 
          "isCorrect": false, 
          "explanation": "Bug: Brief explanation of the specific bug"
        },
        {
          "id": "C", 
          "code": "// Another buggy implementation", 
          "isCorrect": false, 
          "explanation": "Bug: Brief explanation of the specific bug"
        },
        {
          "id": "D", 
          "code": "// Yet another buggy implementation", 
          "isCorrect": false, 
          "explanation": "Bug: Brief explanation of the specific bug"
        }
      ]
    }
  }
]

CRITICAL REQUIREMENTS:
1. Randomize correct answer position (A, B, C, or D)
2. Create SHORT code snippets (5-10 lines maximum) - NO long functions!
3. Focus on DIVERSE JavaScript programming concepts based on the actual repository functions:
   - Array method usage and confusion (filter vs map vs reduce vs forEach vs some vs every vs find vs findIndex)
   - Object manipulation and destructuring patterns (object vs array destructuring, property access, spread operator)
   - String handling and template literals (concatenation vs interpolation, string methods, regex usage)
   - Variable scope, hoisting, and closure issues (var vs let vs const, block scope, function scope)
   - Type coercion and comparison operators (== vs ===, truthy/falsy values, null/undefined handling)
   - Function parameters, return values, and execution flow (default parameters, rest parameters, arrow functions)
   - Promise handling and async/await patterns (promise chaining, error handling, async function returns)
   - Error handling and exception management (try/catch placement, error propagation, custom errors)
   - Event handling and callback patterns (event listeners, event delegation, callback functions)
   - Module system and import/export syntax (named vs default exports, dynamic imports, circular dependencies)
   - DOM manipulation and browser APIs (querySelector, addEventListener, innerHTML vs textContent)
   - Regular expressions and pattern matching (flags, groups, quantifiers, character classes)
   - Date/time handling and formatting (Date objects, timezone issues, date arithmetic)
   - Number precision and mathematical operations (floating point arithmetic, Math methods, parseInt/parseFloat)
   - Boolean logic and conditional expressions (short-circuit evaluation, operator precedence, ternary operators)
   - JSON handling and serialization (JSON.parse, JSON.stringify, error handling)
   - Local storage and session storage (getItem, setItem, removeItem, storage events)
   - Fetch API and HTTP requests (headers, body parsing, response handling, error status codes)
   - File handling and FileReader API (file reading, blob handling, file validation)
   - URL manipulation and routing (URLSearchParams, pathname, query parameters)
   - Form handling and validation (form submission, input validation, form data)
   - CSS manipulation and styling (classList, style properties, computed styles)
   - Animation and timing (setTimeout, setInterval, requestAnimationFrame)
   - Web APIs and browser features (localStorage, sessionStorage, cookies, history API)
   - Performance optimization patterns (debouncing, throttling, lazy loading)
   - Memory management and garbage collection (object references, circular references)
   - Security considerations (XSS prevention, CSRF protection, input sanitization)
   - Testing and debugging patterns (console methods, error logging, debugging tools)
   - Code organization and patterns (factory functions, closures, modules, namespaces)
   - And ANY OTHER JavaScript/TypeScript concepts that appear in the repository code

4. Create DIVERSE question types based on the actual functions in the repository:
   - Ask about specific functionality each function provides
   - Focus on the core purpose and behavior of each function
   - Make questions relevant to what the function actually does in the codebase
   - Vary question types across different programming concepts and scenarios
   - Consider the context and domain of the application (web app, API, utility functions, etc.)
   - Ask about edge cases and error conditions specific to the function's purpose
   - Focus on the actual data flow and processing logic in the function

5. AVOID generic system design questions:
   - Don't ask about "security vulnerabilities" or "caching strategies" in general
   - Don't ask about "memory leaks" or "race conditions" as generic concepts
   - Don't ask about "input validation" or "error handling" as broad topics
   - Focus on specific JavaScript programming mistakes and bugs instead
   - Ask about concrete implementation details and code behavior

6. Make bugs SUBTLE and realistic:
   - Focus on common JavaScript programming mistakes developers actually make
   - Create bugs that require careful code analysis to spot
   - Use realistic scenarios that developers encounter in real projects
   - Make all variants look similar in complexity and style
   - Ensure bugs are specific to the function being tested
   - Consider the actual data types and structures used in the function

7. Use REAL functions from the provided code:
   - Extract actual functions from the repository
   - Keep them short and focused (5-10 lines maximum)
   - Introduce subtle bugs in 3 variants, keep 1 correct
   - Ensure all variants are similar in length and complexity
   - Use the actual function names and parameters from the code
   - Maintain the same function signature across all variants

8. Provide clear, specific explanations:
   - Explain exactly what the bug is and why it's wrong
   - Focus on the specific programming concept being tested
   - Keep explanations concise but informative
   - Explain the impact of the bug on the function's behavior
   - Reference specific JavaScript concepts and best practices`;

    // Add randomization to ensure variety
    const randomSeed = Math.floor(Math.random() * 1000);
    const questionTypes = [
      "Which version correctly processes array data with proper type checking?",
      "Which version implements efficient string manipulation without performance issues?",
      "Which version handles object destructuring and property access correctly?",
      "Which version manages event listeners and prevents memory accumulation?",
      "Which version implements proper error boundaries and exception handling?",
      "Which version uses the correct array methods for data transformation?",
      "Which version handles scope and closure issues properly?",
      "Which version implements proper date/time handling and validation?",
      "Which version uses template literals and string interpolation correctly?",
      "Which version implements proper module imports and exports?",
      "Which version handles JSON parsing and serialization safely?",
      "Which version implements proper regex patterns and string matching?",
      "Which version manages DOM manipulation and event delegation correctly?",
      "Which version implements proper number precision and mathematical operations?",
      "Which version handles boolean logic and conditional expressions correctly?"
    ];
    
    const selectedQuestionType = questionTypes[randomSeed % questionTypes.length];
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert ${language} instructor who creates MASSIVELY DIVERSE function variant quiz questions.

🎯 RANDOMIZATION SEED: ${randomSeed}
🎯 SUGGESTED QUESTION TYPE: ${selectedQuestionType}

🚀 CRITICAL DIVERSITY REQUIREMENTS:

1. **NEVER REPEAT THESE GENERIC QUESTION PATTERNS:**
   - ❌ "Which version correctly handles edge cases and prevents memory leaks?"
   - ❌ "Which version implements proper security validation and prevents injection attacks?"
   - ❌ "Which version correctly implements caching strategy and handles cache invalidation?"
   - ❌ "Which version properly handles async operations and prevents race conditions?"
   - ❌ "Which version validates input correctly and prevents errors?"
   - ❌ "Which version manages resources efficiently and prevents issues?"

2. **CREATE DIVERSE QUESTION TYPES BASED ON ACTUAL REPOSITORY FUNCTIONS:**
   - Ask about specific functionality each function provides
   - Focus on the core purpose and behavior of each function
   - Make questions relevant to what the function actually does in the codebase
   - Vary question types across different programming concepts and scenarios
   - Consider the context and domain of the application (web app, API, utility functions, etc.)
   - Ask about edge cases and error conditions specific to the function's purpose
   - Focus on the actual data flow and processing logic in the function

3. **FOCUS ON DIVERSE JAVASCRIPT PROGRAMMING CONCEPTS:**
   - Array method usage and confusion (filter vs map vs reduce vs forEach vs some vs every vs find vs findIndex)
   - Object manipulation and destructuring patterns (object vs array destructuring, property access, spread operator)
   - String handling and template literals (concatenation vs interpolation, string methods, regex usage)
   - Variable scope, hoisting, and closure issues (var vs let vs const, block scope, function scope)
   - Type coercion and comparison operators (== vs ===, truthy/falsy values, null/undefined handling)
   - Function parameters, return values, and execution flow (default parameters, rest parameters, arrow functions)
   - Promise handling and async/await patterns (promise chaining, error handling, async function returns)
   - Error handling and exception management (try/catch placement, error propagation, custom errors)
   - Event handling and callback patterns (event listeners, event delegation, callback functions)
   - Module system and import/export syntax (named vs default exports, dynamic imports, circular dependencies)
   - DOM manipulation and browser APIs (querySelector, addEventListener, innerHTML vs textContent)
   - Regular expressions and pattern matching (flags, groups, quantifiers, character classes)
   - Date/time handling and formatting (Date objects, timezone issues, date arithmetic)
   - Number precision and mathematical operations (floating point arithmetic, Math methods, parseInt/parseFloat)
   - Boolean logic and conditional expressions (short-circuit evaluation, operator precedence, ternary operators)
   - JSON handling and serialization (JSON.parse, JSON.stringify, error handling)
   - Local storage and session storage (getItem, setItem, removeItem, storage events)
   - Fetch API and HTTP requests (headers, body parsing, response handling, error status codes)
   - File handling and FileReader API (file reading, blob handling, file validation)
   - URL manipulation and routing (URLSearchParams, pathname, query parameters)
   - Form handling and validation (form submission, input validation, form data)
   - CSS manipulation and styling (classList, style properties, computed styles)
   - Animation and timing (setTimeout, setInterval, requestAnimationFrame)
   - Web APIs and browser features (localStorage, sessionStorage, cookies, history API)
   - Performance optimization patterns (debouncing, throttling, lazy loading)
   - Memory management and garbage collection (object references, circular references)
   - Security considerations (XSS prevention, CSRF protection, input sanitization)
   - Testing and debugging patterns (console methods, error logging, debugging tools)
   - Code organization and patterns (factory functions, closures, modules, namespaces)
   - And ANY OTHER JavaScript/TypeScript concepts that appear in the repository code

4. **DIVERSE BUG CATEGORIES TO EXPLORE:**
   - Array method confusion and misuse
   - Object property access and manipulation errors
   - String concatenation vs template literal issues
   - Variable scope and hoisting problems
   - Type coercion and comparison mistakes
   - Function parameter and return value errors
   - Promise and async/await handling issues
   - Error handling and exception management problems
   - Event listener and callback function mistakes
   - Module import/export syntax errors
   - DOM manipulation and browser API misuse
   - Regular expression pattern and flag errors
   - Date/time handling and formatting issues
   - Number precision and mathematical operation bugs
   - Boolean logic and conditional expression mistakes
   - JSON parsing and serialization errors
   - Local storage and session storage misuse
   - Fetch API and HTTP request handling issues
   - File handling and FileReader API problems
   - URL manipulation and routing errors
   - Form handling and validation mistakes
   - CSS manipulation and styling issues
   - Animation and timing function problems
   - Web API and browser feature misuse
   - Performance optimization pattern errors
   - Memory management and garbage collection issues
   - Security vulnerability patterns
   - Testing and debugging tool misuse
   - Code organization and pattern mistakes
   - And ANY OTHER realistic JavaScript/TypeScript bugs that developers commonly make

5. **CRITICAL RULES FOR BUG CREATION:**
   - Use REAL functions from the provided code
   - Create SUBTLE bugs that require careful analysis to spot
   - Randomize correct answer positions (A, B, C, D)
   - Each wrong variant should have a DIFFERENT type of bug
   - Keep all variants similar in length and complexity
   - NO PLACEHOLDERS - use actual code with bugs introduced
   - Focus on JavaScript/TypeScript specific concepts
   - Make bugs realistic and common in real-world scenarios
   - Ensure bugs are specific to the function being tested
   - Consider the actual data types and structures used in the function
   - Create bugs that developers actually encounter in practice
   - Focus on concrete implementation details and code behavior
   - Avoid obvious or trivial bugs that are too easy to spot
   - Make bugs challenging but not impossible to identify
   - Ensure all variants look similar in complexity and style
   - Use the actual function names and parameters from the code
   - Maintain the same function signature across all variants
   - Keep functions short and focused (5-10 lines maximum)
   - Provide clear, specific explanations for each bug
   - Explain the impact of the bug on the function's behavior
   - Reference specific JavaScript concepts and best practices`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 8000,
      temperature: 0.9, // Increased for more creativity and variety
    });

    let text = completion.choices[0].message.content.trim();
    console.log('Raw OpenAI response:', text);
    
    // Extract JSON from response
    let extractedText = text;
    
    // Try to extract from markdown code block
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      extractedText = codeBlockMatch[1].trim();
    } else {
      // Try to extract JSON array
      const jsonArrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonArrayMatch) {
        extractedText = jsonArrayMatch[0];
      }
    }
    
    console.log('Extracted JSON text:', extractedText);
    
    let quizCards;
    try {
      quizCards = JSON.parse(extractedText);
    } catch (parseError) {
      console.log('JSON parse error:', parseError);
      console.log('Failed to parse:', extractedText);
      
      // Try second parsing attempt with just the array part
      try {
        const arrayMatch = extractedText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          quizCards = JSON.parse(arrayMatch[0]);
        } else {
          throw parseError;
        }
      } catch (secondParseError) {
        console.log('Second parse attempt failed:', secondParseError);
        
        // If all parsing fails, create a fallback quiz
        console.log('Creating fallback quiz due to parsing failure');
        quizCards = [{
          snippet: "Array Processing Function - Handles data transformation and filtering",
          quiz: {
            type: "function-variant",
            question: "Which version correctly processes array data with proper type checking?",
            variants: [
              {
                id: "A",
                code: "const processData = (items) => {\n  return items.filter(item => item.active).map(item => item.name);\n};",
                isCorrect: true,
                explanation: "Correct - Uses filter then map properly with appropriate array methods"
              },
              {
                id: "B", 
                code: "const processData = (items) => {\n  return items.map(item => item.active).filter(item => item.name);\n};",
                isCorrect: false,
                explanation: "Bug: Wrong array method order - Maps booleans then tries to filter by name property"
              },
              {
                id: "C",
                code: "const processData = (items) => {\n  const result = [];\n  items.forEach(item => {\n    if (item.active == true) result.push(item.name);\n  });\n  return result;\n};",
                isCorrect: false,
                explanation: "Bug: Type coercion issue - Uses == instead of === for boolean comparison"
              },
              {
                id: "D",
                code: "const processData = (items) => {\n  return items.reduce((acc, item) => {\n    if (item.active) acc.push(item.name);\n    return acc;\n  }, []);\n};",
                isCorrect: false,
                explanation: "Bug: Overcomplicated - Uses reduce when filter+map is clearer and more readable"
              }
            ]
          }
        }];
      }
    }
    
    // Ensure quizCards is an array
    if (!Array.isArray(quizCards)) {
      quizCards = [quizCards];
    }
    
    console.log('Quiz generation successful, returning cards:', quizCards.length);
    return quizCards;

  } catch (error) {
    console.error("Quiz Generation Error:", error);
    
    // Return a fallback quiz for any other errors
    return [{
      snippet: "String Processing Function - Handles text manipulation and validation",
      quiz: {
        type: "function-variant",
        question: "Which version implements efficient string manipulation without performance issues?",
        variants: [
          {
            id: "A",
            code: "const formatMessage = (name, age) => {\n  return 'Hello ' + name + ', you are ' + age + ' years old!';\n};",
            isCorrect: false,
            explanation: "Bug: String concatenation - Uses + instead of template literals for complex strings"
          },
          {
            id: "B", 
                            code: "const formatMessage = (name, age) => {\n  return 'Hello ' + name + ', you are ' + age + ' years old!';\n};",
            isCorrect: true,
            explanation: "Correct - Uses template literals for clean and efficient string interpolation"
          },
          {
            id: "C",
            code: "const formatMessage = (name, age) => {\n  return 'Hello '.concat(name).concat(', you are ').concat(age).concat(' years old!');\n};",
            isCorrect: false,
            explanation: "Bug: Overcomplicated - Uses concat() method chaining instead of template literals"
          },
          {
            id: "D",
            code: "const formatMessage = (name, age) => {\n  return ['Hello ', name, ', you are ', age, ' years old!'].join('');\n};",
            isCorrect: false,
            explanation: "Bug: Inefficient - Creates array and joins instead of using template literals"
          }
        ]
      }
    }];
  }
}

export async function generateFunctionVariantQuiz(repoFiles, language) {
  const functionVariantPrompt = `
🎯 OBJECTIVE:
Generate "function variant" quiz questions from real ${language} code in a user's uploaded repository.
Each question will display **4 versions of a real function**, with subtle differences:
- Only **1 is correct** (the original function)
- The other 3 contain **small but important errors** (e.g., bug, missing param, bad logic)

The user must **identify the correct version** — this trains their pattern recognition and debugging skills.

📂 INPUT FORMAT:
You will receive a variable called repoFiles, which is an array like this:
\`\`\`js
[
  {
    path: "src/utils/math.js",
    content: \`
export function double(arr) {
  return arr.map(num => num * 2);
}

export function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}
    \`
  },
  ...
]
\`\`\`

🎯 REQUIREMENTS:
1. Find **real functions** from the codebase (not contrived examples)
2. Use **actual function names and logic** from the provided code
3. Create **subtle but meaningful bugs** in variants B, C, D
4. Ensure bugs are **realistic** (wrong operators, missing checks, off-by-one errors)
5. Keep code snippets **concise but complete**

📝 OUTPUT FORMAT:
Generate 3-5 function variant questions in this JSON format:

[
  {
    "snippet": "Original function code snippet",
    "quiz": {
      "type": "function-variant",
      "question": "Which version of this function is correct? Look for subtle bugs in the logic.",
      "variants": [
        {
          "id": "A",
          "code": "// Version A - CORRECT\\nfunction example(arr) {\\n  return arr.map(x => x * 2);\\n}",
          "isCorrect": true,
          "explanation": "This is the original, correct implementation."
        },
        {
          "id": "B",
          "code": "// Version B - BUG: Wrong operator\\nfunction example(arr) {\\n  return arr.map(x => x + 2);\\n}",
          "isCorrect": false,
          "explanation": "Bug: Uses addition instead of multiplication."
        },
        {
          "id": "C",
          "code": "// Version C - BUG: Off-by-one error\\nfunction example(arr) {\\n  return arr.map(x => x * 2 + 1);\\n}",
          "isCorrect": false,
          "explanation": "Bug: Adds 1 to each element, changing the logic."
        },
        {
          "id": "D",
          "code": "// Version D - BUG: Missing edge case\\nfunction example(arr) {\\n  if (arr.length === 0) return [];\\n  return arr.map(x => x * 2);\\n}",
          "isCorrect": false,
          "explanation": "Bug: Unnecessary edge case handling that changes behavior."
        }
      ],
      "resource": {
        "title": "Debugging and Code Review",
        "link": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling"
      }
    }
  }
]

🐛 BUG TYPES TO INCLUDE:
- **Off-by-one errors**: \`i < arr.length\` vs \`i <= arr.length\`
- **Wrong operators**: \`===\` vs \`==\`, \`&&\` vs \`||\`  
- **Missing edge cases**: null checks, empty arrays
- **Incorrect method calls**: \`map\` vs \`filter\`, \`push\` vs \`concat\`
- **Missing return statements**
- **Wrong variable names or scope issues**

Return ONLY the JSON array.
`;

  const prompt = `
${functionVariantPrompt}

Repository files to analyze:
${repoFiles.map(file => `\nFile: ${file.path}\n\`\`\`${language}\n${file.content}\n\`\`\``).join('\n')}

Generate 3-5 function variant questions from the actual functions found in this codebase.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert ${language} instructor who creates challenging function variant quiz questions that test debugging and pattern recognition skills.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 3000,
    temperature: 0.7,
  });

  let text = completion.choices[0].message.content.trim();
  console.log('Raw OpenAI function variant response:', text);
  
  // Extract JSON from response
  let extractedText = text;
  
  // Try to extract from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    extractedText = codeBlockMatch[1].trim();
  } else {
    // Try to extract JSON array
    const jsonArrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonArrayMatch) {
      extractedText = jsonArrayMatch[0];
    }
  }
  
  console.log('Extracted function variant JSON:', extractedText);
  
  let quizCards;
  try {
    quizCards = JSON.parse(extractedText);
  } catch (parseError) {
    console.error('Function variant JSON parse error:', parseError);
    return [];
  }

  return quizCards;
}