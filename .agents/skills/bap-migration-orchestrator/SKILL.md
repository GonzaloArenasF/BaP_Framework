---
name: bap-migration-orchestrator
description: Orquesta y ejecuta la migración asistida por IA de cualquier proyecto legacy hacia BaP Framework v2.6.0, siguiendo estrictamente el protocolo de 8 etapas con pausas, fusión no destructiva y reportes de aprobación.
---

# Skill: bap-migration-orchestrator

Esta habilidad capacita al agente de IA para actuar como un **Orquestador de Migración**, ejecutando el proceso estandarizado de actualización de un proyecto legacy hacia **BaP Framework v2.6.0**.

---

## ⚠️ Requisito Previo Fundamental (Workspaces y Accesos)

> [!IMPORTANT]
> **Acceso a Repositorios Simultáneos:** Para que el agente pueda ejecutar la migración automatizada de forma limpia, es **IMPRESCINDIBLE** que la sesión del asistente tenga acceso de lectura/escritura (workspaces activos) a ambos repositorios simultáneamente:
> 1. **Repositorio Origen:** `BaP_Framework` (v2.6.0) como plantilla base.
> 2. **Repositorio Destino:** El proyecto legacy objetivo que será actualizado.

---

## 1. Reglas de Oro e Integridad de Git

1. **Ubicación Exclusiva de Cambios:** Todas las modificaciones de código se realizarán estrictamente en el repositorio del **proyecto legacy**. No modificar el repositorio de `BaP_Framework`.
2. **Rama Aislada de Git:** Crear y trabajar sobre la rama `refactor/bap-migration-ia` partiendo de `main` en el proyecto legacy.
3. **Fusión No Destructiva del Directorio `.agents/`:**
   - Copiar las habilidades del framework (`bap-*` en `.agents/skills/`) al proyecto destino sin eliminar ni sobrescribir las habilidades personalizadas preexistentes del desarrollador.
   - Si el proyecto destino ya tiene su propio archivo `.agents/AGENTS.md`, conservar sus directivas intactas e integrar las reglas del framework al final bajo la sección `## Directivas del Framework BaP (v2.6.0)`.
4. **Idioma de Trabajo e i18n:** Idioma de trabajo en Español. Fijar `es-ES` como idioma base de inyección.
5. **Pausa Obligatoria por Etapa:** Al concluir cada una de las 8 etapas, pausar la ejecución, generar el reporte en `docs/etapa-X-reporte.md` en el proyecto legacy y esperar la confirmación explícita del usuario antes de avanzar.
6. **Entregas Locales:** No realizar commits remotos, push ni despliegues a la nube.

---

## 2. Flujo de Ejecución de las 8 Etapas

### Etapa 1: Aislamiento, Respaldo y Limpieza del Legacy
- Crear rama `refactor/bap-migration-ia` en el proyecto legacy.
- Eliminar reportes anteriores en `docs/` del legacy.
- Crear directorio temporal `legacy-temp/` y mover todo el contenido existente (excepto `.git/`) a `/legacy-temp`.
- Validar limpieza absoluta de la raíz.

### Etapa 2: Copia e Instalación Limpia de BaP (v2.6.0)
- Copiar todos los archivos de `BaP_Framework` (rama `main`) a la raíz del legacy (excluyendo `.git/` y archivos `.md`).
- Ejecutar la **Fusión No Destructiva** de `.agents/` (`bap-*` skills y anexar `AGENTS.md` si ya existe).
- Preservar copia temporal de estilos BaP y combinar `.gitignore`.

### Etapa 3: Depuración del Boilerplate de BaP
- Eliminar páginas web de demostración (`src/pages/*`, incluyendo `pages/core/*` y `pages/migrator/*`).
- Remover directorio de estilos base (`src/style/`) y pruebas de fábrica (`test/*`).
- Eliminar dependencias obsoletas de testing (Jest) en `package.json`.
- Vaciar archivos `.env` y depurar `bap.config.json`.

### Etapa 4: Inventario y Declaración de Configuración
- Configurar `bap.config.json` con metadatos del legacy, `i18nItemsToProcess`, `appRoutes`, `analytics.customEvents` y `routes.realtimeDatabaseRoutes` (usando `{param}`).
- Si el proyecto utiliza IA o servicios core opcionales, declarar la sección `"ai"` o variables `.env` correspondientes.
- Parametrizar archivos `.env.development` y `.env.production`.
- Ajustar `firebase.json` para publicar desde `public/`.

### Etapa 5: Reconstrucción e Inyección de Recursos
- Restaurar `src/style/` del legacy y fusionar estilos BaP de forma no destructiva.
- Restaurar componentes de identidad (`bap-header`, `bap-footer`, logos) y `README.md` original.
- Refactorizar componentes legacy: envolver con contenedor principal `props.id` en `postRender` y heredar ID en `createCustomComponent`.
- Reemplazar mutaciones destructivas por `replaceTokensInDOM` y `applyI18n()` (cuyo callback es opcional en v2.6.0).
- Actualizar `storage.js` con cifrado AES-GCM (Web Crypto API).
- Estandarizar referencias globales `CONSTANT`, enums en `CONSTANT.ENUM` y constantes de navegación a mayúsculas.

### Etapa 6: Prueba de Compilación y Calidad
- Ejecutar `npm install` y `npm run optimize`.
- Verificar que el build por Gulp termine con exit code 0 y traducciones al 100% (sin tokens `{...}` sueltos en `public/`).

### Etapa 7: Generación de Pruebas Unitarias
- Escribir suite de pruebas unitarias (`test/*.test.js`) sobre **Vitest + JSDOM**.
- Configurar mocks genéricos para dependencias CDN/ESM en `test/setup.js` y `vitest.config.js`.
- Confirmar ejecución limpia de `npm run test` (exit code 0).

### Etapa 8: Estabilización y Limpieza Final
- Eliminar permanentemente la carpeta `legacy-temp/`.
- Actualizar `README.md` original acreditando la integración con **BaP Framework v2.6.0**.
- Escribir reporte final `docs/etapa-8-reporte.md` y presentar la entrega local al usuario.

---

## 3. Plantilla de Reporte de Etapa

Cada informe guardado en `docs/etapa-X-reporte.md` debe seguir esta plantilla:

```markdown
# Reporte de Etapa X: [Nombre de Etapa]

**Proyecto:** `[Nombre del Proyecto]`
**Fecha:** [Fecha]
**Rama:** `refactor/bap-migration-ia`
**Versión de BaP:** `v2.6.0`

## 1. Acciones Realizadas
- [x] [Detalle de acción 1]
- [x] [Detalle de acción 2]

## 2. Resultados de Verificación
- [x] [Resultado de test / build / auditoría]

> ✋ **Pausa de Aprobación:** La Etapa X se ha completado exitosamente. Se requiere confirmación explícita para proceder con la Etapa X+1.
```
