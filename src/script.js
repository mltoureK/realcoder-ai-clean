let codeEditor;

// Remove all dropdowns except programming language
// Remove code editor and assignment instructions logic
// Add logic for folder upload and repo input

const BACKEND_URL = "http://localhost:3000";

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
  const repoUrl = document.getElementById("repoUrlInput").value;
  console.log("Repo URL:", repoUrl);
  if (!repoUrl) return alert("Please enter a repo URL.");
  
  try {
    console.log("Sending request to:", `${BACKEND_URL}/fetchRepo`);
    const response = await fetch(`${BACKEND_URL}/fetchRepo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl })
    });
    
    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);
    
    if (data.error) {
      alert(`Error: ${data.error}`);
      return;
    }
    
    alert(data.message || "Repo files loaded successfully!");
  } catch (error) {
    console.error("Repo load error:", error);
    alert("Failed to load repository. Please check the URL and try again.");
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
  // For demo: concatenate all file contents
  const code = files.map(f => `// ${f.name}\n${f.content}`).join("\n\n");
  const requestData = { code, language, message: "Generate quiz questions based on the uploaded code files" };
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
