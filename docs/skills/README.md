# Skills de Antigravity para BaP Framework

Este directorio especifica la arquitectura y el catálogo de **Skills** que potencian el desarrollo guiado por Inteligencia Artificial dentro de **BaP Framework**.

---

## 🤖 Ubicación de Ejecución (`.agents/skills/`)

Las habilidades activables por el agente de IA habitan físicamente en el directorio **`.agents/skills/`** de la raíz del proyecto para estar bajo control de versiones y disponibles para todo el equipo.

```text
.agents/
├── AGENTS.md                          # Reglas globales no negociables
└── skills/
    ├── bap-orchestrator/              # Orquestador pivote y evaluación de capacidades
    ├── bap-page-creator/              # Creación de páginas + i18n + SEO + tests
    ├── bap-component-creator/         # Creación de Custom Components (prefijo no bap-) + tests
    ├── bap-component-integration/     # Integración y personalización de componentes bap-*
    ├── bap-build-and-deploy/          # Pruebas, compilación Gulp y confirmación de deploy
    └── bap-security-auditor/          # Auditoría contra SECURITY.md
```

---

## 📍 Documentación Descentralizada por Dominio y Casos de Uso

Siguiendo la arquitectura de información de BaP Framework, la documentación de las habilidades se encuentra **distribuida en las secciones y README correspondientes a su ámbito funcional**:

| Skill | Ámbito / Dominio | Documentación en Código | Documentación Web HTML |
| :--- | :--- | :--- | :--- |
| **`bap-orchestrator`** | Orquestación global y evaluación de capacidades | [`.agents/AGENTS.md`](../../.agents/AGENTS.md) | [`/pages/pages/`](../../src/pages/pages/index.html) |
| **`bap-page-creator`** | Creación y ruteo de páginas/subpáginas | [`src/pages/README.md`](../../src/pages/README.md) | [`/pages/pages/`](../../src/pages/pages/index.html) |
| **`bap-component-creator`** | Creación de Custom Elements | [`src/_components/README.md`](../../src/_components/README.md) | [`/pages/components/`](../../src/pages/components/index.html) |
| **`bap-component-integration`** | Integración de componentes core `bap-*` | [`src/_components/README.md`](../../src/_components/README.md) | [`/pages/components/`](../../src/pages/components/index.html) |
| **`bap-build-and-deploy`** | Pruebas, build con Gulp y despliegue a Firebase | [`README.md` (root)](../../README.md) | [`/pages/build/`](../../src/pages/build/index.html) |
| **`bap-security-auditor`** | Auditoría contra el modelo de seguridad | [`SECURITY.md`](../../SECURITY.md) | [`/pages/core/`](../../src/pages/core/index.html) |

---

## 🧪 Pruebas Unitarias Obligatorias

Toda modificación realizada por cualquier skill debe ser validada automáticamente mediante:
```bash
npm run test
```
