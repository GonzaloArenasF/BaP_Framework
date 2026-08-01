import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../src/_main/analytics.js', () => ({
  analytic: {
    logEvent: {
      enterMigratorPage: vi.fn(),
    },
  },
}));

vi.mock('../../src/_components/customComponentsRegistration.js', () => ({
  setCustomComponents: vi.fn(),
}));

vi.mock('../../src/_main/i18n.js', () => ({
  getI18nContent: vi.fn(() => ({
    body: {
      status: {
        idle: "Esperando inicio...",
        in_progress: "Trabajando...",
        waiting_approval: "Esperando tu aprobación",
        rejected: "Revisión rechazada",
        error: "Error",
        done: "¡Migración completada!"
      }
    }
  })),
}));

describe('migrator/index.js — Dashboard Simulador AI', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <select id="project-select">
        <option value="" disabled selected>Selecciona</option>
      </select>
      <h4 id="current-status-label"></h4>
      <div id="progress-bar"></div>
      <div id="console-output"></div>
      <button id="btn-confirm" disabled></button>
      <button id="btn-start-migration" disabled></button>
      <div id="rejection-controls" style="display: none;"></div>
      <button id="btn-view-report"></button>
      <button id="btn-restart-step"></button>
      <button id="btn-restart-all"></button>
      <div id="agents-container"></div>
    `;

    // Observer to mock bap-dialog backdrop generation in JSDOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.firstElementChild && node.firstElementChild.tagName === 'BAP-DIALOG') {
            const dialog = node.firstElementChild;
            const dialogId = dialog.id;
            if (!document.getElementById(`${dialogId}-backdrop`)) {
              const backdrop = document.createElement('div');
              backdrop.id = `${dialogId}-backdrop`;
              backdrop.className = 'bap-dialog-backdrop';
              backdrop.innerHTML = `
                <div class="bap-dialog-container">
                  <div class="bap-dialog-actions">
                    <a class="primary">He leído y Apruebo</a>
                  </div>
                </div>
              `;
              document.body.appendChild(backdrop);
            }
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('MIG-01: inicializa la interfaz y puebla el selector de proyectos', async () => {
    await import('../../src/pages/migrator/index.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const select = document.getElementById('project-select');
    const btnStart = document.getElementById('btn-start-migration');

    expect(select.children.length).toBeGreaterThan(1);
    expect(btnStart.disabled).toBe(true);

    // Cambiar selección
    select.value = "Mock";
    select.dispatchEvent(new Event('change'));
    expect(btnStart.disabled).toBe(false);

    // Seleccionar vacío
    select.value = "";
    select.dispatchEvent(new Event('change'));
    expect(btnStart.disabled).toBe(true);
  });

  it('MIG-02: inicia la migración y avanza a través de los pasos', async () => {
    await import('../../src/pages/migrator/index.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const select = document.getElementById('project-select');
    const btnStart = document.getElementById('btn-start-migration');
    const statusLabel = document.getElementById('current-status-label');
    const btnConfirm = document.getElementById('btn-confirm');

    select.value = "Mock";
    select.dispatchEvent(new Event('change'));

    btnStart.click();
    expect(statusLabel.textContent).toBe("Trabajando...");

    // Paso 1: avanzar timer (5000ms + 200ms dialog)
    vi.advanceTimersByTime(5200);
    expect(statusLabel.textContent).toBe("Esperando tu aprobación");

    // Probar clic en "Ver Reporte de Etapa" (abre diálogo)
    btnConfirm.click();
    vi.advanceTimersByTime(200);

    // Probar clic en "Aprobar y Continuar"
    btnConfirm.click();
    vi.advanceTimersByTime(1200);
  });

  it('MIG-03: maneja el flujo completo de 6 pasos hasta completar la migración', async () => {
    await import('../../src/pages/migrator/index.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const select = document.getElementById('project-select');
    const btnStart = document.getElementById('btn-start-migration');
    const btnConfirm = document.getElementById('btn-confirm');

    select.value = "PlanningCoffee";
    select.dispatchEvent(new Event('change'));
    btnStart.click();

    // Avanzar los 6 pasos
    for (let step = 1; step <= 6; step++) {
      vi.advanceTimersByTime(5000);
      vi.advanceTimersByTime(200);
      btnConfirm.click();
      vi.advanceTimersByTime(1200);
    }

    expect(document.getElementById('current-status-label').textContent).toBe("¡Migración completada!");

    // Clic en Ver Informe Final
    btnConfirm.click();
    vi.advanceTimersByTime(200);
  });

  it('MIG-04: maneja rechazo de etapa, ver reporte y botones de reinicio', async () => {
    await import('../../src/pages/migrator/index.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const select = document.getElementById('project-select');
    const btnStart = document.getElementById('btn-start-migration');

    select.value = "bpmn-editor";
    select.dispatchEvent(new Event('change'));
    btnStart.click();

    vi.advanceTimersByTime(5200); // Llega a waiting_approval

    // Simular rechazo haciendo clic en el enlace "No aprobar"
    const rejectLink = document.querySelector('a[href="#reject"]');
    if (rejectLink) {
      rejectLink.click();
    }

    const btnViewReport = document.getElementById('btn-view-report');
    btnViewReport.click();
    vi.advanceTimersByTime(200);

    // Clic en reiniciar etapa
    const btnRestartStep = document.getElementById('btn-restart-step');
    btnRestartStep.click();
    expect(document.getElementById('current-status-label').textContent).toBe("Trabajando...");

    vi.advanceTimersByTime(5200);

    // Clic en reiniciar todo
    const btnRestartAll = document.getElementById('btn-restart-all');
    btnRestartAll.click();
    expect(document.getElementById('current-status-label').textContent).toBe("Trabajando...");
  });
});
