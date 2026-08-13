import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
import { CONSTANT } from "./constants.js";
import { getI18nContent } from "./i18n.js";

/**
 * Invoca de manera segura la API de Google Gemini implementando reintentos con
 * retardo exponencial (exponential backoff) y conmutación por error (failover) entre modelos.
 *
 * ⚠️ Nota de compatibilidad: Por el momento, el módulo de IA del núcleo de BaP Framework
 * cuenta con soporte exclusivo para la API de Google Gemini.
 *
 * @param {GoogleGenerativeAI} genAI - Instancia inicializada de GoogleGenerativeAI.
 * @param {object} modelConfig - Parámetros de configuración ({ systemInstruction, temperature })
 * @param {any} prompt - Payload para la generación de contenido (cadena de texto u objeto contents)
 * @param {Array} modelsList - Lista ordenada de modelos a probar (failover list)
 * @param {Function} [onStatusUpdate] - Callback opcional para reportar estado a la UI
 * @returns {Promise<any>} Respuesta generada por el modelo.
 */
export async function generateContentWithRetryAndFallback(genAI, modelConfig, prompt, modelsList, onStatusUpdate) {
  const modelsToTry = (modelsList && Array.isArray(modelsList) && modelsList.length > 0)
    ? modelsList
    : CONSTANT.AI.MODELS;

  if (!modelsToTry || modelsToTry.length === 0) {
    throw new Error("[Gemini API Error]: No se ha especificado una lista válida de modelos.");
  }

  let lastError = null;
  const i18n = getI18nContent("component", "bapAi") || {
    statusQueryingModel: "Consultando modelo {modelName}...",
    statusResponseSuccess: "Respuesta recibida de {modelName} con éxito.",
    statusRetrying: "Reintentando {modelName} en {delay}ms por alta demanda...",
    statusFailover: "Cuota agotada en {modelName}. Conmutando al modelo de respaldo {nextModelName}...",
    statusFatalError: "Error fatal: Todos los modelos de la lista fallaron."
  };

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModelName = modelsToTry[i];

    const systemInstructionObject = typeof modelConfig.systemInstruction === "string"
      ? { parts: [{ text: modelConfig.systemInstruction }] }
      : modelConfig.systemInstruction;

    const retries = 3;
    let delay = 1000;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`[BaP AI]: Consultando modelo ${currentModelName}... (Intento ${attempt + 1}/${retries})`);
        const queryingMsg = i18n.statusQueryingModel
          .replaceAll("{modelName}", currentModelName)
          .replaceAll("{attempt}", attempt + 1)
          .replaceAll("{retries}", retries);
        onStatusUpdate?.(queryingMsg, "model");

        const model = genAI.getGenerativeModel({
          model: currentModelName,
          systemInstruction: systemInstructionObject,
          generationConfig: {
            temperature: modelConfig.temperature ?? CONSTANT.AI.TEMPERATURE,
          }
        });

        const result = await model.generateContent(prompt);
        const successMsg = i18n.statusResponseSuccess.replaceAll("{modelName}", currentModelName);
        onStatusUpdate?.(successMsg, "success");
        return result;
      } catch (err) {
        lastError = err;
        const errMsg = err.message || "";

        const isQuotaError =
          errMsg.includes("429") ||
          errMsg.includes("ResourceExhausted") ||
          errMsg.includes("quota");

        const isRetryable =
          !isQuotaError && (
            errMsg.includes("503") ||
            errMsg.includes("Service Unavailable") ||
            errMsg.includes("high demand")
          );

        if (isRetryable && attempt < retries - 1) {
          console.warn(`[BaP AI Warning]: Modelo ${currentModelName} retornó error reintentable (${errMsg}). Reintentando en ${delay}ms...`);
          const retryingMsg = i18n.statusRetrying
            .replaceAll("{modelName}", currentModelName)
            .replaceAll("{delay}", delay);
          onStatusUpdate?.(retryingMsg, "warning");
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        if (i < modelsToTry.length - 1) {
          const nextModelName = modelsToTry[i + 1];
          console.warn(`[BaP AI Failover]: Modelo ${currentModelName} falló (${isQuotaError ? "límite de cuota" : errMsg}). Conmutando al modelo de respaldo: ${nextModelName}...`);
          const failoverMsg = i18n.statusFailover
            .replaceAll("{modelName}", currentModelName)
            .replaceAll("{nextModelName}", nextModelName);
          onStatusUpdate?.(failoverMsg, "failover");
        } else {
          console.error(`[BaP AI Error]: El modelo ${currentModelName} falló. No quedan más modelos de respaldo en la lista.`);
          onStatusUpdate?.(i18n.statusFatalError, "error");
        }
        break;
      }
    }
  }

  throw lastError;
}

/**
 * Función genérica para enviar peticiones a la API de Google Gemini en BaP Framework.
 *
 * @param {string} promptText - Texto de la consulta del usuario.
 * @param {object} [options] - Opciones de generación (fileData, mimeType, history, customModels, customSystemInstruction, temperature, onStatusUpdate)
 * @returns {Promise<string>} Texto devuelto por el modelo de IA.
 */
export async function generateContent(promptText, options = {}) {
  const {
    base64FileData = null,
    mimeType = null,
    history = [],
    customModels = null,
    customSystemInstruction = null,
    temperature = null,
    onStatusUpdate = null,
  } = options;

  try {
    const apiKey = CONSTANT.AI.API_KEY;
    if (!apiKey || apiKey.startsWith("%")) {
      throw new Error("[BaP AI Error]: No se ha configurado la API Key de Google Gemini en el entorno (AI_API_KEY).");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const contents = [];

    if (history && Array.isArray(history) && history.length > 0) {
      history.forEach(item => {
        contents.push({
          role: item.role === "assistant" || item.role === "model" ? "model" : "user",
          parts: [{ text: item.text }]
        });
      });
    }

    const currentParts = [];
    if (promptText) {
      currentParts.push({ text: promptText });
    }

    if (base64FileData && mimeType) {
      let finalMimeType = mimeType;
      if (finalMimeType === "image/svg+xml") {
        finalMimeType = "image/png";
      }

      const base64Content = base64FileData.includes("base64,")
        ? base64FileData.split(",")[1]
        : base64FileData;

      currentParts.push({
        inlineData: {
          data: base64Content,
          mimeType: finalMimeType,
        },
      });
    }

    if (currentParts.length === 0 && contents.length === 0) {
      throw new Error("Debe proporcionar al menos un texto, archivo adjunto o historial de chat.");
    }

    if (currentParts.length > 0) {
      contents.push({
        role: "user",
        parts: currentParts
      });
    }

    const modelsList = customModels || CONSTANT.AI.MODELS;
    const systemInstructionText = customSystemInstruction || CONSTANT.AI.SYSTEM_INSTRUCTION;

    const result = await generateContentWithRetryAndFallback(
      genAI,
      {
        systemInstruction: { parts: [{ text: systemInstructionText }] },
        temperature: temperature ?? CONSTANT.AI.TEMPERATURE,
      },
      { contents },
      modelsList,
      onStatusUpdate
    );

    return result.response.text();
  } catch (err) {
    console.error("Error al generar contenido con la API de Google Gemini en BaP:", err);
    throw err;
  }
}
