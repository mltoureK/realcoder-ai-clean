import { javascriptPrompts } from '../prompts/javascriptPrompts.mjs';
import { pythonPrompts } from '../prompts/pythonPrompts.mjs';

export class FunctionVariantQuiz {
  constructor() {
    this.languagePrompts = {
      javascript: javascriptPrompts,
      python: pythonPrompts,
      // Add more languages as needed
    };
  }

  async generateQuiz(code, language, openai) {
    const prompts = this.languagePrompts[language.toLowerCase()] || this.languagePrompts.javascript;
    const promptConfig = prompts.functionVariant;

    // Add randomization to ensure variety
    const randomSeed = Math.floor(Math.random() * 1000);
    const bugCategories = [
      'ARRAY & FUNCTIONAL PROGRAMMING - focus on filter/map/reduce confusion, destructuring errors, spread operator misuse',
      'OBJECT & DATA STRUCTURES - focus on property access, destructuring, cloning, method binding issues',
      'TYPE COERCION & COMPARISONS - focus on == vs ===, truthy/falsy, number precision, boolean conversion',
      'SCOPE & CLOSURES - focus on var/let/const, closure capture, temporal dead zone, hoisting',
      'ASYNC PATTERNS - focus on Promise chains, missing await, Promise.all vs race, error handling',
      'STRING & REGEX - focus on template literals, regex flags, string methods, Unicode handling',
      'EVENT HANDLING - focus on listener cleanup, event delegation, event object properties',
      'ERROR HANDLING - focus on try/catch placement, error propagation, custom errors',
      'PERFORMANCE & OPTIMIZATION - focus on nested loops, memory leaks, caching, DOM optimization',
      'ADVANCED CONCEPTS - focus on generators, iterators, Proxy, Reflect, Symbols, BigInt'
    ];
    
    const selectedCategory = bugCategories[randomSeed % bugCategories.length];
    const secondaryCategory = bugCategories[(randomSeed + 1) % bugCategories.length];
    
    const enhancedSystem = `${promptConfig.system}

🎯 RANDOMIZATION SEED: ${randomSeed}
🎯 PRIMARY FOCUS: ${selectedCategory}
🎯 SECONDARY FOCUS: ${secondaryCategory}

CRITICAL: Each quiz question must use DIFFERENT bug types from the categories above. 
NO REPETITION of the same bug patterns across questions.
Mix and match from both primary and secondary categories for maximum variety.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: enhancedSystem },
          { role: "user", content: promptConfig.user(code) }
        ],
        max_tokens: 6000,
        temperature: 0.8, // Increased temperature for more variety
      });

      let text = completion.choices[0].message.content.trim();
      console.log('Raw OpenAI response:', text);
      
      // Extract JSON from response
      let extractedText = this.extractJSON(text);
      console.log('Extracted JSON text:', extractedText);
      
      let quizCards = this.parseQuizCards(extractedText);
      
      // Ensure quizCards is an array
      if (!Array.isArray(quizCards)) {
        quizCards = [quizCards];
      }
      
      // Post-process to ensure variety and quality
      quizCards = quizCards.map(card => this.cleanQuizCard(card)).filter(Boolean);
      
      // Ensure we have variety in bug types
      quizCards = this.ensureVariety(quizCards);
      
      // Ensure functions are kept short (max 10 lines)
      quizCards = this.ensureShortFunctions(quizCards);
      
      console.log('Quiz generation successful, returning cards:', quizCards.length);
      return quizCards;

    } catch (error) {
      console.log('Error generating function variant quiz:', error);
      return [promptConfig.fallback];
    }
  }

  extractJSON(text) {
    // Try to extract from markdown code block
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    
    // Try to extract JSON array
    const jsonArrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonArrayMatch) {
      return jsonArrayMatch[0];
    }
    
    return text;
  }

  parseQuizCards(extractedText) {
    try {
      return JSON.parse(extractedText);
    } catch (parseError) {
      console.log('JSON parse error:', parseError);
      console.log('Failed to parse:', extractedText);
      
      // Try second parsing attempt with just the array part
      try {
        const arrayMatch = extractedText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          return JSON.parse(arrayMatch[0]);
        } else {
          throw parseError;
        }
      } catch (secondParseError) {
        console.log('Second parse attempt failed:', secondParseError);
        throw secondParseError;
      }
    }
  }

  validateQuizCard(card) {
    if (!card.quiz || !card.quiz.type || card.quiz.type !== 'function-variant') {
      return false;
    }

    if (!card.quiz.variants || !Array.isArray(card.quiz.variants)) {
      return false;
    }

    // Check that exactly one variant is correct
    const correctVariants = card.quiz.variants.filter(v => v.isCorrect);
    if (correctVariants.length !== 1) {
      return false;
    }

    // Validate each variant has required fields
    for (const variant of card.quiz.variants) {
      if (!variant.id || !variant.code || typeof variant.isCorrect !== 'boolean') {
        return false;
      }
    }

    return true;
  }

  cleanQuizCard(card) {
    if (!this.validateQuizCard(card)) {
      return null;
    }

    // Ensure all variants have sampleOutput and are short
    card.quiz.variants = card.quiz.variants.map(variant => ({
      ...variant,
      code: this.shortenCode(variant.code),
      sampleOutput: variant.sampleOutput || this.generateSampleOutput(variant)
    }));

    return card;
  }

  shortenCode(code) {
    if (!code) return code;
    
    const lines = code.split('\n');
    if (lines.length <= 10) return code; // Already short enough
    
    // If too long, try to extract the core logic
    const coreLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && 
             !trimmed.startsWith('//') && 
             !trimmed.startsWith('/*') &&
             !trimmed.includes('console.log') &&
             !trimmed.includes('console.error');
    });
    
    // Take first 8-10 lines that contain actual logic
    return coreLines.slice(0, 10).join('\n');
  }

  generateSampleOutput(variant) {
    // Generate a sample output based on the bug type
    if (!variant.isCorrect) {
      const explanation = variant.explanation.toLowerCase();
      
      if (explanation.includes('null') || explanation.includes('undefined')) {
        return "Error: Cannot read property 'length' of null";
      }
      if (explanation.includes('await') || explanation.includes('async')) {
        return "Error: await is only valid in async function";
      }
      if (explanation.includes('syntax')) {
        return "SyntaxError: Unexpected token";
      }
      if (explanation.includes('type')) {
        return "TypeError: Cannot read property of undefined";
      }
      if (explanation.includes('filter') || explanation.includes('map')) {
        return "Error: filter is not a function";
      }
      if (explanation.includes('array')) {
        return "Error: Cannot read property 'forEach' of undefined";
      }
      if (explanation.includes('object')) {
        return "Error: Cannot read property 'length' of object";
      }
      if (explanation.includes('regex') || explanation.includes('match')) {
        return "Error: match is not a function";
      }
      if (explanation.includes('destructuring')) {
        return "Error: Cannot destructure property of undefined";
      }
      if (explanation.includes('scope') || explanation.includes('closure')) {
        return "Error: Cannot access variable before initialization";
      }
      
      return "Error: Unexpected behavior";
    } else {
      return "Success: Operation completed successfully";
    }
  }

  ensureVariety(quizCards) {
    // Track bug types to ensure variety
    const usedBugTypes = new Set();
    const repetitivePatterns = [
      'memory leak', 'race condition', 'security vulnerability', 
      'input validation', 'error handling', 'async operation'
    ];
    
    return quizCards.map(card => {
      if (!card.quiz || !card.quiz.variants) return card;
      
      // Check for variety in bug types
      const bugTypes = card.quiz.variants
        .filter(v => !v.isCorrect)
        .map(v => this.extractBugType(v.explanation));
      
      // Check for repetitive patterns
      const hasRepetitivePattern = card.quiz.variants
        .filter(v => !v.isCorrect)
        .some(v => repetitivePatterns.some(pattern => 
          v.explanation.toLowerCase().includes(pattern)
        ));
      
      // If all bug types are the same or uses repetitive patterns, diversify
      if ((bugTypes.length > 0 && new Set(bugTypes).size === 1) || hasRepetitivePattern) {
        card.quiz.variants = this.diversifyVariants(card.quiz.variants);
      }
      
      return card;
    });
  }

  ensureShortFunctions(quizCards) {
    return quizCards.map(card => {
      if (!card.quiz || !card.quiz.variants) return card;
      
      card.quiz.variants = card.quiz.variants.map(variant => {
        if (!variant.code) return variant;
        
        // Count lines in the code
        const lines = variant.code.split('\n').filter(line => line.trim().length > 0);
        
        if (lines.length > 10) {
          // If function is too long, extract just the core logic (first 10 lines)
          const shortCode = lines.slice(0, 10).join('\n');
          
          // Add ellipsis if we truncated
          if (lines.length > 10) {
            variant.code = shortCode + '\n  // ... rest of function';
          } else {
            variant.code = shortCode;
          }
        }
        
        return variant;
      });
      
      return card;
    });
  }

  extractBugType(explanation) {
    const lower = explanation.toLowerCase();
    if (lower.includes('array') || lower.includes('filter') || lower.includes('map')) return 'array';
    if (lower.includes('object') || lower.includes('property')) return 'object';
    if (lower.includes('async') || lower.includes('await') || lower.includes('promise')) return 'async';
    if (lower.includes('scope') || lower.includes('closure')) return 'scope';
    if (lower.includes('type') || lower.includes('coercion')) return 'type';
    if (lower.includes('security') || lower.includes('injection')) return 'security';
    if (lower.includes('memory') || lower.includes('leak')) return 'memory';
    if (lower.includes('race') || lower.includes('concurrency')) return 'concurrency';
    return 'general';
  }

  diversifyVariants(variants) {
    // Create more diverse bug types if all are the same
    const bugTypeExamples = [
      'Array destructuring on object instead of object destructuring',
      'Wrong array method chain: map().filter() instead of filter().map()',
      'Type coercion: == instead of === for strict comparison',
      'Scope issue: var in loop causing closure capture problems',
      'Async mistake: missing await in async function',
      'String manipulation: template literal vs concatenation',
      'Event handling: missing event listener cleanup',
      'Error handling: try/catch swallows error instead of re-throwing',
      'Performance: nested loops instead of optimized algorithm',
      'Object property access: obj.key instead of obj[key] for dynamic keys',
      'Promise chain confusion: Promise.all() vs Promise.race()',
      'Regex flag misuse: global flag with test() method',
      'Memory leak: setTimeout without clearTimeout',
      'Destructuring error: wrong property names in object destructuring',
      'Boolean conversion: redundant ternary for boolean conversion',
      'Spread operator misuse: [...object] instead of {...object}',
      'Event delegation: wrong event target vs currentTarget',
      'Number precision: floating point arithmetic issues',
      'Iterator protocol: wrong implementation of custom iterator',
      'Proxy usage: incorrect trap implementation'
    ];
    
    return variants.map((variant, index) => {
      if (!variant.isCorrect && index < bugTypeExamples.length) {
        return {
          ...variant,
          explanation: `Bug: ${bugTypeExamples[index]}`
        };
      }
      return variant;
    });
  }
}
