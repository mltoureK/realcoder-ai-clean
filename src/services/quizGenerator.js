import { getLanguageConfig } from '../utils/languageConfig.js';
import { getQuestionTypeConfig } from '../utils/questionTypes.js';

export class QuizGenerator {
  constructor() {
    this.BACKEND_URL = 'http://localhost:3000';
  }

  // Generate quiz from stored files
  async generateQuizFromStoredFiles(language) {
    try {
      // Get stored files
      const res = await fetch(`${this.BACKEND_URL}/getStoredFiles`);
      if (!res.ok) {
        throw new Error('Failed to get stored files');
      }
      
      const { files } = await res.json();
      if (!files || files.length === 0) {
        throw new Error('No files available for quiz generation');
      }

      // Filter files by language
      const languageConfig = getLanguageConfig(language);
      const languageFiles = files.filter(file => {
        const extensions = languageConfig.extensions;
        return extensions.some(ext => file.name.toLowerCase().endsWith(ext));
      });

      if (languageFiles.length === 0) {
        throw new Error(`No ${language} files found in the repository`);
      }

      console.log(`Generating ${language} quiz from ${languageFiles.length} files:`, 
        languageFiles.map(f => f.name));

      // Combine file contents
      const combinedCode = this.combineFileContents(languageFiles);
      
      // Generate quiz
      const quizCards = await this.callQuizGenerationAPI(combinedCode, language);
      
      return quizCards;
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw error;
    }
  }

  // Combine file contents for API call
  combineFileContents(files) {
    return files
      .map(file => `// ${file.name}\n${file.content}`)
      .join('\n\n');
  }

  // Call the backend API for quiz generation
  async callQuizGenerationAPI(code, language) {
    const response = await fetch(`${this.BACKEND_URL}/generateQuiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        language: language,
        message: `Generate ${language} quiz questions`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Quiz generation failed: ${errorText}`);
    }

    const result = await response.json();
    return result.quizCards || [];
  }

  // Validate quiz card structure
  validateQuizCard(card) {
    const requiredFields = ['snippet', 'quiz'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!card[field]) {
        console.warn(`Quiz card missing required field: ${field}`);
        return false;
      }
    }
    
    // Check quiz object fields based on type
    if (!card.quiz.type || !card.quiz.question) {
      console.warn(`Quiz card missing required quiz fields: type or question`);
      return false;
    }
    
    // For function-variant questions, check for variants instead of answer
    if (card.quiz.type === 'function-variant') {
      if (!card.quiz.variants || !Array.isArray(card.quiz.variants)) {
        console.warn(`Function variant quiz missing variants array`);
        return false;
      }
    } else {
      // For other question types, check for answer
      if (!card.quiz.answer) {
        console.warn(`Quiz card missing required quiz field: answer`);
        return false;
      }
    }
    
    // Validate question type
    const questionType = getQuestionTypeConfig(card.quiz.type);
    if (!questionType) {
      console.warn(`Invalid question type: ${card.quiz.type}`);
      return false;
    }
    
    return true;
  }

  // Process and clean quiz cards
  processQuizCards(cards) {
    if (!Array.isArray(cards)) {
      console.warn('Quiz cards is not an array, converting...');
      cards = [cards];
    }
    
    return cards
      .filter(card => this.validateQuizCard(card))
      .map(card => this.cleanQuizCard(card));
  }

  // Clean and format quiz card
  cleanQuizCard(card) {
    const cleanedCard = {
      snippet: card.snippet || '',
      quiz: {
        type: card.quiz.type || 'mcq',
        question: card.quiz.question || '',
        resource: card.quiz.resource || {
          title: 'Learn More',
          link: '#'
        }
      }
    };
    
    // Handle different question types
    if (card.quiz.type === 'function-variant') {
      cleanedCard.quiz.variants = card.quiz.variants || [];
    } else {
      cleanedCard.quiz.options = card.quiz.options || [];
      cleanedCard.quiz.answer = Array.isArray(card.quiz.answer) ? card.quiz.answer : [card.quiz.answer];
    }
    
    return cleanedCard;
  }
}
