let codeEditor;

// Remove all dropdowns except programming language
// Remove code editor and assignment instructions logic
// Add logic for folder upload and repo input

const BACKEND_URL = "http://localhost:3000"; // Connect directly to backend

// Helper function to score file relevance for quiz generation
function getFileRelevanceScore(filename) {
  let score = 0;
  
  // Higher priority for main source files
  if (filename.includes('main.') || filename.includes('index.') || filename.includes('app.')) score += 10;
  if (filename.includes('src/')) score += 5;
  if (filename.includes('components/')) score += 3;
  if (filename.includes('utils/') || filename.includes('helpers/')) score += 2;
  
  // Lower priority for config files
  if (filename.includes('config') || filename.includes('package.json')) score -= 5;
  if (filename.includes('README') || filename.includes('.md')) score -= 3;
  
  return score;
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("folderInput").addEventListener("change", handleFolderUpload);
  document.getElementById("loadRepoButton").addEventListener("click", handleRepoLoad);
  document.getElementById("generateQuizButton").addEventListener("click", generateQuizFromStoredFiles);
});

async function handleFolderUpload(event) {
  const files = Array.from(event.target.files);
  const fileData = await Promise.all(files.map(async file => ({
    name: file.webkitRelativePath,
    content: await file.text()
  })));
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

    // 3) Filter to code-like files (exclude node_modules and large files)
    const allowed = ['.js', '.mjs', '.ts', '.jsx', '.tsx', '.json', '.md', '.html', '.css'];
    const isAllowed = (p) => allowed.some(ext => p.toLowerCase().endsWith(ext));
    const isRelevant = (p) => !p.includes('node_modules') && !p.includes('.d.ts') && !p.includes('package-lock.json');
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
  const res = await fetch(`${BACKEND_URL}/getStoredFiles`);
  const { files } = await res.json();
  if (!files || files.length === 0) {
    alert("No files uploaded or repo loaded.");
    return;
  }

  // Language-specific file extensions
  const languageExtensions = {
    'javascript': ['.js', '.mjs', '.jsx', '.ts', '.tsx'],
    'python': ['.py', '.pyw', '.pyx', '.pyi'],
    'java': ['.java'],
    'cpp': ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
    'csharp': ['.cs']
  };

  // Filter files by selected language
  const languageExts = languageExtensions[language.toLowerCase()] || ['.js', '.mjs', '.jsx', '.ts', '.tsx'];
  const languageFiles = files.filter(file => 
    languageExts.some(ext => file.name.toLowerCase().endsWith(ext))
  );

  if (languageFiles.length === 0) {
    alert(`No ${language} files found in the uploaded repository. Try uploading a repository with ${language} files.`);
    return;
  }

  // Select most relevant files for quiz generation (prioritize main source files)
  const relevantFiles = languageFiles
    .filter(f => !f.name.includes('node_modules') && !f.name.includes('.d.ts'))
    .sort((a, b) => {
      // Prioritize main source files
      const aScore = getFileRelevanceScore(a.name);
      const bScore = getFileRelevanceScore(b.name);
      return bScore - aScore;
    })
    .slice(0, 10); // Limit to 10 most relevant files
  
  const code = relevantFiles.map(f => `// ${f.name}\n${f.content}`).join("\n\n");
  const requestData = { code, language, message: "Generate quiz questions based on the uploaded code files" };
  
  console.log(`Generating ${language} quiz from ${relevantFiles.length} files:`, relevantFiles.map(f => f.name));
  
  document.getElementById("loadingSpinner").classList.remove("hidden");
  document.getElementById("quizContainer").innerHTML = "";
  try {
    const response = await fetch(`${BACKEND_URL}/generateQuiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();
    if (data.error) {
      alert(`Error: ${data.error}`);
      return;
    }
    const container = document.getElementById("quizContainer");
    data.quizCards.forEach((card, index) => {
      const cardEl = document.createElement("div");
      cardEl.className = "bg-zinc-700 p-4 rounded-lg shadow";
      const questionId = `quiz-${index}`;
      cardEl.innerHTML = `
        <h2 class="font-semibold text-white mb-2">Card ${index + 1}</h2>
        <pre class="bg-zinc-800 p-2 rounded text-gray-300 text-sm mb-2">${card.snippet || ''}</pre>
        <strong class="text-white">Question:</strong>
        <p class="text-gray-200 mb-2">${card.quiz.question}</p>
      `;
      if (card.quiz.type === "drag-and-drop") {
        const quizBox = document.createElement("div");
        quizBox.className = "sortable-options space-y-2 p-2 bg-zinc-800 rounded";
        quizBox.id = questionId;
        card.quiz.options.forEach(opt => {
          const line = document.createElement("div");
          line.className = "p-2 bg-zinc-600 rounded cursor-move";
          line.textContent = opt;
          quizBox.appendChild(line);
        });
        const button = document.createElement("button");
        button.textContent = "✅ Check Order";
        button.className = "mt-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 rounded";
        button.addEventListener("click", () => {
          checkDragOrder(questionId, card.quiz.answer);
        });
        cardEl.appendChild(quizBox);
        cardEl.appendChild(button);
        new Sortable(quizBox, { animation: 150 });
      } else if (card.quiz.type === "multiple-choice") {
        card.quiz.options.forEach(opt => {
          const wrapper = document.createElement("div");
          const input = document.createElement("input");
          input.type = "radio";
          input.name = `q${index}`;
          input.value = opt;
          const label = document.createElement("label");
          label.textContent = opt;
          wrapper.appendChild(input);
          wrapper.appendChild(label);
          cardEl.appendChild(wrapper);
        });
        const button = document.createElement("button");
        button.textContent = "✅ Reveal Answer";
        button.className = "mt-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 rounded";
        button.addEventListener("click", () => {
          alert(`Answer: ${card.quiz.answer}`);
        });
        cardEl.appendChild(button);
      } else {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "w-full p-2 rounded bg-zinc-800 border border-zinc-600";
        input.placeholder = "Your answer...";
        const button = document.createElement("button");
        button.textContent = "✅ Reveal Answer";
        button.className = "mt-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 rounded";
        button.addEventListener("click", () => {
          alert(`Answer: ${card.quiz.answer}`);
        });
        cardEl.appendChild(input);
        cardEl.appendChild(button);
      }
      container.appendChild(cardEl);
    });
  } catch (err) {
    console.error("Quiz Error:", err);
    alert("Failed to generate quiz.");
  } finally {
    document.getElementById("loadingSpinner").classList.add("hidden");
  }
}

function checkDragOrder(containerId, correctAnswerArray) {
  const container = document.getElementById(containerId);
  const userOrder = Array.from(container.children).map(el => el.innerText.trim());
  const isCorrect =
    userOrder.length === correctAnswerArray.length &&
    userOrder.every((line, i) => line === correctAnswerArray[i]);
  const oldResult = container.parentElement.querySelector(".check-result");
  if (oldResult) oldResult.remove();
  const result = document.createElement("div");
  result.className = "check-result mt-2 font-semibold";
  result.textContent = isCorrect ? "✅ Correct!" : "❌ Incorrect. Try again!";
  result.classList.add(isCorrect ? "text-green-500" : "text-red-500");
  container.parentElement.appendChild(result);
}
