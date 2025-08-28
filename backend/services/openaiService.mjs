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

// Helper function to randomize answer positions
function randomizeAnswerPosition() {
  const positions = ['A', 'B', 'C', 'D'];
  return positions[Math.floor(Math.random() * positions.length)];
}

// Helper function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
            user: (code) => `Analyze this ${language} code and create 3 multiple-choice questions based on ACTUAL code patterns and functions found:

${code}

Requirements:
- Extract actual functions, methods, and patterns from the provided code
- Focus on advanced ${language} concepts found in the code
- Test understanding of the specific code structure and patterns
- Make questions challenging but fair
- Use actual function names, variable names, and patterns from the provided files
- Randomize the correct answer position (A, B, C, or D) - don't always use A

Return ONLY valid JSON array.`
          },
          functionVariant: {
            system: `You are an expert ${language} instructor. Create function-variant questions based on the actual code provided.`,
            user: (code) => `Analyze this ${language} code and create 2 function-variant questions based on ACTUAL code patterns and functions found:

${code}

Requirements:
- Extract actual functions, methods, and patterns from the provided code
- Create subtle bugs in the variants
- Test understanding of the specific code structure and patterns
- Make questions challenging but fair
- Use actual function names, variable names, and patterns from the provided files
- Randomize the correct answer position (A, B, C, or D) - don't always use A

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
          user: (code) => `Create 3 multiple-choice questions from this ${language} code:

${code}

Requirements:
- Focus on advanced ${language} concepts
- Test actual code understanding, not basic syntax
- Make questions challenging but fair
- Randomize the correct answer position (A, B, C, or D)

Return ONLY valid JSON array.`
        },
        functionVariant: {
          system: `You are an expert ${language} instructor.`,
          user: (code) => `Create 2 function-variant questions from this ${language} code:

${code}

Requirements:
- Focus on advanced ${language} concepts
- Create subtle bugs in the variants
- Test actual code understanding, not basic syntax
- Make questions challenging but fair
- Randomize the correct answer position (A, B, C, or D)

Return ONLY valid JSON array.`
        }
      };
    }

    // Generate multiple-choice questions
    const multipleChoiceCompletion = await openai.chat.completions.create({
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
      max_tokens: 2000,
      temperature: 0.7,
    });

    // Generate function-variant questions
    const functionVariantCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: prompts.functionVariant.system
        },
        {
          role: "user",
          content: prompts.functionVariant.user(code)
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    let multipleChoiceCards = [];
    let functionVariantCards = [];

    // Parse multiple-choice questions
    try {
      let multipleChoiceText = multipleChoiceCompletion.choices[0].message.content.trim();
      console.log('Raw Multiple Choice Response:', multipleChoiceText);
      console.log('Raw Multiple Choice Response Length:', multipleChoiceText.length);
      console.log('Raw Multiple Choice Response First 200 chars:', multipleChoiceText.substring(0, 200));
      
      const codeBlockMatch = multipleChoiceText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        multipleChoiceText = codeBlockMatch[1].trim();
        console.log('Found code block, extracted text');
      } else {
        console.log('No code block found, using raw text');
      }
      
      console.log('Parsed Multiple Choice Text:', multipleChoiceText);
      console.log('Parsed Text Length:', multipleChoiceText.length);
      console.log('Parsed Text First 200 chars:', multipleChoiceText.substring(0, 200));
      
      const parsed = JSON.parse(multipleChoiceText);
      multipleChoiceCards = Array.isArray(parsed) ? parsed : [];
      console.log('Multiple Choice Cards:', multipleChoiceCards.length);
    } catch (error) {
      console.error('Error parsing multiple-choice questions:', error);
      console.error('Failed text was:', multipleChoiceText);
      multipleChoiceCards = []; // Ensure it's always an array
    }

    // Parse function-variant questions
    try {
      let functionVariantText = functionVariantCompletion.choices[0].message.content.trim();
      console.log('Raw Function Variant Response:', functionVariantText);
      
      // Extract all JSON objects from the markdown response
      const jsonObjectMatches = functionVariantText.match(/```json\s*(\{[\s\S]*?\})\s*```/g);
      if (jsonObjectMatches) {
        console.log('Found JSON objects in markdown:', jsonObjectMatches.length);
        const allVariants = [];
        
        for (const match of jsonObjectMatches) {
          try {
            const jsonText = match.replace(/```json\s*/, '').replace(/\s*```/, '');
            // Clean up template literals that might break JSON parsing
            const cleanedJson = jsonText.replace(/`/g, "'").replace(/\${/g, "${");
            const parsed = JSON.parse(cleanedJson);
            if (parsed && typeof parsed === 'object') {
              allVariants.push(parsed);
            }
          } catch (parseError) {
            console.error('Error parsing individual JSON object:', parseError);
            console.error('Problematic JSON text:', jsonText);
          }
        }
        
        functionVariantCards = allVariants;
      } else {
        // Fallback to old parsing method
        const codeBlockMatch = functionVariantText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          functionVariantText = codeBlockMatch[1].trim();
        }
        console.log('Parsed Function Variant Text:', functionVariantText);
        
        // Clean up template literals before parsing
        const cleanedText = functionVariantText.replace(/`/g, "'").replace(/\${/g, "${");
        const parsed = JSON.parse(cleanedText);
        functionVariantCards = Array.isArray(parsed) ? parsed : [parsed];
      }
      
      console.log('Function Variant Cards:', functionVariantCards.length);
    } catch (error) {
      console.error('Error parsing function-variant questions:', error);
      console.error('Failed text was:', functionVariantText);
      functionVariantCards = []; // Ensure it's always an array
    }

    // Process and randomize multiple-choice questions
    multipleChoiceCards = multipleChoiceCards.map(card => {
      if (card.quiz && card.quiz.type === 'multiple-choice') {
        // Randomize answer position
        const correctAnswer = card.quiz.answer || 'A';
        const correctOption = card.quiz.options[correctAnswer.charCodeAt(0) - 65]; // Convert A=0, B=1, etc.
        
        // Shuffle options
        const shuffledOptions = shuffleArray([...card.quiz.options]);
        const newCorrectPosition = shuffledOptions.indexOf(correctOption);
        const newAnswer = String.fromCharCode(65 + newCorrectPosition); // Convert back to A, B, C, D
        
        return {
          ...card,
          quiz: {
            ...card.quiz,
            options: shuffledOptions,
            answer: newAnswer
          }
        };
      }
      return card;
    });

    // Process and randomize function-variant questions
    functionVariantCards = functionVariantCards.map(card => {
      if (card.quiz && card.quiz.type === 'function-variant') {
        // Randomize answer position
        const correctVariant = card.quiz.variants.find(v => v.isCorrect);
        if (correctVariant) {
          const correctCode = correctVariant.code;
          const correctExplanation = correctVariant.explanation;
          
          // Shuffle variants
          const shuffledVariants = shuffleArray([...card.quiz.variants]);
          const newCorrectPosition = shuffledVariants.findIndex(v => v.code === correctCode);
          const newAnswer = String.fromCharCode(65 + newCorrectPosition);
          
          return {
            ...card,
            quiz: {
              ...card.quiz,
              variants: shuffledVariants,
              answer: newAnswer
            }
          };
        }
      }
      return card;
    });

    // Combine both types of questions
    const allQuizCards = [...multipleChoiceCards, ...functionVariantCards];
    
    console.log('Quiz generation successful, returning cards:', allQuizCards.length);
    return allQuizCards;
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw error;
  }
}