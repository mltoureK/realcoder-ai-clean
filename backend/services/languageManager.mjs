export class LanguageManager {
  constructor() {
    this.supportedLanguages = {
      javascript: {
        extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx'],
        name: 'JavaScript',
        promptModule: 'javascriptPrompts'
      },
      python: {
        extensions: ['.py', '.pyw', '.pyx', '.pyi'],
        name: 'Python',
        promptModule: 'pythonPrompts'
      },
      java: {
        extensions: ['.java', '.jav'],
        name: 'Java',
        promptModule: 'javaPrompts'
      },
      cpp: {
        extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
        name: 'C++',
        promptModule: 'cppPrompts'
      },
      csharp: {
        extensions: ['.cs', '.csx'],
        name: 'C#',
        promptModule: 'csharpPrompts'
      }
    };
  }

  getLanguageFromFile(filePath) {
    const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
    
    for (const [lang, config] of Object.entries(this.supportedLanguages)) {
      if (config.extensions.includes(extension)) {
        return lang;
      }
    }
    
    return 'javascript'; // Default fallback
  }

  getLanguageConfig(language) {
    return this.supportedLanguages[language.toLowerCase()] || this.supportedLanguages.javascript;
  }

  isLanguageSupported(language) {
    return language.toLowerCase() in this.supportedLanguages;
  }

  getSupportedLanguages() {
    return Object.keys(this.supportedLanguages);
  }

  filterFilesByLanguage(files, language) {
    const config = this.getLanguageConfig(language);
    return files.filter(file => 
      config.extensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )
    );
  }
}
