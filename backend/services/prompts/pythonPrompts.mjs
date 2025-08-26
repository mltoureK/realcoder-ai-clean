export const pythonPrompts = {
  functionVariant: {
    system: `You are an expert Python instructor specializing in debugging and code analysis.`,
    
    user: (code) => `Analyze this Python code and create function-variant quiz questions:

${code}

CRITICAL REQUIREMENTS:
1. Find 2-3 REAL functions from the provided code
2. Create function-variant questions with 4 versions each
3. Only 1 version is correct, 3 have subtle but realistic bugs
4. Include SAMPLE OUTPUT for each variant showing what happens when executed
5. Make bugs diverse: missing exception handling, wrong indentation, incorrect variable names, missing imports, logic errors, etc.
6. Randomize correct answer position (A, B, C, or D)
7. Keep explanations concise but specific
8. Use actual code from the provided files, NOT generic examples

EXAMPLE FORMAT:
{
  "snippet": "Function description",
  "quiz": {
    "type": "function-variant",
    "question": "Which version correctly handles exceptions?",
    "variants": [
      {
        "id": "A",
        "code": "def process_data(data):\n    return data['items'][0]",
        "isCorrect": false,
        "explanation": "Bug: No exception handling",
        "sampleOutput": "KeyError: 'items'"
      },
      {
        "id": "B", 
        "code": "def process_data(data):\n    try:\n        return data['items'][0]\n    except (KeyError, IndexError):\n        return None",
        "isCorrect": true,
        "explanation": "Correct - Handles both KeyError and IndexError",
        "sampleOutput": "None"
      }
    ]
  }
}

Return ONLY valid JSON array.`,

    fallback: {
      snippet: "File Processor - Handles file operations safely",
      quiz: {
        type: "function-variant",
        question: "Which version correctly handles file operations and exceptions?",
        variants: [
          {
            id: "A",
            code: `def read_file(filename):
    with open(filename, 'r') as f:
        return f.read()`,
            isCorrect: false,
            explanation: "Bug: No exception handling for file not found",
            sampleOutput: "FileNotFoundError: [Errno 2] No such file or directory: 'nonexistent.txt'"
          },
          {
            id: "B",
            code: `def read_file(filename):
    try:
        with open(filename, 'r') as f:
            return f.read()
    except FileNotFoundError:
        return None`,
            isCorrect: true,
            explanation: "Correct - Handles FileNotFoundError gracefully",
            sampleOutput: "None"
          },
          {
            id: "C",
            code: `def read_file(filename):
    f = open(filename, 'r')
    content = f.read()
    f.close()
    return content`,
            isCorrect: false,
            explanation: "Bug: File not properly closed on exception",
            sampleOutput: "ResourceWarning: unclosed file"
          },
          {
            id: "D",
            code: `def read_file(filename):
    if not filename:
        return None
    with open(filename, 'r') as f:
        return f.read()`,
            isCorrect: false,
            explanation: "Bug: Still crashes on FileNotFoundError",
            sampleOutput: "FileNotFoundError: [Errno 2] No such file or directory: 'test.txt'"
          }
        ]
      }
    }
  },

  multipleChoice: {
    system: `You are an expert Python instructor.`,
    
    user: (code) => `Create 5 multiple-choice questions from this Python code:

${code}

Requirements:
- Focus on advanced Python concepts
- Test actual code understanding, not basic syntax
- Include questions about decorators, generators, context managers, exception handling
- Make questions challenging but fair
- Use real code examples from the provided files

Return ONLY valid JSON array.`,

    fallback: {
      snippet: "Python Fundamentals",
      quiz: {
        type: "multiple-choice",
        question: "What is the purpose of the 'with' statement in Python?",
        options: [
          "To create a new variable scope",
          "To ensure proper resource cleanup",
          "To make code run faster",
          "To import modules"
        ],
        answer: "B",
        explanation: "The 'with' statement ensures proper resource cleanup by automatically calling __enter__ and __exit__ methods."
      }
    }
  }
};
