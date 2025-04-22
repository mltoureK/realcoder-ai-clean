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

    // Show spinner
    document.getElementById("loadingSpinner").classList.remove("hidden");
    document.getElementById("output").innerText = "";
    document.getElementById("tabs").innerHTML = "";

    try {
      const response = await fetch("http://localhost:3000/sendSMS", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.error) {
        document.getElementById("output").innerText = `Error: ${data.error}`;
        return;
      }

      const files = data.files;
      let firstFile = true;
     
      for (const [fileName, fileContent] of Object.entries(files)) {
        const tab = document.createElement("button");
         /*
      These are the tab style settings for the output of the files.
      */
        tab.className = `relative inline-flex items-center justify-center px-4 py-2 mb-2 text-sm font-medium text-black rounded-lg
                         bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600
                         focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800`;
        tab.innerText = fileName;

        tab.onclick = function () {
          document.querySelectorAll(".tab").forEach(t => t.classList.remove("ring", "ring-offset-2", "ring-cyan-400"));
          tab.classList.add("ring", "ring-offset-2", "ring-cyan-400");
          document.getElementById("output").innerText = fileContent;
        };

        tab.classList.add("tab");
        document.getElementById("tabs").appendChild(tab);

        if (firstFile) {
          tab.classList.add("ring", "ring-offset-2", "ring-cyan-400");
          document.getElementById("output").innerText = fileContent;
          firstFile = false;
        }
      }

    } catch (err) {
      document.getElementById("output").innerText = "An error occurred while generating code.";
    } finally {
      document.getElementById("loadingSpinner").classList.add("hidden");
    }
  }