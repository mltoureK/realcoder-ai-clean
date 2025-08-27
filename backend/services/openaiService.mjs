import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function generateQuizFromCode(code, language, message = '') {
  try {
    console.log(`Generating quiz for language: ${language}, code length: ${code.length}`);
    
    // Truncate code if too large to prevent token limits
    const maxCodeLength = 50000;
    if (code.length > maxCodeLength) {
      console.log(`Code too large (${code.length} chars), truncating to ${maxCodeLength} chars`);
      code = code.substring(0, maxCodeLength);
    }

    console.log('Calling generateQuizFromCode...');

    // Import language-specific prompts
    let prompts;
    try {
      if (language.toLowerCase() === 'javascript') {
        const { javascriptPrompts } = await import('./prompts/javascriptPrompts.mjs');
        prompts = javascriptPrompts;
      } else {
        // For other languages, use a default prompt
        prompts = {
          multipleChoice: {
            system: `You are an expert ${language} instructor. Create questions based on the actual code provided.`,
            user: (code) => `Analyze this ${language} code and create 5 multiple-choice questions based on ACTUAL code patterns and functions found:

${code}

Requirements:
- Extract actual functions, methods, and patterns from the provided code
- Focus on advanced ${language} concepts found in the code
- Test understanding of the specific code structure and patterns
- Make questions challenging but fair
- Use actual function names, variable names, and patterns from the provided files

Return ONLY valid JSON array.`
          }
        };
      }
    } catch (error) {
      console.error('Error importing language prompts:', error);
      // Fallback to default prompt
      prompts = {
        multipleChoice: {
          system: `You are an expert ${language} instructor.`,
          user: (code) => `Create 5 multiple-choice questions from this ${language} code:

${code}

Requirements:
- Focus on advanced ${language} concepts
- Test actual code understanding, not basic syntax
- Make questions challenging but fair

Return ONLY valid JSON array.`
        }
      };
    }

    // Use the language-specific prompts for multiple-choice questions
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: prompts.multipleChoice.system
        },
        {
          role: "user",
          content: prompts.multipleChoice.user(code)
        }
      ],
      max_tokens: 3000,
      temperature: 0.7,
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
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse:', extractedText);
      
      // Return fallback quiz if parsing fails
      return [prompts.multipleChoice.fallback || {
        snippet: "Code Analysis",
        quiz: {
          type: "multiple-choice",
          question: "What is the primary purpose of this code?",
          options: [
            "To process data",
            "To handle user input", 
            "To manage application state",
            "To perform calculations"
          ],
          answer: "A",
          explanation: "This code processes data from various sources."
        }
      }];
    }

    // Post-process to ensure multiple-choice format
    quizCards = quizCards.map(card => {
      // Ensure it's multiple-choice format
      if (card.quiz && card.quiz.type !== 'multiple-choice') {
        card.quiz.type = 'multiple-choice';
      }
      
      // Convert function-variant format to multiple-choice if needed
      if (card.quiz && card.quiz.variants) {
        const correctVariant = card.quiz.variants.find(v => v.isCorrect);
        const correctAnswer = correctVariant ? correctVariant.id : 'A';
        
        card.quiz.options = card.quiz.variants.map(v => v.explanation || `Option ${v.id}`);
        card.quiz.answer = correctAnswer;
        card.quiz.explanation = correctVariant ? correctVariant.explanation : "This is the correct answer.";
        
        // Remove variants array
        delete card.quiz.variants;
      }
      
      // Ensure it has options array
      if (card.quiz && !card.quiz.options) {
        card.quiz.options = ['Option A', 'Option B', 'Option C', 'Option D'];
      }
      
      // Ensure it has a valid answer
      if (card.quiz && !card.quiz.answer) {
        card.quiz.answer = 'A';
      }
      
      // Ensure answer is a string (A, B, C, or D)
      if (card.quiz && typeof card.quiz.answer === 'object') {
        card.quiz.answer = 'A';
      }
      
      return card;
    });
    
    console.log('Quiz generation successful, returning cards:', quizCards.length);
    return quizCards;
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw error;
  }
}