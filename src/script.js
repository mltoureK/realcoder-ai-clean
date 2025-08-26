// Import modular services and components
import { FileProcessor } from './services/fileProcessor.js';
import { QuizGenerator } from './services/quizGenerator.js';
import { QuizCard } from './components/QuizCard.js';
import { getLanguageConfig } from './utils/languageConfig.js';

let codeEditor;

// Initialize services
const fileProcessor = new FileProcessor();
const quizGenerator = new QuizGenerator();

const BACKEND_URL = "http://localhost:3000"; // Connect directly to backend

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("folderInput").addEventListener("change", handleFolderUpload);
  document.getElementById("loadRepoButton").addEventListener("click", handleRepoLoad);
  document.getElementById("generateQuizButton").addEventListener("click", generateQuizFromStoredFiles);
  document.getElementById("generateFunctionVariantButton").addEventListener("click", generateFunctionVariantQuiz);
});

async function handleFolderUpload(event) {
  const files = Array.from(event.target.files);
  const fileData = await Promise.all(files.map(async file => ({
    name: file.webkitRelativePath,
    content: await file.text()
  })));
  
  // Use file processor to validate payload size
  try {
    fileProcessor.validatePayloadSize(fileData);
  } catch (error) {
    alert(error.message);
    return;
  }
  
  await fetch(`${BACKEND_URL}/uploadFiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files: fileData })
  });
  alert("Files uploaded and stored!");
}

async function handleRepoLoad() {
  console.log("Load Repo button clicked");
  const repoUrl = document.getElementById("repoUrlInput").value.trim();
  console.log("Repo URL:", repoUrl);
  if (!repoUrl) return alert("Please enter a repo URL.");

  try {
    // Parse owner/repo from URL
    const m = repoUrl.match(/github\.com\/(?:.+?\/)?([^\/]+)\/([^\/#?]+)/);
    if (!m) {
      alert("Invalid GitHub URL. Expected format: https://github.com/<owner>/<repo>");
      return;
    }
    const owner = m[1];
    const repo = m[2];

    // Show spinner
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.classList.remove("hidden");

    const apiHeaders = { 'Accept': 'application/vnd.github+json' };

    // 1) Get repo info to discover default branch
    const repoResp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: apiHeaders });
    if (!repoResp.ok) {
      const text = await repoResp.text();
      throw new Error(`Failed to load repo metadata: ${repoResp.status} ${text}`);
    }
    const repoInfo = await repoResp.json();
    const ref = repoInfo.default_branch || 'main';

    // 2) Get the full tree for default branch
    const treeResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`, { headers: apiHeaders });
    if (!treeResp.ok) {
      const text = await treeResp.text();
      throw new Error(`Failed to list repo tree: ${treeResp.status} ${text}`);
    }
    const treeJson = await treeResp.json();
    const tree = Array.isArray(treeJson.tree) ? treeJson.tree : [];

    // 3) Filter to code-like files using file processor
    const allowed = ['.js', '.mjs', '.ts', '.jsx', '.tsx', '.json', '.md', '.html', '.css'];
    const isAllowed = (p) => allowed.some(ext => p.toLowerCase().endsWith(ext));
    const isRelevant = (p) => !fileProcessor.isIrrelevantFile(p);
    const blobs = tree.filter(node => 
      node.type === 'blob' && 
      isAllowed(node.path) && 
      isRelevant(node.path)
    );

    // 4) Fetch raw contents with size limits
    const maxFiles = 100; // Reduced from 200
    const maxFileSize = 100000; // 100KB per file
    const maxTotalSize = 5000000; // 5MB total
    let totalSize = 0;
    const files = [];
    
    for (const node of blobs.slice(0, maxFiles)) {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(ref)}/${node.path}`;
      try {
        const r = await fetch(rawUrl);
        if (!r.ok) continue;
        const content = await r.text();
        
        // Check file size
        if (content.length > maxFileSize) {
          console.warn(`Skipping large file: ${node.path} (${content.length} bytes)`);
          continue;
        }
        
        // Check total size
        if (totalSize + content.length > maxTotalSize) {
          console.warn(`Reached total size limit, stopping at ${files.length} files`);
          break;
        }
        
        files.push({ name: node.path, content });
        totalSize += content.length;
      } catch (e) {
        console.warn("Failed fetching", node.path, e);
      }
    }

    if (files.length === 0) {
      alert("No code files found in this repository.");
      if (spinner) spinner.classList.add("hidden");
      return;
    }

    // 5) Check payload size before uploading
    const payload = JSON.stringify({ files });
    const payloadSize = new Blob([payload]).size;
    console.log(`Payload size: ${payloadSize} bytes (${(payloadSize / 1024 / 1024).toFixed(2)} MB)`);
    
    if (payloadSize > 5000000) { // 5MB limit
      throw new Error(`Payload too large: ${(payloadSize / 1024 / 1024).toFixed(2)} MB. Try a smaller repository or fewer files.`);
    }
    
    // 6) Upload to backend storage
    const uploadResp = await fetch(`${BACKEND_URL}/uploadFiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload
    });
    if (!uploadResp.ok) {
      const text = await uploadResp.text();
      throw new Error(`Failed to store files: ${uploadResp.status} ${text}`);
    }

    alert(`Fetched and stored ${files.length} files from ${owner}/${repo}@${ref}`);
  } catch (error) {
    console.error("Repo load error:", error);
    alert(error.message || "Failed to load repository. Please check the URL and try again.");
  } finally {
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.classList.add("hidden");
  }
}

async function generateQuizFromStoredFiles() {
  const language = document.getElementById("language").value;
  
  try {
    // Show progress bar
    showProgressBar();
    
    // Use the quiz generator service
    const quizCards = await quizGenerator.generateQuizFromStoredFiles(language);
    
    // Process and validate quiz cards
    const processedCards = quizGenerator.processQuizCards(quizCards);
    
    if (processedCards.length === 0) {
      alert("No valid quiz questions could be generated. Please try with different files.");
      return;
    }
    
    // Display quiz cards using the QuizCard component
    displayQuizCards(processedCards);
    
  } catch (error) {
    console.error("Quiz generation error:", error);
    alert(`Failed to generate quiz: ${error.message}`);
  } finally {
    hideProgressBar();
  }
}

async function generateFunctionVariantQuiz() {
  const language = document.getElementById("language").value;
  
  try {
    // Get stored files from backend
    const response = await fetch(`${BACKEND_URL}/getStoredFiles`);
    if (!response.ok) {
      throw new Error(`Failed to get stored files: ${response.status}`);
    }
    
    const { files } = await response.json();
    if (!files || files.length === 0) {
      alert("No files found. Please upload files or load a repository first.");
      return;
    }
    
    // Show progress bar
    showProgressBar();
    
    // Generate function variant quiz
    const response2 = await fetch(`${BACKEND_URL}/generateFunctionVariantQuiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoFiles: files, language })
    });
    
    if (!response2.ok) {
      const errorData = await response2.json();
      throw new Error(errorData.error || `Failed to generate function variant quiz: ${response2.status}`);
    }
    
    const { quizCards } = await response2.json();
    
    if (!quizCards || quizCards.length === 0) {
      alert("No function variant questions could be generated. Please try with different files.");
      return;
    }
    
    // Display quiz cards using the QuizCard component
    displayQuizCards(quizCards);
    
  } catch (error) {
    console.error("Function variant quiz generation error:", error);
    alert(`Failed to generate function variant quiz: ${error.message}`);
  } finally {
    hideProgressBar();
  }
}

// Display quiz cards using the modular component
function displayQuizCards(cards) {
  const container = document.getElementById("quizContainer");
  container.innerHTML = "";
  
  cards.forEach((cardData, index) => {
    const quizCard = new QuizCard(cardData, index);
    const cardElement = quizCard.createCardElement();
    container.appendChild(cardElement);
  });
}

// Progress bar functions
function showProgressBar() {
  const progressContainer = document.getElementById("progressContainer");
  const progressBarFill = document.getElementById("progressBarFill");
  const progressText = document.getElementById("progressText");
  
  if (progressContainer) {
    progressContainer.classList.remove("hidden");
    progressBarFill.style.width = "0%";
    progressText.textContent = "Generating quiz questions...";
    
    // Animate progress bar
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90; // Don't go to 100% until actually done
      progressBarFill.style.width = progress + "%";
    }, 500);
    
    // Store interval ID for cleanup
    progressContainer.dataset.intervalId = interval;
  }
}

function hideProgressBar() {
  const progressContainer = document.getElementById("progressContainer");
  const progressBarFill = document.getElementById("progressBarFill");
  const progressText = document.getElementById("progressText");
  
  if (progressContainer) {
    // Complete the progress bar
    progressBarFill.style.width = "100%";
    progressText.textContent = "Quiz generated successfully!";
    
    // Clear the interval
    const intervalId = progressContainer.dataset.intervalId;
    if (intervalId) {
      clearInterval(parseInt(intervalId));
    }
    
    // Hide after a short delay
    setTimeout(() => {
      progressContainer.classList.add("hidden");
    }, 1000);
  }
}
