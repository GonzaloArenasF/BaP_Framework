---
name: bap-ai-integration
description: Guía y mejores prácticas para utilizar e integrar el motor de inteligencia artificial (Google Gemini API) en aplicaciones basadas en BaP Framework.
---

# Skill: Integración de IA con BaP Framework (`bap-ai-integration`)

Esta habilidad orienta a los agentes sobre cómo consumir de forma segura y estandarizada las capacidades de Inteligencia Artificial en aplicaciones construidas sobre **BaP Framework**.

> [!IMPORTANT]
> **Soporte de Proveedores**: Actualmente, BaP Framework cuenta únicamente con soporte integrado para la API de **Google Gemini**.

---

## 1. Principios de Arquitectura

1. **Infraestructura en el Core (`src/_main/ai.js`)**:
   - Nunca reimplementar llamadas directas a la API de Gemini ni instanciar `GoogleGenerativeAI` fuera de `_main/ai.js`.
   - Utilizar siempre `generateContent(promptText, options)` importado desde `src/_main/ai.js`.

2. **Desacoplamiento de Lógica de Dominio**:
   - La lógica de negocio o prompts específicos de la aplicación deben residir en servicios propios de la aplicación (ejemplo: `src/pages/[vista]/_services/[servicio]AiService.js` o `src/_services/`).
   - El código en `src/_main/ai.js` debe mantenerse 100% agnóstico a cualquier aplicación particular.

3. **Configuración Centralizada (`bap.config.json`)**:
   - Configurar la sección `"ai"` en `bap.config.json`:
     ```json
     "ai": {
       "models": ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"],
       "temperature": 0.1,
       "instructions": {
         "default": "Instrucción de sistema predeterminada"
       }
     }
     ```

4. **Variables de Entorno**:
   - Asegurar que la clave de API exista en el archivo `.env` local bajo el nombre `AI_API_KEY`.
   - Gulp inyectará automáticamente `AI_API_KEY` en `CONSTANT.AI.API_KEY` durante el build.

---

## 2. Ejemplo de Uso en Servicios de Aplicación

```javascript
import { generateContent } from "../../_main/ai.js";

export async function processApplicationTask(userQuery, statusCallback) {
  try {
    const response = await generateContent(userQuery, {
      temperature: 0.2,
      onStatusUpdate: (message, type) => {
        if (statusCallback) statusCallback(message, type);
      }
    });
    return response;
  } catch (error) {
    console.error("Error al procesar tarea con IA:", error);
    throw error;
  }
}
```
