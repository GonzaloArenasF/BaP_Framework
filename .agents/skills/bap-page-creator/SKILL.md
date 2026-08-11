---
name: bap-page-creator
description: >-
  Crea una nueva página o sección en BaP Framework siguiendo los estándares del proyecto:
  pregunta si incluir bap-header/bap-footer o componentes propios, registra rutas en bap.config.json,
  crea llaves i18n y metadatos SEO en es-ES.js, genera los tests unitarios iniciales y valida con npm run test.
  Usar cuando el usuario pida agregar una nueva página, vista o sección en BaP.
---

# Creación de Páginas en BaP Framework (`bap-page-creator`)

Esta skill guía la creación completa y estandarizada de nuevas páginas en la aplicación.

---

## 🙋‍♂️ Paso 1: Interacción Inicial con el Desarrollador

Antes de escribir código, consulta al desarrollador:
1. **Header / Footer**: "¿Deseas incluir los componentes base `bap-header` y `bap-footer` en esta página, u prefieres utilizar componentes personalizados previamente creados?"
2. **Estructura de Ruta**: Confirmar la URL pública que tendrá la página (ej: `/pages/contacto/`).

---

## 🛠️ Paso 2: Creación de Archivos de la Página

1. Crear el directorio `src/pages/<nombre_pagina>/`.
2. Crear `index.html` basándote en la plantilla de [.agents/skills/bap-page-creator/templates/src/pages/page-template/index.html](./templates/src/pages/page-template/index.html):
   - Incluir metadatos SEO con tokens i18n (`{page.<nombre_pagina>.head.title}`, `{page.<nombre_pagina>.head.desc}`).
   - Prohibido textos hardcodeados o estilos inline.
   - Insertar `bap-header` y `bap-footer` (o los componentes elegidos por el usuario).
3. Crear `index.js` basándote en la plantilla de [.agents/skills/bap-page-creator/templates/src/pages/page-template/index.js](./templates/src/pages/page-template/index.js):
   - Inicializar la lógica de la página.
   - Registrar el evento de telemetría de entrada (`enter_page_<nombre_pagina>`).

---

## ⚙️ Paso 3: Configuración Centralizada e Internacionalización

1. **`bap.config.json`**:
   - Registrar la nueva URL en `routes.appRoutes` (ej. `"/pages/<nombre_pagina>/"`).
   - Registrar el evento de telemetría en `analytics.customEvents` (ej. `"enter_page_<nombre_pagina>": { "type": "enter_page", "description": "..." }`).
2. **`src/_main/i18n/es-ES.js`**:
   - Declarar el bloque de traducción para la nueva página:
     ```javascript
     page: {
       <nombre_pagina>: {
         head: { title: "...", desc: "..." },
         body: { title: "...", desc: "..." }
       }
     }
     ```

---

## 🧪 Paso 4: Pruebas Unitarias Obligatorias

1. Crear el archivo de test inicial en `test/pages/<nombre_pagina>.test.js` utilizando la plantilla de [.agents/skills/bap-page-creator/templates/test/pages/page-template.test.js](./templates/test/pages/page-template.test.js).
2. Ejecutar la suite de pruebas para verificar que la página compila y pasa los tests:
   ```bash
   npm run test
   ```

---

## 📋 Paso 5: Verificación Final

1. Confirmar que `npm run test` pasa sin errores.
2. Iniciar el servidor de desarrollo (`npm run server`) y verificar que el navegador cargue los tokens de i18n correctamente sin errores en la consola.
