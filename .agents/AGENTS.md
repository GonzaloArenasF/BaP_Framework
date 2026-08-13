# Reglas de Desarrollo de BaP Framework (`.agents/AGENTS.md`)

Este archivo contiene las directivas y restricciones globales no negociables para el desarrollo y mantenimiento en proyectos basados en **BaP Framework**.

---

## 🛡️ 1. Filosofía de Arquitectura y Stack Tecnológico
* **Cero Frameworks Externos en el Cliente**: Se trabaja exclusivamente con **HTML5, CSS Vanilla y JavaScript Vanilla (puro)**.
* **Sin Dependencias Pesadas**: No importar ni sugerir bibliotecas client-side pesadas (React, Vue, Angular, jQuery, Tailwind, Bootstrap, etc.).
* **Servicios Integrados**: La integración nativa permitida y soportada incluye el ecosistema **Google Firebase** (Hosting, Auth, Realtime Database, Analytics, AppCheck/reCAPTCHA), Google Drive API v3 y **Google Gemini API (`src/_main/ai.js`)** (con soporte exclusivo de Google Gemini por el momento).
* **Límite de Capacidades**: El agente debe proponer soluciones strictly basadas en las capacidades nativas de BaP. Si una necesidad del usuario sobrepasa el alcance de BaP sin violar su arquitectura, se debe **informar explícitamente al desarrollador**.

---

## 🎨 2. Estilos y Sistema de Diseño Visual
* **Estilos Reutilizables**: Todas las clases globales y variables CSS residen en `src/style/` (colores, fuentes, layout base).
* **Estilos Aislados**: Estilos específicos de una página o componente habitan en su `index.css` o CSS local correspondiente.
* **Cero Estilos Inline**: **Prohibido utilizar estilos inline (`style="..."`)** en los archivos HTML de desarrollo.

---

## 🌐 3. Internacionalización (i18n) y Textos Estáticos
* **Prohibición de Textos Hardcoded**: Ninguna página o componente debe contener texto estático directamente codificado en archivos HTML.
* **Diccionario Único**: Todos los textos, títulos y metadatos SEO se declaran en `src/_main/i18n/es-ES.js`.
* **Tokens HTML**: En el HTML se deben usar llaves con el token correspondiente (ej. `{page.mi_pagina.body.desc}`).
* **SEO Obligatorio**: Toda página debe incluir `<title>`, `<meta name="description">` y etiquetas OpenGraph/Twitter Cards vinculadas a tokens de i18n.

---

## 🧩 4. Reserva de Prefijos de Custom Components
* **Prefijo Reservado `bap-`**: El prefijo `bap-` está **estrictamente reservado** para componentes nativos del núcleo del framework (ej. `bap-dialog`, `bap-header`, `bap-footer`, `bap-toast`).
* **Componentes de Usuario**: Cuando un desarrollador cree un componente para su propio sistema construido sobre BaP, se debe **sugerir un prefijo personalizado** (ej. `app-`, `sys-`) o **preguntarle explícitamente qué prefijo desea utilizar**.

---

## 🔒 5. Protección del Código Core (Arquitectura Limpia)
* **Modo Aplicación**: Si el usuario está construyendo una aplicación *sobre* BaP, los archivos del núcleo (`src/_main/`, componentes `bap-*`, etc.) **no deben ser modificados** para preservar la compatibilidad con futuras actualizaciones del framework.
* **Advertencia de Modificación**: Si el desarrollador intenta alterar archivos core, la IA debe advertirle que perderá la capacidad de actualizar el framework y sugerir contactar al equipo de BaP Framework.
* **Desarrollo del Core**: Esta restricción no aplica para los mantenedores/propietarios de BaP Framework trabajando directamente en la mejora del framework.

---

## 🧪 6. Validación Obligatoria con Tests Unitarios
* **Toda Modificación debe ser Validada**: No se considera completada ninguna tarea de código hasta haber ejecutado `npm run test` (o `npm run test:coverage`) y verificado que el 100% de las pruebas pasen.
* **Generación de Pruebas**: Al crear una página o componente, es **obligatorio** generar su respectivo archivo de pruebas unitarias inicial en `test/`.
* **Coverage del código debe estar por sobre el 80%**: En caso de no alcanzar el coverage del 80% se debe generar pruebas adicionales hasta alcanzar el objetivo.

---

## 🚀 7. Confirmación de Despliegue y Sincronización de Versiones
* **Confirmación Humana**: Siempre se debe **solicitar confirmación explícita al desarrollador** antes de ejecutar comandos de despliegue en producción (`npm run deploy-prod`).
* **Sincronización Síncrona de Versión**: Ante cualquier cambio de versión del framework, es obligatorio actualizar en simultáneo:
  1. `package.json`
  2. `bap.config.json`
  3. `README.md`
