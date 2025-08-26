export const javascriptPrompts = {
  functionVariant: {
    system: `You are an expert JavaScript instructor specializing in debugging and code analysis.

IMPORTANT: Always create SHORT, FOCUSED function variants (5-10 lines max). Extract only the relevant part that contains the bug, not full implementations.`,
    
    user: (code) => `Analyze this JavaScript code and create function-variant quiz questions:

${code}

⚠️ CRITICAL: KEEP FUNCTIONS SHORT! Each variant should be 5-10 lines maximum. Extract only the relevant part with the bug.

🎯 VARIETY REQUIREMENT: Each quiz should use DIFFERENT bug types. Don't repeat the same bugs across questions.

🚀 CREATIVITY REQUIREMENT: Think outside the box! Create unique, unexpected bugs that test deep JavaScript knowledge. Don't just use the obvious mistakes - create subtle, realistic bugs that even experienced developers might miss.

CRITICAL REQUIREMENTS:
1. Find 2-3 REAL functions from the provided code
2. Create function-variant questions with 4 versions each
3. Only 1 version is correct, 3 have subtle but realistic bugs
4. Include SAMPLE OUTPUT for each variant showing what happens when executed
5. Create MASSIVELY DIVERSE and CREATIVE bugs across ALL JavaScript concepts:

ARRAY & FUNCTIONAL PROGRAMMING:
- Using 'filter()' instead of 'map()', 'reduce()' instead of 'forEach()'
- Wrong array method chains: 'map().filter()' vs 'filter().map()'
- Array destructuring errors: 'const [a, b] = object' instead of 'const {a, b} = object'
- Spread operator misuse: '[...object]' instead of '{...object}'
- Array-like object confusion: treating 'arguments' as array
- Wrong array initialization: 'new Array(5)' vs 'Array(5).fill(0)'

OBJECT & DATA STRUCTURES:
- Property access errors: 'obj[key]' vs 'obj.key' when key is dynamic
- Object destructuring with wrong property names
- Deep cloning vs shallow copying mistakes
- Object method binding issues: 'this' context problems
- JSON parsing/stringifying edge cases
- Object property enumeration order issues

TYPE COERCION & COMPARISONS:
- '==' vs '===' in different contexts
- Truthy/falsy value confusion
- Number precision issues: '0.1 + 0.2 !== 0.3'
- String vs number comparisons
- Boolean conversion mistakes
- Null vs undefined handling

SCOPE & CLOSURES:
- 'var' vs 'let' vs 'const' in loops
- Closure variable capture in async contexts
- Block scope vs function scope confusion
- Temporal dead zone issues
- Hoisting misconceptions
- Module scope vs global scope

ASYNC PATTERNS:
- Promise chain vs async/await confusion
- Missing 'await' in async functions
- Promise.all() vs Promise.race() misuse
- Error handling in promise chains
- Async function return value confusion
- Event loop timing issues

STRING & REGEX:
- Template literal vs concatenation
- Regex flag confusion: 'g', 'i', 'm' flags
- String method chaining errors
- Unicode handling issues
- Escape sequence problems
- String immutability misconceptions

EVENT HANDLING:
- Event listener cleanup issues
- Event delegation mistakes
- Event object property access
- Custom event handling
- Event bubbling vs capturing
- Event handler binding context

ERROR HANDLING:
- Try/catch placement errors
- Error propagation issues
- Custom error class inheritance
- Error boundary implementation
- Unhandled promise rejections
- Error object property access

PERFORMANCE & OPTIMIZATION:
- Nested loop inefficiencies
- Memory leak patterns
- Debouncing vs throttling confusion
- Caching strategy mistakes
- Algorithm complexity issues
- DOM manipulation optimization

ADVANCED CONCEPTS:
- Generator function syntax
- Iterator protocol implementation
- Proxy object usage
- Reflect API mistakes
- Symbol usage errors
- WeakMap/WeakSet misconceptions
- BigInt vs Number confusion
- Optional chaining vs nullish coalescing
- Dynamic imports vs static imports
- Worker thread communication
- SharedArrayBuffer usage
- Atomics API mistakes
6. Randomize correct answer position (A, B, C, or D)
7. Keep explanations concise but specific
8. Use actual code from the provided files, NOT generic examples
9. KEEP FUNCTIONS SHORT (max 8-10 lines) - focus on the specific bug, not full implementations
10. HIGHLIGHT THE DIFFERENCE - make the bug obvious when comparing variants
11. AVOID LONG FUNCTIONS - extract only the relevant part that contains the bug
12. FOCUS ON THE BUG - don't show full implementations, just the part that differs
13. MAXIMUM 10 LINES PER FUNCTION - if longer, extract only the buggy part
14. NO BOILERPLATE - skip setup code, focus on the critical lines with bugs
15. SHORT AND FOCUSED - each variant should be 5-10 lines max

EXAMPLE FORMAT:
{
  "snippet": "File Upload Handler - Validates and stores uploaded files",
  "quiz": {
    "type": "function-variant",
    "question": "Which version correctly validates input?",
    "variants": [
      {
        "id": "A",
        "code": "app.post('/uploadFiles', (req, res) => {\n  const { files } = req.body;\n  storedFiles = files;\n  res.json({ success: true });\n});",
        "isCorrect": false,
        "explanation": "Bug: Missing input validation",
        "sampleOutput": "Error: Cannot read property 'length' of undefined"
      },
      {
        "id": "B", 
        "code": "app.post('/uploadFiles', (req, res) => {\n  const { files } = req.body;\n  if (!files || !Array.isArray(files)) {\n    return res.status(400).json({ error: 'Invalid files' });\n  }\n  storedFiles = files;\n  res.json({ success: true });\n});",
        "isCorrect": true,
        "explanation": "Correct - Validates files array",
        "sampleOutput": "Success: 3 files uploaded"
      }
    ]
  }
}

CONCRETE BUG EXAMPLES TO INSPIRE VARIETY:

ARRAY BUGS:
- \`items.map(x => x.active).filter(x => x.name)\` // Wrong: filtering booleans for name property
- \`const [first, second] = {a: 1, b: 2}\` // Wrong: array destructuring on object
- \`[...user]\` instead of \`{...user}\` // Wrong: spreading object into array
- \`Array(5).map(x => x * 2)\` // Wrong: sparse array, map skips empty slots

OBJECT BUGS:
- \`obj.key\` when key is variable // Wrong: should be obj[key]
- \`const {name, age} = user; return age + 1;\` // Wrong: age might be string
- \`JSON.parse(JSON.stringify(obj))\` // Wrong: loses functions, undefined, etc.
- \`Object.keys(obj).forEach(key => obj[key] = obj[key] * 2)\` // Wrong: mutates during iteration

TYPE BUGS:
- \`if (user.age == 18)\` // Wrong: string "18" vs number 18
- \`const isAdult = user.age >= 18 ? true : false\` // Wrong: redundant boolean conversion
- \`0.1 + 0.2 === 0.3\` // Wrong: floating point precision
- \`if (user.name)\` // Wrong: empty string is falsy

SCOPE BUGS:
- \`for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }\` // Wrong: closure captures final value
- \`const x = 1; { const x = 2; } console.log(x);\` // Wrong: block scope confusion
- \`function test() { console.log(x); const x = 1; }\` // Wrong: temporal dead zone

ASYNC BUGS:
- \`async function test() { return fetch('/api'); }\` // Wrong: returns promise, not data
- \`Promise.all([fetch('/a'), fetch('/b')]).then(results => results[0])\` // Wrong: results is array
- \`setTimeout(() => console.log('done'), 1000); console.log('immediate');\` // Wrong: async timing

STRING BUGS:
- \`'Hello ' + name + '!'\` // Wrong: template literal would be cleaner
- \`str.replace('a', 'b')\` // Wrong: only replaces first occurrence
- \`/\\d+/g.test('123')\` // Wrong: test() with global flag has side effects

EVENT BUGS:
- \`element.addEventListener('click', handler);\` // Wrong: no cleanup, memory leak
- \`event.target\` vs \`event.currentTarget\` confusion
- \`setTimeout(handler, 1000);\` // Wrong: should clear timeout on unmount

ERROR BUGS:
- \`try { riskyOperation(); } catch (e) { console.log(e); }\` // Wrong: swallows error
- \`throw 'error'\` // Wrong: should throw Error object
- \`Promise.reject('error')\` // Wrong: unhandled rejection

PERFORMANCE BUGS:
- \`for (let i = 0; i < arr.length; i++)\` // Wrong: length accessed in each iteration
- \`arr.filter(x => x.active).map(x => x.name)\` // Wrong: two iterations instead of one
- \`document.getElementById('el').style.color = 'red'\` // Wrong: multiple DOM queries

Return ONLY valid JSON array.`,

    fallback: {
      snippet: "User Data Processing",
      quiz: {
        type: "function-variant",
        question: "Which version correctly handles user data with proper type checking?",
        variants: [
          {
            id: "A",
            code: `const processUser = (user) => {
  const { name, age } = user;
  return {
    displayName: name || 'Anonymous',
    isAdult: age >= 18,
    birthYear: new Date().getFullYear() - age
  };
};`,
            isCorrect: true,
            explanation: "Correct - Proper destructuring and type-safe comparisons",
            sampleOutput: "{ displayName: 'John', isAdult: true, birthYear: 1990 }"
          },
          {
            id: "B",
            code: `const processUser = (user) => {
  const [name, age] = user;
  return {
    displayName: name || 'Anonymous',
    isAdult: age == 18,
    birthYear: new Date().getFullYear() - age
  };
};`,
            isCorrect: false,
            explanation: "Bug: Array destructuring on object + loose equality",
            sampleOutput: "Error: Cannot destructure property 'name' of undefined"
          },
          {
            id: "C",
            code: `const processUser = (user) => {
  return {
    displayName: user.name || 'Anonymous',
    isAdult: user.age >= 18 ? true : false,
    birthYear: new Date().getFullYear() - user.age
  };
};`,
            isCorrect: false,
            explanation: "Bug: Redundant boolean conversion + potential string math",
            sampleOutput: "{ displayName: 'John', isAdult: true, birthYear: NaN }"
          },
          {
            id: "D",
            code: `const processUser = (user) => {
  const { name, age } = user;
  return {
    displayName: name ? name : 'Anonymous',
    isAdult: age >= 18,
    birthYear: new Date().getFullYear() - parseInt(age)
  };
};`,
            isCorrect: false,
            explanation: "Bug: Overcomplicated ternary + unnecessary parseInt",
            sampleOutput: "{ displayName: 'John', isAdult: true, birthYear: 1990 }"
          }
        ]
      }
    }
  },

  multipleChoice: {
    system: `You are an expert JavaScript instructor.`,
    
    user: (code) => `Create 5 multiple-choice questions from this JavaScript code:

${code}

Requirements:
- Focus on advanced JavaScript concepts
- Test actual code understanding, not basic syntax
- Include questions about async/await, closures, scope, error handling
- Make questions challenging but fair
- Use real code examples from the provided files

Return ONLY valid JSON array.`,

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
