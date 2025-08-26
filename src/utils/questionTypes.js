export const questionTypes = {
  mcq: {
    name: 'Multiple Choice',
    description: 'Traditional multiple choice questions',
    requires: ['options', 'correctAnswer']
  },
  'fill-blank-drag': {
    name: 'Drag & Drop Fill-in',
    description: 'Drag correct answer into blank space',
    requires: ['options', 'correctAnswer', 'codeSnippet']
  },
  'fill-blank-manual': {
    name: 'Manual Fill-in',
    description: 'Type the correct answer',
    requires: ['correctAnswer', 'codeSnippet']
  },
  reorder: {
    name: 'Code Reordering',
    description: 'Reorder scrambled code lines',
    requires: ['codeLines', 'correctOrder']
  },
  match: {
    name: 'Matching',
    description: 'Match terms with definitions',
    requires: ['terms', 'definitions', 'correctMatches']
  },
  debug: {
    name: 'Debug Code',
    description: 'Find and fix code issues',
    requires: ['brokenCode', 'options', 'correctAnswer', 'explanation']
  },
  'predict-output': {
    name: 'Predict Output',
    description: 'What will this code output?',
    requires: ['codeSnippet', 'options', 'correctAnswer', 'explanation']
  }
};

export const getQuestionTypeConfig = (type) => {
  return questionTypes[type] || questionTypes.mcq;
};
