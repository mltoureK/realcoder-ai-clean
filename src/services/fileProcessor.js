import { getFileExtensions, getLanguageConfig } from '../utils/languageConfig.js';

export class FileProcessor {
  constructor() {
    this.maxFiles = 15;
    this.maxFileSize = 100 * 1024; // 100KB
    this.maxTotalSize = 5 * 1024 * 1024; // 5MB
  }

  // Filter files by language and relevance
  filterFilesByLanguage(files, language) {
    const extensions = getFileExtensions(language);
    const config = getLanguageConfig(language);
    
    return files.filter(file => {
      // Check file extension
      const hasValidExtension = extensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      
      // Skip irrelevant files
      const isRelevant = !this.isIrrelevantFile(file.name);
      
      // Check file size
      const isValidSize = file.content && file.content.length <= this.maxFileSize;
      
      return hasValidExtension && isRelevant && isValidSize;
    });
  }

  // Check if file is irrelevant
  isIrrelevantFile(filename) {
    const irrelevantPatterns = [
      'node_modules',
      '.d.ts',
      'package-lock.json',
      'yarn.lock',
      '.gitignore',
      'README.md',
      '.env',
      '.DS_Store',
      'Thumbs.db'
    ];
    
    return irrelevantPatterns.some(pattern => 
      filename.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  // Get relevance score for file prioritization
  getFileRelevanceScore(filename) {
    let score = 0;
    
    // Prioritize main source files
    if (filename.includes('main') || filename.includes('index')) score += 10;
    if (filename.includes('src/')) score += 8;
    if (filename.includes('app') || filename.includes('App')) score += 6;
    if (filename.includes('utils') || filename.includes('helpers')) score += 5;
    if (filename.includes('components')) score += 4;
    if (filename.includes('services')) score += 4;
    if (filename.includes('routes')) score += 3;
    
    // Penalize test files and config files
    if (filename.includes('test') || filename.includes('spec')) score -= 5;
    if (filename.includes('config') || filename.includes('setup')) score -= 3;
    
    return score;
  }

  // Select most relevant files for quiz generation
  selectRelevantFiles(files, language) {
    const languageFiles = this.filterFilesByLanguage(files, language);
    
    return languageFiles
      .sort((a, b) => {
        const aScore = this.getFileRelevanceScore(a.name);
        const bScore = this.getFileRelevanceScore(b.name);
        return bScore - aScore;
      })
      .slice(0, this.maxFiles);
  }

  // Combine file contents for quiz generation
  combineFileContents(files) {
    let combinedContent = '';
    let totalSize = 0;
    
    for (const file of files) {
      if (file.content) {
        const fileContent = `// ${file.name}\n${file.content}\n\n`;
        const contentSize = new Blob([fileContent]).size;
        
        if (totalSize + contentSize <= this.maxTotalSize) {
          combinedContent += fileContent;
          totalSize += contentSize;
        } else {
          console.warn(`Skipping ${file.name} - would exceed total size limit`);
          break;
        }
      }
    }
    
    return combinedContent;
  }

  // Validate payload size before sending
  validatePayloadSize(files) {
    const payload = JSON.stringify({ files });
    const payloadSize = new Blob([payload]).size;
    
    console.log(`Payload size: ${payloadSize} bytes (${(payloadSize / 1024 / 1024).toFixed(2)} MB)`);
    
    if (payloadSize > this.maxTotalSize) {
      throw new Error(`Payload too large: ${(payloadSize / 1024 / 1024).toFixed(2)} MB. Try a smaller repository or fewer files.`);
    }
    
    return true;
  }
}
