/**
 * Information storage control
 * - LocalStorage
 * - SessionStorage
 */
import { CONSTANT } from "./constants.js";
import { ref, onValue, set, update, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { bapNotify } from "./util.js";
import { bapDB } from "./firebaseInit.js";
import { getI18nContent } from "./i18n.js";

const storageI18n = getI18nContent("page", "cross");

/**
 * DB routes
 */
let rawDbRoutes = {};
try {
  rawDbRoutes = JSON.parse('%%BAP_DB_ROUTES%%');
} catch (e) {
  // Ignorado durante el build
}

export const dbRoutes = Object.keys(rawDbRoutes).reduce((acc, key) => {
  acc[key] = () => rawDbRoutes[key];
  return acc;
}, {});

/**
 * @deprecated [OBSOLETO] Este método realiza únicamente ofuscación visual mediante Base64.
 * NO es seguro para cifrar información sensible. Utiliza las versiones asíncronas
 * `secureEncryptData` o `setToStorageAsync` / `updateStorageAsync` para cifrado AES-GCM seguro.
 *
 * @param {string} data Datos en texto plano a ofuscar
 * @param {string} secretKey Clave de ofuscación (concatenada al final del payload)
 * @returns {string} Datos ofuscados en Base64
 */
const encryptData = (data, secretKey) => {
  console.warn(
    "⚠️ [DEPRECATED] `encryptData` realiza ofuscación visual de Base64, no cifrado criptográfico seguro. " +
    "No lo utilices para datos sensibles. Considera migrar a `secureEncryptData`."
  );
  try {
    // Conversión segura de Unicode a Base64 sin romper UTF-8
    const unicodeObfuscated = btoa(unescape(encodeURIComponent(data)));
    return unicodeObfuscated + "/@/" + secretKey;
  } catch (e) {
    console.error("Error al ofuscar datos síncronamente:", e);
    return btoa(data) + "/@/" + secretKey;
  }
};

/**
 * @deprecated [OBSOLETO] Desofusca datos procesados con encryptData.
 *
 * @param {string} encryptedData String Base64 ofuscado
 * @returns {string} Texto plano desofuscado
 */
const decryptData = (encryptedData) => {
  console.warn(
    "⚠️ [DEPRECATED] `decryptData` desofusca datos codificados en Base64. " +
    "No lo utilices para datos sensibles. Considera migrar a `secureDecryptData`."
  );
  try {
    const rawBase64 = encryptedData.split("/@/")[0];
    return decodeURIComponent(escape(atob(rawBase64)));
  } catch (e) {
    console.error("Error al desofuscar datos síncronamente:", e);
    return atob(encryptedData.split("/@/")[0]);
  }
};

// --- SOPORTE CRIPTOGRÁFICO AVANZADO (WEB CRYPTO API) ---

// Auxiliar para convertir Uint8Array a Base64 de forma segura sin límites de pila de argumentos
const uint8ToBase64 = (arr) => {
  let bin = "";
  const len = arr.byteLength;
  for (let i = 0; i < len; i++) {
    bin += String.fromCharCode(arr[i]);
  }
  return btoa(bin);
};

// Auxiliar para convertir Base64 a Uint8Array
const base64ToUint8 = (str) => {
  const bin = atob(str);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
};

/**
 * Deriva una clave AES-GCM a partir de un password y un salt utilizando PBKDF2.
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Cifra datos de forma segura usando AES-GCM de 256 bits y PBKDF2.
 * 
 * @param {string} data Datos en texto plano a cifrar (por ejemplo, un JSON stringificado)
 * @param {string} password Contraseña o clave secreta (por ejemplo, el UID del usuario)
 * @returns {Promise<string>} Payload cifrado codificado en Base64 (Salt + IV + Ciphertext)
 */
export async function secureEncryptData(data, password) {
  if (!password) {
    throw new Error("Se requiere una contraseña para el cifrado criptográfico.");
  }
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey(password, salt);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encodedData
    );

    // Empaquetar Salt (16B) + IV (12B) + Ciphertext en un único Array Buffer
    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

    return uint8ToBase64(combined);
  } catch (error) {
    console.error("Error al cifrar criptográficamente con AES-GCM:", error);
    throw error;
  }
}

/**
 * Descifra datos cifrados con secureEncryptData usando AES-GCM y PBKDF2.
 * 
 * @param {string} encryptedData Payload cifrado en Base64 (Salt + IV + Ciphertext)
 * @param {string} password Contraseña o clave secreta (por ejemplo, el UID del usuario)
 * @returns {Promise<string>} Datos descifrados en texto plano
 */
export async function secureDecryptData(encryptedData, password) {
  if (!password) {
    throw new Error("Se requiere una contraseña para el descifrado criptográfico.");
  }
  try {
    const combined = base64ToUint8(encryptedData);
    if (combined.length < 28) {
      throw new Error("Payload de cifrado corrupto o demasiado corto.");
    }

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Error al descifrar criptográficamente con AES-GCM (¿Contraseña incorrecta?):", error);
    throw new Error("Error de descifrado. Datos corruptos o contraseña incorrecta.");
  }
}

/**
 * Obtiene información del almacenamiento de manera asíncrona.
 * Permite descifrado seguro con AES-GCM si se provee secretKey.
 *
 * @param {Object} params Parámetros de consulta
 * @param {string} params.storageType CONSTANT.STORAGE.SOURCE.*
 * @param {string} params.item Identificador de clave de almacenamiento
 * @param {string} [params.secretKey] Clave criptográfica para descifrar (e.g. currentUser.uid)
 * @returns {Promise<any>} Datos descifrados y parseados, o null
 */
export const getFromStorageAsync = async ({ storageType, item, secretKey }) => {
  let value;
  switch (storageType) {
    case CONSTANT.STORAGE.SOURCE.LOCAL:
      value = localStorage.getItem(item);
      if (value && secretKey) {
        value = await secureDecryptData(value, secretKey);
      }
      return value ? JSON.parse(value) : null;

    case CONSTANT.STORAGE.SOURCE.SESSION:
      value = sessionStorage.getItem(item);
      if (value && secretKey) {
        value = await secureDecryptData(value, secretKey);
      }
      return value ? JSON.parse(value) : null;

    case CONSTANT.STORAGE.SOURCE.DB:
      return new Promise((resolve, reject) => {
        const dbConnection = ref(bapDB, item);
        onValue(
          dbConnection,
          (snapshot) => resolve(snapshot.val()),
          (error) => {
            bapNotify(
              CONSTANT.NOTIFICATION.TYPE.ALERT,
              CONSTANT.NOTIFICATION.SEVERITY.ERROR,
              storageI18n.storage.errorGetting,
              error
            );
            reject(error);
          }
        );
      });
  }
};

/**
 * Guarda información en el almacenamiento de manera asíncrona.
 * Permite cifrado seguro con AES-GCM si se provee secretKey.
 *
 * @param {Object} params Parámetros de escritura
 * @param {string} params.storageType CONSTANT.STORAGE.SOURCE.*
 * @param {string} params.item Identificador de clave de almacenamiento
 * @param {any} params.value Datos a almacenar (se convertirá en JSON)
 * @param {string} [params.secretKey] Clave criptográfica para cifrar (e.g. currentUser.uid)
 * @returns {Promise<void>}
 */
export const setToStorageAsync = async ({ storageType, item, value, secretKey }) => {
  switch (storageType) {
    case CONSTANT.STORAGE.SOURCE.LOCAL:
      const localData = JSON.stringify(value);
      localStorage.setItem(
        item,
        secretKey ? await secureEncryptData(localData, secretKey) : localData
      );
      break;

    case CONSTANT.STORAGE.SOURCE.SESSION:
      const sessionData = JSON.stringify(value);
      sessionStorage.setItem(
        item,
        secretKey ? await secureEncryptData(sessionData, secretKey) : sessionData
      );
      break;

    case CONSTANT.STORAGE.SOURCE.DB:
      return set(ref(bapDB, item), value)
        .catch((error) => {
          bapNotify(
            CONSTANT.NOTIFICATION.TYPE.ALERT,
            CONSTANT.NOTIFICATION.SEVERITY.ERROR,
            storageI18n.storage.errorSaving,
            error
          );
          throw error;
        });
  }
};

/**
 * Actualiza información en el almacenamiento de manera asíncrona.
 * Permite cifrado seguro con AES-GCM si se provee secretKey.
 *
 * @param {Object} params Parámetros de actualización
 * @param {string} params.storageType CONSTANT.STORAGE.SOURCE.*
 * @param {string} params.item Identificador de clave de almacenamiento
 * @param {any} params.value Datos a actualizar
 * @param {string} [params.secretKey] Clave criptográfica para cifrar (e.g. currentUser.uid)
 * @returns {Promise<void>}
 */
export const updateStorageAsync = async ({ storageType, item, value, secretKey }) => {
  switch (storageType) {
    case CONSTANT.STORAGE.SOURCE.LOCAL:
      const localData = JSON.stringify(value);
      localStorage.setItem(
        item,
        secretKey ? await secureEncryptData(localData, secretKey) : localData
      );
      break;

    case CONSTANT.STORAGE.SOURCE.SESSION:
      const sessionData = JSON.stringify(value);
      sessionStorage.setItem(
        item,
        secretKey ? await secureEncryptData(sessionData, secretKey) : sessionData
      );
      break;

    case CONSTANT.STORAGE.SOURCE.DB:
      return update(ref(bapDB, item), value)
        .catch((error) => {
          bapNotify(
            CONSTANT.NOTIFICATION.TYPE.ALERT,
            CONSTANT.NOTIFICATION.SEVERITY.ERROR,
            storageI18n.storage.errorUpdating,
            error
          );
          throw error;
        });
  }
};

/**
 * Get from storage
 *
 * @param storageType: <string> CONSTANT.STORAGE.SOURCE.*
 * @param item: <string> CONSTANT.STORAGE.KEYS | dbRoutes
 * @param callbackOnSuccess: <callback> function to execute on success. (Just for STORAGE.SOURCE.DB)
 * @param callBackOnFail: <callback> function to execute on fail. (Just for STORAGE.SOURCE.DB)
 * @param secretKey: <string> If it is set, data will be decrypted. (Just for STORAGE.SOURCE.LOCAL and STORAGE.SOURCE.SESSION)
 *
 * @returns *
 */
export const getFromStorage = ({ storageType, item, callbackOnSuccess, callBackOnFail, secretKey }) => {
  let value;
  switch (storageType) {
    case CONSTANT.STORAGE.SOURCE.LOCAL:
      value = localStorage.getItem(item);
      if (secretKey) {
        console.warn(
          "⚠️ [getFromStorage] `secretKey` aplica decodificación Base64 (formato visual). " +
          "NO es descifrado criptográfico seguro. Para cifrado AES-GCM usa `getFromStorageAsync` con secretKey."
        );
        value = decryptData(value, secretKey);
      }
      return value ? JSON.parse(value) : null;
      break;
    case CONSTANT.STORAGE.SOURCE.SESSION:
      value = sessionStorage.getItem(item);
      if (secretKey) {
        console.warn(
          "⚠️ [getFromStorage] `secretKey` aplica decodificación Base64 (formato visual). " +
          "NO es descifrado criptográfico seguro. Para cifrado AES-GCM usa `getFromStorageAsync` con secretKey."
        );
        value = decryptData(value, secretKey);
      }
      return value ? JSON.parse(value) : null;
      break;
    case CONSTANT.STORAGE.SOURCE.DB:
      const dbConnection = ref(bapDB, item);
      onValue(
        dbConnection,
        (snapshot) => (callbackOnSuccess ? callbackOnSuccess(snapshot.val()) : null),
        (error) => {
          callBackOnFail
            ? callBackOnFail()
            : bapNotify(
              CONSTANT.NOTIFICATION.TYPE.ALERT,
              CONSTANT.NOTIFICATION.SEVERITY.ERROR,
              storageI18n.storage.errorGetting,
              error
            );
        }
      );
      break;
  }
};

/**
 * Set to storage
 *
 * @param storageType: <string> CONSTANT.STORAGE.SOURCE.*
 * @param item: <string> CONSTANT.STORAGE.KEYS | dbRoutes
 * @param value: <string|object>
 * @param callbackOnSuccess: <callback> function to execute on success. (Just for STORAGE.SOURCE.DB)
 * @param callBackOnFail: <callback> function to execute on fail.(Just for STORAGE.SOURCE.DB)
 * @param secretKey: <string> If it is set, data will be decrypted.(Just for STORAGE.SOURCE.LOCAL and STORAGE.SOURCE.SESSION)
 *
 * @returns void
 */
export const setToStorage = ({ storageType, item, value, callbackOnSuccess, callBackOnFail, secretKey }) => {
  switch (storageType) {
    case CONSTANT.STORAGE.SOURCE.LOCAL:
      const localData = JSON.stringify(value);
      if (secretKey) {
        console.warn(
          "⚠️ [setToStorage] `secretKey` aplica codificación Base64 (formato visual). " +
          "NO es cifrado criptográfico seguro. Para cifrado AES-GCM usa `setToStorageAsync` con secretKey."
        );
      }
      localStorage.setItem(item, secretKey ? encryptData(localData, secretKey) : localData);
      break;
    case CONSTANT.STORAGE.SOURCE.SESSION:
      const sessionData = JSON.stringify(value);
      if (secretKey) {
        console.warn(
          "⚠️ [setToStorage] `secretKey` aplica codificación Base64 (formato visual). " +
          "NO es cifrado criptográfico seguro. Para cifrado AES-GCM usa `setToStorageAsync` con secretKey."
        );
      }
      sessionStorage.setItem(item, secretKey ? encryptData(sessionData, secretKey) : sessionData);
      break;
    case CONSTANT.STORAGE.SOURCE.DB:
      set(ref(bapDB, item), value)
        .then(() => {
          callbackOnSuccess
            ? setTimeout(() => callbackOnSuccess(), CONSTANT.NOTIFICATION.AUTO_REMOVE_AFTER.INFO + 2000)
            : null;
        })
        .catch((error) => {
          callBackOnFail
            ? callBackOnFail()
            : bapNotify(
              CONSTANT.NOTIFICATION.TYPE.ALERT,
              CONSTANT.NOTIFICATION.SEVERITY.ERROR,
              storageI18n.storage.errorSaving,
              error
            );
        });
      break;
  }
};

/**
 * Update to storage
 *
 * @param storageType: <string> CONSTANT.STORAGE.SOURCE.*
 * @param item: <string> CONSTANT.STORAGE.KEYS | dbRoutes
 * @param value: <string|object>
 * @param callbackOnSuccess: <callback> function to execute on success. (Just for STORAGE.SOURCE.DB)
 * @param callBackOnFail: <callback> function to execute on fail.(Just for STORAGE.SOURCE.DB)
 * @param secretKey: <string> If it is set, data will be decrypted. (Just for STORAGE.SOURCE.LOCAL and STORAGE.SOURCE.SESSION)
 *
 * @returns void
 */
export const updateStorage = ({ storageType, item, value, callbackOnSuccess, callBackOnFail, secretKey }) => {
  switch (storageType) {
    case CONSTANT.STORAGE.SOURCE.LOCAL:
      const localData = JSON.stringify(value);
      if (secretKey) {
        console.warn(
          "⚠️ [updateStorage] `secretKey` aplica codificación Base64 (formato visual). " +
          "NO es cifrado criptográfico seguro. Para cifrado AES-GCM usa `updateStorageAsync` con secretKey."
        );
      }
      localStorage.setItem(item, secretKey ? encryptData(localData, secretKey) : localData);
      break;
    case CONSTANT.STORAGE.SOURCE.SESSION:
      const sessionData = JSON.stringify(value);
      if (secretKey) {
        console.warn(
          "⚠️ [updateStorage] `secretKey` aplica codificación Base64 (formato visual). " +
          "NO es cifrado criptográfico seguro. Para cifrado AES-GCM usa `updateStorageAsync` con secretKey."
        );
      }
      sessionStorage.setItem(item, secretKey ? encryptData(sessionData, secretKey) : sessionData);
      break;
    case CONSTANT.STORAGE.SOURCE.DB:
      update(ref(bapDB, item), value)
        .then(() => {
          if (callbackOnSuccess) {
            callbackOnSuccess
              ? setTimeout(() => callbackOnSuccess(), CONSTANT.NOTIFICATION.AUTO_REMOVE_AFTER.INFO + 2000)
              : null;
          }
        })
        .catch((error) => {
          callBackOnFail
            ? callBackOnFail()
            : bapNotify(
              CONSTANT.NOTIFICATION.TYPE.ALERT,
              CONSTANT.NOTIFICATION.SEVERITY.ERROR,
              storageI18n.storage.errorUpdating,
              error
            );
        });
      break;
  }
};

/**
 * Remove from storage
 *
 * @param storageType: <string> CONSTANT.STORAGE.SOURCE.*
 * @param item: <string> CONSTANT.STORAGE.KEYS | dbRoutes
 * @param callbackOnSuccess: <callback> function to execute on success. (Just for STORAGE.SOURCE.DB)
 * @param callBackOnFail: <callback> function to execute on fail. (Just for STORAGE.SOURCE.DB)
 *
 * @returns void
 */
export const removeFromStorage = ({ storageType, item, callbackOnSuccess, callBackOnFail }) => {
  switch (storageType) {
    case CONSTANT.STORAGE.SOURCE.LOCAL:
      return localStorage.removeItem(item);
      break;
    case CONSTANT.STORAGE.SOURCE.SESSION:
      return sessionStorage.removeItem(item);
      break;
    case CONSTANT.STORAGE.SOURCE.DB:
      remove(ref(bapDB, item))
        .then(() => {
          if (callbackOnSuccess) {
            callbackOnSuccess
              ? setTimeout(() => callbackOnSuccess(), CONSTANT.NOTIFICATION.AUTO_REMOVE_AFTER.INFO + 2000)
              : null;
          }
        })
        .catch((error) => {
          callBackOnFail
            ? callBackOnFail()
            : bapNotify(
              CONSTANT.NOTIFICATION.TYPE.ALERT,
              CONSTANT.NOTIFICATION.SEVERITY.ERROR,
              storageI18n.storage.errorRemoving,
              error
            );
        });
      break;
  }
};
