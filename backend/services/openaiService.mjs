
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

// Language-specific prompts
const languagePrompts = {
  'javascript': `
You are an expert JavaScript instructor. Analyze this JavaScript code and create 5 challenging quiz questions that test deep understanding of JavaScript-specific programming concepts.

Focus on JavaScript-specific concepts like:
- Closures and scope (lexical scoping)
- Promises, async/await, and asynchronous programming
- Event handling and the event loop
- Array methods (map, filter, reduce, etc.)
- Object destructuring and spread operators
- Template literals and string manipulation
- Error handling with try/catch
- Memory management and garbage collection
- Hoisting and temporal dead zone
- Prototypes and inheritance
- Module systems (ES6 modules vs CommonJS)
- Callbacks and higher-order functions
- Arrow functions and 'this' binding

Avoid generic questions like "What does this function do?"

Instead, ask JavaScript-specific questions like:
- "What would happen if we used 'var' instead of 'const' in this scope?"
- "How does the event loop handle this async operation?"
- "What closure is created by this function?"
- "How would you refactor this using modern JavaScript features?"
- "What's the difference between using '==' and '===' in this comparison?"
- "How does hoisting affect the execution of this code?"
- "What would be the output of this Promise chain?"
- "How does 'this' binding work in this arrow function?"`,

  'python': `
You are an expert Python instructor. Analyze this Python code and create 5 challenging quiz questions that test deep understanding of Python-specific programming concepts.

Focus on Python-specific concepts like:
- List comprehensions and generator expressions
- Decorators and function wrappers
- Context managers and 'with' statements
- Exception handling and custom exceptions
- Class inheritance and multiple inheritance
- Magic methods (__init__, __str__, etc.)
- Lambda functions and functional programming
- Module imports and namespace packages
- Type hints and type checking
- Async programming with asyncio
- Memory management and reference counting
- PEP 8 style guidelines
- List vs tuple vs set differences
- Dictionary comprehensions and defaultdict

Ask Python-specific questions like:
- "What would happen if we used a list instead of a tuple here?"
- "How would you optimize this list comprehension?"
- "What's the difference between 'is' and '==' in this comparison?"
- "How does Python's GIL affect this multithreaded code?"
- "What would be the output of this generator expression?"
- "How would you refactor this using a context manager?"
- "What's the difference between shallow and deep copy here?"`,

  'java': `
You are an expert Java instructor. Analyze this Java code and create 5 challenging quiz questions that test deep understanding of Java-specific programming concepts.

Focus on Java-specific concepts like:
- Object-oriented programming principles
- Inheritance and polymorphism
- Interfaces and abstract classes
- Exception handling and checked exceptions
- Generics and type erasure
- Collections framework (List, Set, Map)
- Stream API and functional programming
- Threading and concurrency
- Memory management and garbage collection
- Access modifiers and encapsulation
- Method overloading and overriding
- Static vs instance methods
- Final keyword and immutability
- Lambda expressions and method references

Ask Java-specific questions like:
- "What would happen if we removed 'final' from this variable?"
- "How does Java's pass-by-value affect this method call?"
- "What's the difference between ArrayList and LinkedList here?"
- "How would you handle this checked exception?"
- "What's the output of this stream operation?"
- "How does polymorphism work in this inheritance hierarchy?"
- "What's the difference between '==' and '.equals()' here?"`,

  'cpp': `
You are an expert C++ instructor. Analyze this C++ code and create 5 challenging quiz questions that test deep understanding of C++-specific programming concepts.

Focus on C++-specific concepts like:
- Pointers and references
- Memory management and RAII
- Templates and generic programming
- STL containers and algorithms
- Move semantics and rvalue references
- Smart pointers (unique_ptr, shared_ptr)
- Exception handling and RAII
- Virtual functions and polymorphism
- Operator overloading
- Namespaces and scope resolution
- Const correctness
- Copy constructors and assignment operators
- Lambda expressions and function objects
- Template metaprogramming

Ask C++-specific questions like:
- "What would happen if we used a raw pointer instead of smart_ptr?"
- "How does move semantics optimize this operation?"
- "What's the difference between 'const' and 'constexpr' here?"
- "How would you prevent memory leaks in this code?"
- "What's the output of this template instantiation?"
- "How does RAII ensure resource cleanup here?"
- "What's the difference between '&' and '&&' in this function signature?"`,

  'csharp': `
You are an expert C# instructor. Analyze this C# code and create 5 challenging quiz questions that test deep understanding of C#-specific programming concepts.

Focus on C#-specific concepts like:
- LINQ and query expressions
- Properties and auto-implemented properties
- Delegates and events
- Async/await and Task-based programming
- Generics and type constraints
- Extension methods
- Lambda expressions and expression trees
- Nullable reference types
- Pattern matching
- Records and value types
- Dependency injection and IoC
- Attributes and reflection
- Exception handling and custom exceptions
- Memory management and garbage collection

Ask C#-specific questions like:
- "What would happen if we used 'var' instead of explicit typing?"
- "How does LINQ's deferred execution affect this query?"
- "What's the difference between 'ref' and 'out' parameters?"
- "How would you optimize this async method?"
- "What's the output of this pattern matching expression?"
- "How does boxing/unboxing affect performance here?"
- "What's the difference between 'readonly' and 'const' here?"`
};

export async function generateQuizFromCode(code, language, message) {
  // Get language-specific prompt or fallback to generic
  const languagePrompt = languagePrompts[language.toLowerCase()] || `
You are an expert programming instructor. Analyze this ${language} code and create 5 challenging quiz questions that test deep understanding of programming concepts.

Focus on:
- Code logic and algorithms
- Data structures and patterns
- Error handling and edge cases
- Performance considerations
- Best practices and code quality
- Debugging scenarios
- Code optimization opportunities

Avoid basic questions like "What does this function do?"

Instead, ask questions like:
- "What would happen if we removed the error handling?"
- "How could we optimize this algorithm?"
- "What edge case is this code missing?"
- "How would you refactor this for maintainability?"
- "What security vulnerability exists here?"`;

  const prompt = `
${languagePrompt}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Generate 5 quiz cards in this JSON format:
[
  {
    "snippet": "relevant code snippet that demonstrates the concept",
    "quiz": {
      "type": "multiple-choice",
      "question": "Language-specific question about programming concepts",
      "options": [
        "Incorrect but plausible answer",
        "Correct answer",
        "Incorrect answer",
        "Incorrect answer"
      ],
      "answer": ["Correct answer"],
      "resource": {
        "title": "Relevant programming concept",
        "link": "https://developer.mozilla.org/en-US/docs/..."
      }
    }
  }
]

Focus on actual ${language} programming concepts, not just what the code does. Return ONLY the JSON array.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: `You are an expert ${language} instructor who creates challenging quiz questions that test deep understanding of ${language}-specific programming concepts.` },
      { role: "user", content: prompt }
    ],
    max_tokens: 2000,
    temperature: 0.8
  });

  let text = completion.choices[0].message.content.trim();
  console.log('Raw OpenAI response:', text);
  
  // More robust JSON extraction
  let extractedText = text;
  
  // Try to extract JSON from markdown code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    extractedText = codeBlockMatch[1].trim();
  } else {
    // Try to find JSON array or object in the text
    const jsonArrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonArrayMatch) {
      extractedText = jsonArrayMatch[0];
    } else {
      const jsonObjectMatch = text.match(/\{\s*"[\s\S]*"\s*:\s*[\s\S]*\}/);
      if (jsonObjectMatch) {
        extractedText = jsonObjectMatch[0];
      }
    }
  }
  
  console.log('Extracted JSON text:', extractedText);
  
  let quizCards;
  try {
    quizCards = JSON.parse(extractedText);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Failed to parse:', extractedText);
    
    // Try to fix common JSON issues
    try {
      // Remove any trailing text after the JSON
      const cleanedText = extractedText.replace(/[^}\]]*$/, '');
      quizCards = JSON.parse(cleanedText);
      console.log('Successfully parsed after cleaning');
    } catch (secondError) {
      console.error('Second parse attempt failed:', secondError);
      
      // If all parsing fails, create a fallback quiz
      console.log('Creating fallback quiz due to parsing failure');
      quizCards = [{
        snippet: "Code analysis failed - using fallback",
        quiz: {
          type: "multiple-choice",
          question: "What is the primary purpose of this code?",
          options: [
            "To process data",
            "To handle user input", 
            "To manage application state",
            "To perform calculations"
          ],
          answer: ["To process data"],
          resource: {
            title: "Code Analysis",
            link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
          }
        }
      }];
    }
  }
  
  // Ensure quizCards is always an array
  if (!Array.isArray(quizCards)) {
    if (quizCards && typeof quizCards === 'object') {
      quizCards = [quizCards]; // Convert single object to array
    } else {
      console.error('Unexpected quiz format:', quizCards);
      // Create fallback quiz instead of throwing error
      quizCards = [{
        snippet: "Code analysis failed - using fallback",
        quiz: {
          type: "multiple-choice",
          question: "What is the primary purpose of this code?",
          options: [
            "To process data",
            "To handle user input", 
            "To manage application state",
            "To perform calculations"
          ],
          answer: ["To process data"],
          resource: {
            title: "Code Analysis",
            link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
          }
        }
      }];
    }
  }
  
  // Validate and fix each quiz card
  quizCards.forEach((card, index) => {
    if (!card.quiz) {
      console.error(`Quiz card ${index} missing quiz property:`, card);
      // Fix the card instead of throwing error
      card.quiz = {
        type: "multiple-choice",
        question: "What is the purpose of this code?",
        options: [
          "To process data",
          "To handle user input", 
          "To manage application state",
          "To perform calculations"
        ],
        answer: ["To process data"],
        resource: {
          title: "Code Analysis",
          link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
        }
      };
    }
    
    if (!Array.isArray(card.quiz.answer)) {
      card.quiz.answer = [card.quiz.answer];
    }
  });

  return quizCards;
}
