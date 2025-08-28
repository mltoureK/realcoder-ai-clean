export class QuizCard {
  constructor(cardData, index) {
    this.cardData = cardData;
    this.index = index;
    this.isAnswered = false;
    this.isCorrect = false;
    this.selectedAnswer = null;
  }

  // Create the quiz card HTML element
  createCardElement() {
    const cardEl = document.createElement('div');
    cardEl.className = 'quiz-card';
    cardEl.dataset.index = this.index;
    
    cardEl.innerHTML = `
      <div class="card-header">
        <h3>Card ${this.index + 1}</h3>
        <span class="question-type">${this.getQuestionTypeName()}</span>
      </div>
      
      <div class="code-snippet">
        <pre><code>${this.escapeHtml(this.formatCode(this.cardData.snippet))}</code></pre>
      </div>
      
      <div class="question-section">
        <h4>${this.escapeHtml(this.cardData.quiz.question)}</h4>
        
        ${this.renderQuestionContent()}
      </div>
      
      <div class="card-footer">
        <button class="reveal-btn" onclick="this.revealAnswer()">Reveal Answer</button>
        <div class="answer-section" style="display: none;">
          <h5>Correct Answer:</h5>
          <p class="correct-answer">${this.formatAnswer()}</p>
          <div class="explanation">
            <a href="${this.cardData.quiz.resource?.link || '#'}" target="_blank">
              ${this.cardData.quiz.resource?.title || 'Learn More'}
            </a>
          </div>
        </div>
      </div>
    `;
    
    // Bind event listeners
    this.bindEventListeners(cardEl);
    
    return cardEl;
  }

  // Get question type display name
  getQuestionTypeName() {
    const typeNames = {
      'mcq': 'Multiple Choice',
      'fill-blank-drag': 'Drag & Drop',
      'fill-blank-manual': 'Fill in the Blank',
      'reorder': 'Code Reordering',
      'match': 'Matching',
      'debug': 'Debug Code',
      'predict-output': 'Predict Output',
      'function-variant': 'Function Variant'
    };
    
    return typeNames[this.cardData.quiz.type] || 'Question';
  }

  // Render different question types
  renderQuestionContent() {
    switch (this.cardData.quiz.type) {
      case 'mcq':
        return this.renderMultipleChoice();
      case 'fill-blank-drag':
        return this.renderDragDrop();
      case 'fill-blank-manual':
        return this.renderManualFill();
      case 'reorder':
        return this.renderReorder();
      case 'match':
        return this.renderMatching();
      case 'debug':
        return this.renderDebug();
      case 'predict-output':
        return this.renderPredictOutput();
      case 'function-variant':
        return this.renderFunctionVariant();
      default:
        return this.renderMultipleChoice();
    }
  }

  // Render multiple choice options
  renderMultipleChoice() {
    const options = this.cardData.quiz.options.map((option, i) => `
      <label class="option">
        <input type="radio" name="q${this.index}" value="${i}" onchange="this.handleAnswerSelect(${i})">
        <span class="option-text">${this.escapeHtml(option)}</span>
      </label>
    `).join('');
    
    return `<div class="options">${options}</div>`;
  }

  // Render drag and drop interface
  renderDragDrop() {
    const options = this.cardData.quiz.options.map(option => `
      <div class="drag-option" draggable="true" data-value="${this.escapeHtml(option)}">
        ${this.escapeHtml(option)}
      </div>
    `).join('');
    
    return `
      <div class="drag-drop-container">
        <div class="drop-zone">
          <div class="drop-placeholder">Drop answer here</div>
        </div>
        <div class="drag-options">${options}</div>
      </div>
    `;
  }

  // Render manual fill input
  renderManualFill() {
    return `
      <div class="manual-fill">
        <input type="text" class="fill-input" placeholder="Type your answer..." 
               onchange="this.handleManualAnswer(this.value)">
      </div>
    `;
  }

  // Render code reordering
  renderReorder() {
    const lines = this.cardData.quiz.codeLines || [];
    return `
      <div class="reorder-container">
        <div class="reorder-instructions">Drag to reorder the code lines:</div>
        <div class="code-lines">
          ${lines.map((line, i) => `
            <div class="code-line" draggable="true" data-index="${i}">
              ${this.escapeHtml(line)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Render matching exercise
  renderMatching() {
    const terms = this.cardData.quiz.terms || [];
    const definitions = this.cardData.quiz.definitions || [];
    
    return `
      <div class="matching-container">
        <div class="terms-column">
          ${terms.map(term => `
            <div class="term-item">${this.escapeHtml(term)}</div>
          `).join('')}
        </div>
        <div class="definitions-column">
          ${definitions.map(def => `
            <div class="definition-item">${this.escapeHtml(def)}</div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Render debug question
  renderDebug() {
    return `
      <div class="debug-container">
        <div class="broken-code">
          <pre><code>${this.escapeHtml(this.cardData.quiz.brokenCode || '')}</code></pre>
        </div>
        ${this.renderMultipleChoice()}
      </div>
    `;
  }

  // Render predict output question
  renderPredictOutput() {
    return `
      <div class="predict-output-container">
        <div class="code-to-predict">
          <pre><code>${this.escapeHtml(this.cardData.quiz.codeSnippet || '')}</code></pre>
        </div>
        ${this.renderMultipleChoice()}
      </div>
    `;
  }

  // Render function variant questions
  renderFunctionVariant() {
    const variants = this.cardData.quiz.variants || [];
    
    const variantOptions = variants.map((variant, index) => `
      <div class="function-variant">
        <label class="variant-option">
          <input type="radio" name="q${this.index}" value="${variant.id}">
          <span class="variant-label">Option ${variant.id}</span>
        </label>
        <div class="variant-code">
          <pre><code>${this.escapeHtml(this.formatCode(variant.code))}</code></pre>
        </div>
        <div class="variant-explanation" style="display: none;">
          <div class="explanation-text">${this.escapeHtml(variant.explanation)}</div>
          <div class="sample-output">
            <strong>Sample Output:</strong>
            <pre><code>${this.escapeHtml(variant.sampleOutput || 'No output available')}</code></pre>
          </div>
        </div>
      </div>
    `).join('');
    
    return `
      <div class="function-variants">
        <p class="variant-instruction">Select the correct version of this function. Look for subtle bugs in the logic.</p>
        ${variantOptions}
      </div>
    `;
  }

  // Format answer for display
  formatAnswer() {
    const answers = Array.isArray(this.cardData.quiz.answer) 
      ? this.cardData.quiz.answer 
      : [this.cardData.quiz.answer];
    
    return answers.map(answer => this.escapeHtml(answer)).join(', ');
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Format code for better readability
  formatCode(code) {
    if (!code) return '';
    
    // First, handle the \n escape sequences that come from the backend
    let formatted = code
      .replace(/\\n/g, '\n')  // Convert \n escape sequences to actual line breaks
      .replace(/\\t/g, '  ')  // Convert \t to spaces
      .replace(/\\"/g, '"')   // Convert escaped quotes
      .replace(/\\'/g, "'");  // Convert escaped single quotes
    
    // If the code is still all on one line, try to format it
    if (!formatted.includes('\n')) {
      formatted = formatted
        // Add line breaks after semicolons
        .replace(/;\s*(?=const|let|var|if|for|while|return|try|catch|async|function)/g, ';\n')
        // Add line breaks after opening braces
        .replace(/\{\s*(?=const|let|var|if|for|while|return|try|catch|async|function)/g, ' {\n')
        // Add line breaks before closing braces
        .replace(/(?<=const|let|var|if|for|while|return|try|catch|async|function)\s*\}/g, '\n}')
        // Add line breaks after commas in function parameters
        .replace(/,\s*(?=const|let|var|if|for|while|return|try|catch|async|function)/g, ',\n')
        // Clean up excessive whitespace
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Add proper indentation
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const indentedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return '';
      
      // Decrease indent for closing brackets
      if (trimmed === '}' || trimmed === '});' || trimmed === ');' || trimmed === '})') {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indented = '  '.repeat(indentLevel) + trimmed;
      
      // Increase indent for opening brackets
      if (trimmed.endsWith('{') || trimmed.endsWith('(')) {
        indentLevel++;
      }
      
      return indented;
    });
    
    return indentedLines.join('\n');
  }

  // Bind event listeners
  bindEventListeners(cardEl) {
    // Reveal answer button
    const revealBtn = cardEl.querySelector('.reveal-btn');
    if (revealBtn) {
      revealBtn.addEventListener('click', () => this.revealAnswer(cardEl));
    }

    // Multiple choice options
    const radioInputs = cardEl.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        // Check if this is a function variant question
        if (this.cardData.quiz.type === 'function-variant') {
          this.handleFunctionVariantSelect(e.target.value, cardEl);
        } else {
          this.handleAnswerSelect(e.target.value, cardEl);
        }
      });
    });

    // Drag and drop functionality
    this.setupDragAndDrop(cardEl);
  }

  // Handle answer selection
  handleAnswerSelect(value, cardEl) {
    this.selectedAnswer = value;
    this.isAnswered = true;
    
    // Check if answer is correct
    const correctAnswer = this.cardData.quiz.answer;
    const selectedOption = this.cardData.quiz.options[value];
    
    // Convert answer to option text for comparison
    const correctOptionIndex = this.getCorrectOptionIndex();
    this.isCorrect = (value == correctOptionIndex); // Use == for string/number comparison
    
    // Update UI
    this.updateAnswerUI(cardEl);
  }

  // Get the index of the correct option
  getCorrectOptionIndex() {
    const correctAnswer = this.cardData.quiz.answer;
    if (typeof correctAnswer === 'string') {
      // Convert A=0, B=1, C=2, D=3
      return correctAnswer.charCodeAt(0) - 65;
    }
    return correctAnswer;
  }

  // Update answer UI
  updateAnswerUI(cardEl) {
    const options = cardEl.querySelectorAll('.option');
    const correctIndex = this.getCorrectOptionIndex();
    
    options.forEach((option, index) => {
      const radio = option.querySelector('input[type="radio"]');
      const text = option.querySelector('.option-text');
      
      if (radio.checked) {
        option.classList.add(this.isCorrect ? 'correct' : 'incorrect');
      }
      
      // Also highlight the correct answer if user selected wrong one
      if (!this.isCorrect && index === correctIndex) {
        option.classList.add('correct');
      }
    });
  }

  // Reveal answer
  revealAnswer(cardEl) {
    const answerSection = cardEl.querySelector('.answer-section');
    const revealBtn = cardEl.querySelector('.reveal-btn');
    
    if (answerSection) {
      answerSection.style.display = 'block';
      revealBtn.textContent = 'Answer Revealed';
      revealBtn.disabled = true;
    }
  }

  // Setup drag and drop functionality
  setupDragAndDrop(cardEl) {
    const dragOptions = cardEl.querySelectorAll('.drag-option');
    const dropZone = cardEl.querySelector('.drop-zone');
    
    if (dragOptions.length && dropZone) {
      dragOptions.forEach(option => {
        option.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', option.dataset.value);
        });
      });
      
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
      
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const value = e.dataTransfer.getData('text/plain');
        this.handleDragDropAnswer(value, cardEl);
        dropZone.classList.remove('drag-over');
      });
    }
  }

  // Handle drag and drop answer
  handleDragDropAnswer(value, cardEl) {
    this.selectedAnswer = value;
    this.isAnswered = true;
    
    const correctAnswers = Array.isArray(this.cardData.quiz.answer) 
      ? this.cardData.quiz.answer 
      : [this.cardData.quiz.answer];
    
    this.isCorrect = correctAnswers.includes(value);
    
    // Update drop zone
    const dropZone = cardEl.querySelector('.drop-zone');
    if (dropZone) {
      dropZone.innerHTML = `<div class="dropped-answer">${this.escapeHtml(value)}</div>`;
      dropZone.classList.add(this.isCorrect ? 'correct' : 'incorrect');
    }
  }

  handleFunctionVariantSelect(variantId, cardEl) {
    this.selectedAnswer = variantId;
    this.isAnswered = true;
    
    const variants = this.cardData.quiz.variants || [];
    const selectedVariant = variants.find(v => v.id === variantId);
    
    if (selectedVariant) {
      this.isCorrect = selectedVariant.isCorrect;
      
      // Clear all previous styling and messages
      const allVariants = cardEl.querySelectorAll('.function-variant');
      allVariants.forEach(variant => {
        variant.classList.remove('correct', 'incorrect');
      });
      
      // Remove any existing feedback messages
      const existingFeedback = cardEl.querySelector('.feedback-message');
      if (existingFeedback) {
        existingFeedback.remove();
      }
      
      // Highlight the selected variant
      const selectedRadio = cardEl.querySelector(`input[value="${variantId}"]`);
      if (selectedRadio) {
        const selectedVariantContainer = selectedRadio.closest('.function-variant');
        selectedVariantContainer.classList.add(this.isCorrect ? 'correct' : 'incorrect');
      }
      
      // Also highlight the correct answer if the selected one is wrong
      if (!this.isCorrect) {
        const correctVariant = variants.find(v => v.isCorrect);
        if (correctVariant) {
          const correctRadio = cardEl.querySelector(`input[value="${correctVariant.id}"]`);
          if (correctRadio) {
            const correctVariantContainer = correctRadio.closest('.function-variant');
            correctVariantContainer.classList.add('correct');
          }
        }
      }
      
      // Show explanations for all variants
      const allExplanations = cardEl.querySelectorAll('.variant-explanation');
      allExplanations.forEach(explanation => {
        explanation.style.display = 'block';
      });
      
      // Add feedback message
      const feedbackMessage = document.createElement('div');
      feedbackMessage.className = `feedback-message ${this.isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`;
      feedbackMessage.innerHTML = `
        <div class="feedback-content">
          <span class="feedback-icon">${this.isCorrect ? '✅' : '❌'}</span>
          <span class="feedback-text">${this.isCorrect ? 'Correct!' : 'Incorrect. Try again!'}</span>
        </div>
      `;
      
      // Insert feedback after the function variants
      const functionVariants = cardEl.querySelector('.function-variants');
      if (functionVariants) {
        functionVariants.appendChild(feedbackMessage);
      }
    }
  }
}
