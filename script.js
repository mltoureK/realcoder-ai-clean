let codeEditor;

document.addEventListener("DOMContentLoaded", function () {
  codeEditor = CodeMirror.fromTextArea(document.getElementById("codeOutputEditor"), {
    lineNumbers: true,
    mode: "javascript",
    theme: "material",
    tabSize: 2,
    viewportMargin: Infinity
  });

  document.getElementById("generateButton").addEventListener("click", generateCode);
  document.getElementById("generateQuizButton").addEventListener("click", generateQuiz);
});

async function generateCode() {
  const message = document.getElementById("messageInput").value;
  const language = document.getElementById("language").value;
  const namingConvention = document.getElementById("namingConvention").value;
  const commentStyle = document.getElementById("commentStyle").value;
  const errorHandling = document.getElementById("errorHandling").checked ? "Include proper error handling" : "No error handling needed";
  const codeComplexity = document.getElementById("codeComplexity").value;

  const requestData = {
    message,
    language,
    namingConvention,
    commentStyle,
    errorHandling,
    codeComplexity
  };

  document.getElementById("loadingSpinner").classList.remove("hidden");
  document.getElementById("tabs").innerHTML = "";

  try {
    const response = await fetch("http://localhost:3000/sendSMS", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();
    if (data.error) {
      alert(`Error: ${data.error}`);
      return;
    }

    const files = data.files;
    let firstFile = true;

    for (const [fileName, fileContent] of Object.entries(files)) {
      const tab = document.createElement("button");
      tab.className = "tab px-4 py-2 mb-2 text-sm font-medium text-black bg-zinc-700 hover:bg-zinc-600 rounded-lg ring-1 ring-zinc-500";
      tab.innerText = fileName;

      tab.onclick = function () {
        document.querySelectorAll(".tab").forEach((t) => t.classList.remove("ring", "ring-offset-2", "ring-cyan-400"));
        tab.classList.add("ring", "ring-offset-2", "ring-cyan-400");

        const ext = fileName.split(".").pop();
        const modeMap = { js: "javascript", py: "python", java: "text/x-java", cpp: "text/x-c++src" };
        const mode = modeMap[ext] || "javascript";

        codeEditor.setOption("mode", mode);
        codeEditor.setValue(fileContent);
      };

      document.getElementById("tabs").appendChild(tab);

      if (firstFile) {
        tab.click();
        firstFile = false;
      }
    }
  } catch (err) {
    alert("An error occurred while generating code.");
    console.error(err);
  } finally {
    document.getElementById("loadingSpinner").classList.add("hidden");
  }
}

async function generateQuiz() {
  

  const code = codeEditor.getValue();
  const language = document.getElementById("language").value;

  if (!code.trim()) {
    alert("Generate code first!");
    return;
  }

  const requestData = { code, language };

  document.getElementById("loadingSpinner").classList.remove("hidden");
  document.getElementById("quizContainer").innerHTML = "";

  try {
    const response = await fetch("http://localhost:3000/generateQuiz", {
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

      let quizContent = "";
      if (card.quiz.type === "drag-and-drop") {
        quizContent = `
          <div class="sortable-options space-y-2 p-2 bg-zinc-800 rounded" id="${questionId}">
            ${card.quiz.options.map(opt => `<div class="p-2 bg-zinc-600 rounded cursor-move">${opt}</div>`).join('')}
          </div>
          <button onclick="checkDragOrder('${questionId}', '${card.quiz.answer}')"
            class="mt-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 rounded">✅ Check Order</button>
        `;
      } else if (card.quiz.type === "multiple-choice") {
        quizContent = `
          ${card.quiz.options.map(opt => `
            <div>
              <input type="radio" name="q${index}" value="${opt}" />
              <label>${opt}</label>
            </div>`).join('')}
          <button onclick="alert('Answer: ${card.quiz.answer}')"
            class="mt-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 rounded">✅ Reveal Answer</button>
        `;
      } else {
        quizContent = `
          <input type="text" class="w-full p-2 rounded bg-zinc-800 border border-zinc-600" placeholder="Your answer...">
          <button onclick="alert('Answer: ${card.quiz.answer}')"
            class="mt-2 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 rounded">✅ Reveal Answer</button>
        `;
      }

      cardEl.innerHTML = `
        <h2 class="font-semibold text-white mb-2">Card ${index + 1}</h2>
        <pre class="bg-zinc-800 p-2 rounded text-gray-300 text-sm mb-2">${card.snippet}</pre>
        <p class="text-gray-300 mb-2">${card.explanation}</p>
        <strong class="text-white">Question:</strong>
        <p class="text-gray-200 mb-2">${card.quiz.question}</p>
        ${quizContent}
      `;

      container.appendChild(cardEl);

      if (card.quiz.type === "drag-and-drop") {
        new Sortable(document.getElementById(questionId), {
          animation: 150
        });
      }
    });
  } catch (err) {
    console.error("Quiz Error:", err);
    alert("Failed to generate quiz.");
  } finally {
    document.getElementById("loadingSpinner").classList.add("hidden");
  }
}

function checkDragOrder(containerId, correctAnswer) {
  const container = document.getElementById(containerId);
  const currentOrder = Array.from(container.children).map(el => el.innerText.trim()).join(", ");
  const isCorrect = currentOrder === correctAnswer;
  alert(isCorrect ? "✅ Correct Order!" : `❌ Wrong order.\nExpected: ${correctAnswer}`);
}
