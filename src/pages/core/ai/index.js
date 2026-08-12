import { setCustomComponents } from "../../../_components/customComponentsRegistration.js";
import { applyI18n } from "../../../_main/i18n.js";
import { generateContent } from "../../../_main/ai.js";
import { parseMarkdown } from "../../../_main/markdown.js";

setCustomComponents();

document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.getElementById("ai-prompt-input");
  const runBtn = document.getElementById("btn-run-ai");
  const statusIndicator = document.getElementById("ai-status-indicator");
  const resultBox = document.getElementById("ai-result-box");

  if (!runBtn || !promptInput || !resultBox || !statusIndicator) {
    return;
  }

  runBtn.addEventListener("click", async () => {
    const promptText = promptInput.value.trim();
    if (!promptText) {
      statusIndicator.textContent = "⚠️ Ingresa una consulta primero.";
      statusIndicator.style.color = "#d9534f";
      return;
    }

    runBtn.disabled = true;
    statusIndicator.textContent = "⏳ Enviando petición a Gemini...";
    statusIndicator.style.color = "#0275d8";
    resultBox.innerHTML = "<em>Procesando respuesta del modelo...</em>";

    try {
      const responseText = await generateContent(promptText, {
        onStatusUpdate: (msg, type) => {
          statusIndicator.textContent = `ℹ️ ${msg}`;
          if (type === "warning" || type === "failover") {
            statusIndicator.style.color = "#f0ad4e";
          } else if (type === "error") {
            statusIndicator.style.color = "#d9534f";
          } else {
            statusIndicator.style.color = "#5cb85c";
          }
        }
      });

      resultBox.innerHTML = parseMarkdown(responseText);
      statusIndicator.textContent = "✅ Respuesta recibida con éxito.";
      statusIndicator.style.color = "#5cb85c";
    } catch (err) {
      console.error("Error en demo de IA:", err);
      resultBox.textContent = `Error: ${err.message || err}`;
      statusIndicator.textContent = "❌ Falló la consulta.";
      statusIndicator.style.color = "#d9534f";
    } finally {
      runBtn.disabled = false;
    }
  });

  applyI18n();
});
