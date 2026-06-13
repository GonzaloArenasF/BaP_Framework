import { analytic } from "../../_main/analytics.js";
import { setCustomComponents } from "../../_components/customComponentsRegistration.js";
import { getI18nContent } from "../../_main/i18n.js";
import { parseMarkdown } from "../../_main/markdown.js";

document.addEventListener("DOMContentLoaded", async () => {
  setCustomComponents();
  analytic.logEvent.enterMigratorPage();

  const select = document.getElementById("project-select");
  const statusLabel = document.getElementById("current-status-label");
  const progressBar = document.getElementById("progress-bar");
  const consoleOutput = document.getElementById("console-output");
  const btnConfirm = document.getElementById("btn-confirm");
  const btnStart = document.getElementById("btn-start-migration");
  
  const rejectionControls = document.getElementById("rejection-controls");
  const btnViewReport = document.getElementById("btn-view-report");
  const btnRestartStep = document.getElementById("btn-restart-step");
  const btnRestartAll = document.getElementById("btn-restart-all");
  
  const agentsContainer = document.getElementById("agents-container");

  const i18nMigrator = getI18nContent("page", "migrator");
  const statusDict = i18nMigrator?.body?.status || {
    idle: "Esperando inicio...",
    in_progress: "Trabajando...",
    waiting_approval: "Esperando tu aprobación",
    rejected: "Revisión rechazada",
    error: "Error",
    done: "¡Migración completada!"
  };

  let reportRead = false;
  
  // State Machine Local
  let state = {
    target_project: "",
    projects: ["Mock", "PlanningCoffee", "bpmn-editor", "gonzaloarenas-webpage", "cab-arquitectura.cl"],
    current_set_point: 0,
    status: "idle",
    log_tail: "Esperando selección de proyecto...",
    progress_percentage: 0,
    active_agents: [],
    step_report: "",
    final_report: ""
  };

  // Step names
  const stepNames = [
    "",
    "Auditoría Inicial",
    "Extracción de Configuración",
    "Reemplazo del Core",
    "Refactorización (AI)",
    "Estabilización y Pruebas"
  ];

  // Mock data generator
  const getMockDataForStep = (step) => {
    const roles = ["Investigador", "Auditor CSS", "Refactorizador JS", "Estabilizador", "Deployer"];
    const tasks = [
      "Analizando dependencias y configuraciones legacy...",
      "Extrayendo configuraciones y variables de entorno...",
      "Reemplazando librerías core por componentes nativos BaP...",
      "Refactorizando lógica y web components...",
      "Ejecutando pruebas de estabilización finales..."
    ];
    
    // Generar lista de archivos mockeados
    const files = [
      "`src/package.json` - Dependencias desactualizadas encontradas.",
      "`src/styles/main.css` - Identificados 14 estilos en desuso.",
      "`src/components/old-button.js` - Web Component legacy detectado.",
      "`src/utils/helpers.js` - Funciones incompatibles con v2.4.0.",
      "`src/app.js` - Router principal necesita actualización."
    ];
    
    const fileList = files.slice(0, step).map(f => `* ${f}`).join("\n");
    const stepTitle = stepNames[step];
    
    const branchNote = step === 1 ? `\n\n> **🛠️ Entorno de Trabajo Aislado:** Se ha creado automáticamente la rama local \`refactor/bap-migration\` e hizo *checkout* hacia ella para proteger el código original del proyecto.` : "";

    const report = `### Informe de Análisis: ${stepTitle}

La fase de **${stepTitle}** ha concluido con éxito. A continuación se presenta el desglose técnico y las acciones realizadas por los sub-agentes.

#### 📊 Resumen de Métrica
| Métrica | Valor | Estado |
|---------|-------|--------|
| Archivos Escaneados | ${step * 45} | ✅ Completado |
| Componentes Evaluados | ${step * 12} | ⚠️ Aprobado |
| Deuda Técnica (Legacy) | Alto | 🚨 Mitigada |
| Tiempo de Procesamiento | ${(step * 1.5).toFixed(1)}s | ⚡ Óptimo |

#### 📂 Detalle de Hallazgos Principales
${fileList}
${branchNote}

#### 🛠️ Resoluciones Aplicadas
Durante la ejecución, se aplicó la siguiente regla de transformación estándar en los archivos impactados:

\`\`\`javascript
// Ejemplo de refactorización estructural detectada
- import { legacyComponent } from 'old-bap';
+ import { bapComponent } from '@bap/core';

// Inyección de dependencias actualizadas
- const app = new legacyComponent();
+ const app = await bapComponent.init({ strict: true });
\`\`\`

> **🔒 Regla de Oro Cumplida:** Ningún archivo interno del *BaP Framework* ha sido alterado. Todas las modificaciones se ejecutaron estrictamente en el entorno aislado del proyecto \`${state.target_project}\`.

¿Estás de acuerdo con el informe de la IA y autorizas continuar a la siguiente fase?`;

    return {
      agents: [
        { id: `agent-${step}`, role: roles[step-1] || "Agente", task: tasks[step-1] || "Procesando..." }
      ],
      report
    };
  };

  const parseMarkdownEnhanced = (md) => {
    if (!md) return "";
    let text = md.replace(/\r\n/g, '\n');
    
    // 1. Proteger bloques de código
    const codeBlocks = [];
    text = text.replace(/```(?:[a-z]+)?\n([\s\S]*?)```/gi, function (match, code) {
      const escaped = code.trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      codeBlocks.push(`<pre style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 6px; overflow-x: auto;"><code>${escaped}</code></pre>`);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // 2. Encabezados
    text = text.replace(/^#### (.*$)/gim, '<h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--accent-color, #62aec4); font-size: 1.1rem;">$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--accent-color, #62aec4); font-size: 1.3rem;">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 style="margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.5rem;">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 style="margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.8rem;">$1</h1>');

    // 3. Tablas Markdown a HTML
    text = text.replace(/(?:\|.*\|\n?)+/g, (match) => {
      const rows = match.trim().split('\n');
      if (rows.length < 3) return match; 
      let html = '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.9em;"><thead><tr>';
      const headers = rows[0].split('|').filter((c, i, arr) => !(i === 0 && c === '') && !(i === arr.length - 1 && c === ''));
      headers.forEach(h => html += `<th style="padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(98,174,196,0.05); font-weight: 600; color: var(--accent-color, #62aec4);">${h.trim()}</th>`);
      html += '</tr></thead><tbody>';
      for (let i = 2; i < rows.length; i++) {
        if (rows[i].includes('---')) continue; // Skip separator line again if present
        html += '<tr>';
        const cells = rows[i].split('|').filter((c, j, arr) => !(j === 0 && c === '') && !(j === arr.length - 1 && c === ''));
        cells.forEach(c => html += `<td style="padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05);">${c.trim()}</td>`);
        html += '</tr>';
      }
      html += '</tbody></table></div>';
      return html;
    });

    // 4. Blockquotes
    text = text.replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid var(--accent-color, #62aec4); margin-left: 0; color: rgba(255,255,255,0.8); background: rgba(98,174,196,0.05); padding: 0.5rem 1rem; border-radius: 0 4px 4px 0; margin-bottom: 1rem;">$1</blockquote>');

    // 5. Listas
    text = text.replace(/^\s*[\-\*] (.*)/gim, '<ul><li style="margin-bottom: 0.25rem; margin-left: 1.5rem;">$1</li></ul>');
    text = text.replace(/<\/ul>\n<ul>/g, '\n');

    // 6. Estilos en línea
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.3); padding: 0.1rem 0.3rem; border-radius: 4px; font-family: monospace;">$1</code>');

    // 7. Párrafos
    let paragraphs = text.split(/\n\n+/);
    paragraphs = paragraphs.map(p => {
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|table|div)>/i.test(p) || /^__CODE_BLOCK_/.test(p)) return p;
      return `<p style="margin-bottom: 1rem; line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`;
    });
    text = paragraphs.join('\n');

    // 8. Restaurar bloques de código
    text = text.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
      return codeBlocks[index];
    });

    return text;
  };

  const createAndShowDialog = (titleMain, titleSub, markdownText, isFullscreen, onApprove, onReject, showDownloadBtn = false) => {
    const dialogId = 'dialog-' + Math.random().toString(36).substr(2, 9);
    const container = document.createElement('div');
    
    let linkAttr = "";
    if (onApprove) {
      // Usar el link nativo de bap-dialog codificando en base64
      const b64Text = btoa(unescape(encodeURIComponent("He leído y Apruebo")));
      const b64Url = btoa("#approve");
      linkAttr = `link-text-base64="${b64Text}" link-url-base64="${b64Url}"`;
    }
    
    container.innerHTML = `
      <bap-dialog id="${dialogId}" 
        ${isFullscreen ? 'class="fullscreen-dialog"' : ''}
        title-top="Reporte IA" 
        title-main="${titleMain}" 
        title-sub="${titleSub}"
        ${linkAttr}>
        <div class="markdown-body" style="text-align: left; overflow-x: hidden; width: 100%; box-sizing: border-box; max-height: 50vh; overflow-y: auto; padding-right: 1rem;">
          ${parseMarkdownEnhanced(markdownText)}
        </div>
      </bap-dialog>
    `;
    document.body.appendChild(container);
    
    if (onApprove || onReject || showDownloadBtn) {
      setTimeout(() => {
        // Encontrar el backdrop generado por el componente
        const backdrop = document.getElementById(`${dialogId}-backdrop`);
        if (backdrop) {
          
          if (onReject) {
            const actionsContainer = backdrop.querySelector('.bap-dialog-actions');
            if (actionsContainer) {
              const rejectBtn = document.createElement('a');
              rejectBtn.href = "#reject";
              rejectBtn.textContent = "No aprobar";
              rejectBtn.style.borderColor = "#c62828";
              rejectBtn.style.color = "#c62828";
              
              rejectBtn.addEventListener('mouseover', () => {
                rejectBtn.style.backgroundColor = "#c62828";
                rejectBtn.style.color = "#ffffff";
              });
              rejectBtn.addEventListener('mouseout', () => {
                rejectBtn.style.backgroundColor = "transparent";
                rejectBtn.style.color = "#c62828";
              });

              actionsContainer.insertBefore(rejectBtn, actionsContainer.firstChild);
              
              rejectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                onReject();
                const closeBtn = document.getElementById(`${dialogId}-close`);
                if (closeBtn) closeBtn.click();
              });
            }
          }

          if (onApprove) {
            const links = backdrop.querySelectorAll('.bap-dialog-actions a.primary');
            links.forEach(link => {
              link.addEventListener('click', (e) => {
                e.preventDefault(); // Evitar abrir la pestaña
                onApprove();
                const closeBtn = document.getElementById(`${dialogId}-close`);
                if (closeBtn) closeBtn.click();
              });
            });
          }

          if (showDownloadBtn) {
            const actionsContainer = backdrop.querySelector('.bap-dialog-actions');
            if (actionsContainer) {
              const downloadBtn = document.createElement('a');
              downloadBtn.href = "#download";
              downloadBtn.textContent = "Descargar Informe (MD)";
              downloadBtn.style.borderColor = "#62aec4";
              downloadBtn.style.color = "#62aec4";
              downloadBtn.style.marginRight = "auto";
              
              downloadBtn.addEventListener('mouseover', () => {
                downloadBtn.style.backgroundColor = "#62aec4";
                downloadBtn.style.color = "#ffffff";
              });
              downloadBtn.addEventListener('mouseout', () => {
                downloadBtn.style.backgroundColor = "transparent";
                downloadBtn.style.color = "#62aec4";
              });

              actionsContainer.insertBefore(downloadBtn, actionsContainer.firstChild);
              
              downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const blob = new Blob([markdownText], { type: "text/markdown;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Reporte_${state.target_project}.md`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              });
            }
          }
        }
      }, 150);
    }
  };

  const updateDashboard = (data) => {
    if (select.options.length <= 1 && data.projects) {
      data.projects.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        if (data.target_project === p) opt.selected = true;
        select.appendChild(opt);
      });
    }

    progressBar.style.width = `${data.progress_percentage}%`;
    statusLabel.textContent = statusDict[data.status] || data.status;

    if (data.status === "idle") {
      btnConfirm.style.display = "none";
      rejectionControls.style.display = "none";
      select.disabled = false;
      btnStart.style.display = "block";
    } else if (data.status === "in_progress") {
      select.disabled = true;
      btnStart.style.display = "none";
      rejectionControls.style.display = "none";
      btnConfirm.style.display = "block";
      btnConfirm.disabled = true;
      btnConfirm.textContent = "Trabajando...";
      reportRead = false;
    } else if (data.status === "waiting_approval") {
      rejectionControls.style.display = "none";
      btnConfirm.style.display = "block";
      if (reportRead) {
        btnConfirm.disabled = false;
        btnConfirm.textContent = "Aprobar y Continuar";
      } else {
        btnConfirm.disabled = false;
        btnConfirm.textContent = "Ver Reporte de Etapa";
      }
    } else if (data.status === "rejected") {
      btnConfirm.style.display = "none";
      rejectionControls.style.display = "flex";
    } else if (data.status === "done") {
      rejectionControls.style.display = "none";
      btnConfirm.style.display = "block";
      btnConfirm.disabled = false;
      btnConfirm.textContent = "Ver Informe Final";
    }

    for (let i = 1; i <= 5; i++) {
      const stepEl = document.getElementById(`step-${i}`);
      const stepSpinner = document.getElementById(`spinner-container-${i}`);
      if (!stepEl) continue;
      stepEl.classList.remove("active", "done");
      if (i < data.current_set_point) {
        stepEl.classList.add("done");
        if (stepSpinner) stepSpinner.style.display = "none";
      } else if (i === data.current_set_point) {
        stepEl.classList.add("active");
        if (stepSpinner) stepSpinner.style.display = (data.status === "in_progress") ? "block" : "none";
      } else {
        if (stepSpinner) stepSpinner.style.display = "none";
      }
    }

    if (data.log_tail) {
      const lastLog = consoleOutput.lastElementChild;
      if (!lastLog || lastLog.textContent !== data.log_tail) {
        const line = document.createElement("div");
        line.className = "log-line";
        if (data.status === "error") line.classList.add("error");
        if (data.status === "done") line.classList.add("success");
        line.textContent = data.log_tail;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
      }
    }

    renderAgents(data.active_agents || []);
  };

  const renderAgents = (agents) => {
    if (agents.length === 0) {
      agentsContainer.innerHTML = "<p style='color:#888; font-size:0.9rem;'>No hay sub-agentes activos en este momento.</p>";
      return;
    }
    const currentAgentIds = Array.from(agentsContainer.querySelectorAll(".agent-node")).map(n => n.dataset.id).join(",");
    const newAgentIds = agents.map(a => a.id).join(",");
    
    if (currentAgentIds === newAgentIds) {
      agents.forEach(agent => {
        const node = agentsContainer.querySelector(`.agent-node[data-id="${agent.id}"] .agent-task`);
        if (node) node.textContent = agent.task;
      });
      return;
    }

    agentsContainer.innerHTML = "";
    agents.forEach(agent => {
      const el = document.createElement("div");
      el.className = "agent-node";
      el.dataset.id = agent.id;
      el.innerHTML = `
        <div class="agent-header">
          <bap-svg-image name="search" size="x1"></bap-svg-image> ${agent.role}
        </div>
        <div class="agent-task">${agent.task}</div>
      `;
      agentsContainer.appendChild(el);
    });
  };

  const loadCurrentState = () => {
    updateDashboard(state);
  };

  const advanceToWaiting = () => {
    state.status = "waiting_approval";
    const stepTitle = stepNames[state.current_set_point];
    state.log_tail = `Etapa "${stepTitle}" finalizada. Esperando aprobación...`;
    const mockData = getMockDataForStep(state.current_set_point);
    state.step_report = mockData.report;
    loadCurrentState();

    // Auto-open dialog
    createAndShowDialog(stepTitle, "Esperando tu revisión", state.step_report, false, approveAndContinue, rejectAndRestart);
  };

  const startWorkingOnStep = (step) => {
    state.current_set_point = step;
    state.status = "in_progress";
    state.progress_percentage = (step - 1) * 20 + 10;
    const stepTitle = stepNames[step];
    state.log_tail = `Ejecutando etapa "${stepTitle}"...`;
    const mockData = getMockDataForStep(step);
    state.active_agents = mockData.agents;
    loadCurrentState();

    // Trabajar durante 5 segundos
    setTimeout(() => {
      state.progress_percentage = step * 20;
      advanceToWaiting();
    }, 5000);
  };

  select.addEventListener("change", (e) => {
    if (e.target.value !== "") {
      btnStart.disabled = false;
      btnStart.style.opacity = "1";
    } else {
      btnStart.disabled = true;
      btnStart.style.opacity = "0.5";
    }
  });

  const approveAndContinue = () => {
    btnConfirm.disabled = true;
    const stepTitle = stepNames[state.current_set_point];
    const line = document.createElement("div");
    line.className = "log-line success";
    line.textContent = `Aprobación de la etapa "${stepTitle}" enviada. Reanudando...`;
    consoleOutput.appendChild(line);
    
    setTimeout(() => {
      if (state.current_set_point >= 5) {
        state.status = "done";
        state.progress_percentage = 100;
        state.active_agents = [];
        state.log_tail = "Migración completada exitosamente.";
        state.final_report = `# 🚀 Informe Final de Migración Asistida

El proyecto **${state.target_project}** ha finalizado su ciclo de refactorización automatizada.

## 📈 Resumen Ejecutivo
La migración se completó a través de 5 etapas orquestadas por sub-agentes especializados de la capa Antigravity.

* **Total de archivos escaneados:** 225
* **Componentes refactorizados:** 42
* **Dependencias deprecadas eliminadas:** 14

## 🛡️ Cumplimiento de Restricciones
> **Regla de Oro Garantizada:** Ningún archivo base del entorno de BaP Framework sufrió alteraciones ni reescrituras. Las intervenciones de código de la IA se limitaron exclusivamente al alcance del código fuente de \`${state.target_project}\`.

## 📋 Lista de Verificación y Cierre
Se requiere validación humana para dar el cierre definitivo:
- [ ] Ejecutar \`npm run test\` en el directorio local del proyecto.
- [ ] Validar inyección de nuevas variables de entorno en el archivo \`.env.production\`.
- [ ] Realizar una inspección visual de UI/UX en dispositivos móviles.
- [ ] Aprobar y enviar *Pull Request* al repositorio de Staging.

*Reporte auto-generado por el orquestador de IA.*`;
        loadCurrentState();
      } else {
        startWorkingOnStep(state.current_set_point + 1);
      }
    }, 1000);
  };

  const rejectAndRestart = () => {
    state.status = "rejected";
    const stepTitle = stepNames[state.current_set_point];
    state.log_tail = `La etapa "${stepTitle}" no fue aprobada. Esperando decisión...`;
    loadCurrentState();
  };

  btnStart.addEventListener("click", () => {
    if (select.value === "") return;
    state.target_project = select.value;
    startWorkingOnStep(1);
  });

  // Eventos de rechazo
  btnViewReport.addEventListener("click", () => {
    const stepTitle = stepNames[state.current_set_point] || `Set Point ${state.current_set_point}`;
    createAndShowDialog(stepTitle, "Esperando tu revisión", state.step_report, false, approveAndContinue, rejectAndRestart);
  });

  btnRestartStep.addEventListener("click", () => {
    const stepTitle = stepNames[state.current_set_point];
    const line = document.createElement("div");
    line.className = "log-line error";
    line.textContent = `Reiniciando etapa "${stepTitle}"...`;
    consoleOutput.appendChild(line);
    
    // Al reiniciar, borramos el reporte previo y volvemos a in_progress
    state.step_report = "";
    reportRead = false;
    startWorkingOnStep(state.current_set_point);
  });

  btnRestartAll.addEventListener("click", () => {
    const line = document.createElement("div");
    line.className = "log-line error";
    line.textContent = `Reiniciando TODO el proceso...`;
    consoleOutput.appendChild(line);
    
    // Reiniciar por completo
    state.current_set_point = 0;
    state.step_report = "";
    reportRead = false;
    startWorkingOnStep(1);
  });

  btnConfirm.addEventListener("click", () => {
    if (btnConfirm.textContent === "Ver Reporte de Etapa") {
      const stepTitle = stepNames[state.current_set_point] || `Set Point ${state.current_set_point}`;
      createAndShowDialog(stepTitle, "Esperando tu revisión", state.step_report, false, approveAndContinue, rejectAndRestart);
    } else if (btnConfirm.textContent === "Aprobar y Continuar") {
      approveAndContinue();
    } else if (btnConfirm.textContent === "Ver Informe Final") {
      createAndShowDialog("Migración Completada", "Informe final del proceso", state.final_report, true, null, null, true);
    }
  });

  loadCurrentState();
});


