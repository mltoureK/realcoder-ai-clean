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

  const message = document.getElementById("messageInput").value;
  const requestData = { code, language, message };
  

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

        new Sortable(quizBox, {
          animation: 150
        });

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
