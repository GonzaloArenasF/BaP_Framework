---
name: bap-component-creator
description: >-
  Crea un nuevo Web Component (Custom Element) para un sistema construido sobre BaP Framework.
  Reserva strictly el prefijo 'bap-' para componentes core del framework, consulta/sugiere prefijos
  personalizados para el desarrollador (ej: 'app-'), registra el componente en src/_components/customComponentsRegistration.js y bap.config.json,
  genera sus tests unitarios y actualiza la página de pruebas interactiva (src/pages/components/index.html).
  Usar cuando el usuario pida crear un nuevo componente visual o UI element.
---

# Creación de Custom Components (`bap-component-creator`)

Esta skill guía la creación aislada, reutilizable y la publicación completa de nuevos Custom Elements para la aplicación.

---

## 🛑 Regla Estricta de Prefijos

* **`bap-` es un prefijo RESERVADO**: No utilices el prefijo `bap-` para componentes desarrollados por el usuario para su propia aplicación.
* **Consulta de Prefijo**: Pregunta al desarrollador qué prefijo prefiere utilizar o sugiere alternativas como `app-`, `sys-` o `ui-` (ej: `<app-card>`, `<sys-button>`).

---

## 🛠️ Paso 1: Creación del Código del Componente

1. Crear el archivo del componente en `src/_components/<nombre-componente>/<nombre-componente>.js` (o `src/_components/<nombre-componente>.js`) utilizando la plantilla de [.agents/skills/bap-component-creator/templates/src/_components/component-template.js](./templates/src/_components/component-template.js).
2. Implementar la clase heredando de `HTMLElement`:
   - Definir el constructor, `connectedCallback()` y renderizado sin estilos inline.
   - Encapsular la lógica y eventos.

---

## ⚙️ Paso 2: Registro Obligatorio en `customComponentsRegistration.js` y `bap.config.json`

Para que el nuevo componente pueda ser instanciado y publicado en la aplicación, es **IMPRESCINDIBLE** registrarlo en ambos archivos:

1. **`src/_components/customComponentsRegistration.js`**:
   - Importar la clase del nuevo componente en la parte superior:
     ```javascript
     import { AppMiComponente } from "./app-mi-componente.js";
     ```
   - Dentro de la función `setCustomComponents()`, agregar la línea de registro:
     ```javascript
     !customElements.get("app-mi-componente") ? customElements.define("app-mi-componente", AppMiComponente) : null;
     ```

2. **`bap.config.json`**:
   - Registrar el nuevo componente en el bloque de componentes personalizados:
     ```json
     "components": {
       "custom": [
         {
           "name": "app-mi-componente",
           "path": "./src/_components/app-mi-componente.js"
         }
       ]
     }
     ```

---

## 🧪 Paso 3: Pruebas Unitarias Obligatorias

1. Crear el archivo de pruebas unitarias en `test/components/<nombre-componente>.test.js` utilizando la plantilla de [.agents/skills/bap-component-creator/templates/test/components/component-template.test.js](./templates/test/components/component-template.test.js).
2. Ejecutar la suite de pruebas para confirmar que se registra e instancia correctamente:
   ```bash
   npm run test
   ```

---

## 📚 Paso 4: Actualización de la Documentación Interactiva

1. Editar la página de documentación interactiva en `src/pages/components/index.html`.
2. Agregar la sección del nuevo componente con su especificación técnica, ejemplo de uso en HTML y bloque de prueba interactiva.
