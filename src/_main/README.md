# Guía de Integración del Core Engine

Esta guía paso a paso describe cómo inicializar, configurar y utilizar los módulos del núcleo (`src/_main/`) de BaP Framework en tu aplicación web.

> [!WARNING]
> **Advertencia sobre Modificaciones del Core Engine:**
> Si bien BaP Framework permite modificar cualquier archivo en `src/_main/`, ten en cuenta que al actualizar a una nueva versión del framework en el futuro, **cualquier cambio manual en los archivos del núcleo se sobrescribirá y perderá**. Se sugiere contactar al referente/mantenedor del framework para proponer mejoras antes de alterar el motor localmente.

---

## 📋 Pre requisitos de Entorno

Antes de comenzar a utilizar los módulos del núcleo, asegúrate de contar con la siguiente configuración inicial:

1. **Configuración Maestra**: Archivo [`bap.config.json`](../../bap.config.json) en la raíz del proyecto.
2. **Variables de Entorno**: Archivos `.env` configurados para la compilación automatizada con Gulp.
3. **Servicios de Firebase**: Proyecto de Firebase habilitado en la consola de Google (si se utiliza almacenamiento o autenticación).

---

## 1. Inicializar la Aplicación y Servicios Globales (`constants.js` & `firebaseInit.js`)

Los módulos `constants.js` y `firebaseInit.js` constituyen el punto de entrada lógico. Resuelven dinámicamente las URLs base según el origen del navegador y proveen un gateway único e inmutable para los SDKs de Google Firebase (evitando múltiples instanciaciones).

```javascript
// src/index.js (Punto de entrada de la aplicación)
import { CONSTANT, ENV_URL } from "./_main/constants.js";
import { bapApp, bapAuth, bapDB, bapAnalytics } from "./_main/firebaseInit.js";

console.log(`BaP Framework ${CONSTANT.APP_VERSION} inicializado en ${ENV_URL}`);
```

- `constants.js`: Exporta `CONSTANT`, `ENV_URL`, `CDN_URL` e `IS_PROD`.
- `firebaseInit.js`: Exporta `bapApp`, `bapAuth`, `bapDB`, `bapAnalytics` y `logAnalyticEvent()`.

---

## 2. Configurar Autenticación con Google Identity y Whitelist (`auth.js`)

El módulo `auth.js` administra el flujo de inicio/cierre de sesión mediante una ventana emergente de Google Identity (OAuth 2.0 popup), administra Access Tokens y verifica los permisos del usuario contra la lista blanca (`/allowed_users/`) en Firebase Realtime Database.

```javascript
import { logIn, logOut, isUserAuthorized, ensureGoogleAccessToken } from "./_main/auth.js";

// Iniciar sesión con Google Identity
logIn(
  async (user) => {
    // Verificar autorización lógica por Whitelist
    const isAuthorized = await isUserAuthorized(user.uid);
    if (isAuthorized) {
      console.log("Usuario autorizado:", user.email);
    }
  },
  (error) => console.error("Error al iniciar sesión:", error)
);

// Garantizar un Access Token de Google válido (para consumir Google Drive API)
const token = await ensureGoogleAccessToken();
```

> [!IMPORTANT]
> **Seguridad**: La comprobación de whitelist en cliente es una capa de experiencia de usuario (UX). Es obligatorio proteger la rama `/allowed_users/` en las **Security Rules** de Realtime Database en el servidor.

---

## 3. Configurar Enrutamiento SPA y Rutas Protegidas (`routerPaths.js` & `router.js`)

Los módulos `routerPaths.js` y `router.js` gestionan la navegación de la Single Page Application (SPA) sin recargar la página. Inyectan vistas usando `document.createElement()` para mitigar ataques XSS reflejados y evalúan permisos antes de cargar rutas privadas (`requireAuth: true`).

```javascript
import { initRouter, navigateTo } from "./_main/router.js";

// Inicializar el enrutador al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  initRouter();
});

// Navegación programática segura
navigateTo("/pages/core/");
```

- Utilizar el atributo `data-link` en elementos `<a>` en lugar de recargas `window.location.href`.

---

## 4. Persistencia Cifrada (AES-GCM 256-bit) y Base de Datos (`storage.js`)

El módulo `storage.js` ofrece persistencia ultrasegura. Cifra información confidencial en `localStorage` o `sessionStorage` mediante **AES-GCM de 256 bits** y derivación **PBKDF2** (100,000 iteraciones y salt) aislados por el `uid` del usuario.

```javascript
import { setToStorageAsync, getFromStorageAsync, CONSTANT } from "./_main/storage.js";

// Cifrar y guardar datos confidenciales en localStorage
await setToStorageAsync({
  storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
  item: "user_preferences",
  value: { theme: "dark", role: "admin" },
  secretKey: user.uid // Aislamiento criptográfico por usuario
});

// Obtener y descifrar datos
const preferences = await getFromStorageAsync({
  storageType: CONSTANT.STORAGE.SOURCE.LOCAL,
  item: "user_preferences",
  secretKey: user.uid
});
```

---

## 5. Internacionalización (i18n) y Sanitización Anti-XSS (`i18n.js`)

El módulo `i18n.js` traduce la interfaz en tiempo de ejecución recorriendo los nodos del DOM con un `TreeWalker` nativo sin romper event listeners. Incluye la función `sanitizeHTML()` impulsada por **DOMPurify** para neutralizar ataques XSS.

```javascript
import { applyI18n, sanitizeHTML } from "./_main/i18n.js";

// Traducir dinámicamente la UI
applyI18n(() => {
  console.log("Traducción completada.");
});

// Sanitizar código HTML no confiable
const cleanHTML = sanitizeHTML("<img src=x onerror=alert(1)><strong>Contenido seguro</strong>");
```

---

## 6. Telemetría, Google Drive, Markdown y Utilidades (`analytics.js`, `util.js`, `googleDrive.js`, `markdown.js`)

Módulos transversales que complementan la funcionalidad del framework:

```javascript
import { generateUUID, bapNotify } from "./_main/util.js";
import { parseMarkdown } from "./_main/markdown.js";
import { uploadFile } from "./_main/googleDrive.js";
import { analytic } from "./_main/analytics.js";

// 1. Identificadores no predecibles (Web Crypto API)
const id = generateUUID();

// 2. Disparar notificaciones Toast
bapNotify("ALERT", "SUCCESS", "Éxito", "Operación completada.");

// 3. Renderizar Markdown a HTML sanitizado
const html = parseMarkdown("# Título\n- Elemento de lista");

// 4. Telemetría unificada
analytic.logEvent.enterLandingPage?.();
```

---

## 📖 Referencia Rápida de la API del Core

| Módulo | Propósito | Funciones Exportadas | Integraciones Clave |
| :--- | :--- | :--- | :--- |
| **`constants.js`** | Configuración global y URLs dinámicas | `CONSTANT`, `ENV_URL`, `CDN_URL`, `IS_PROD` | Gulp, Web Components, Vistas. |
| **`firebaseInit.js`** | Gateway único de servicios Firebase | `bapApp`, `bapAuth`, `bapDB`, `bapAnalytics`, `logAnalyticEvent` | `auth.js`, `storage.js`, `analytics.js`. |
| **`auth.js`** | Autenticación Google Identity y Whitelist | `logIn`, `logOut`, `isUserAuthorized`, `ensureGoogleAccessToken` | `router.js`, `googleDrive.js`. |
| **`routerPaths.js`** | Catálogo estricto de rutas web | `routerPaths`, `getRouteInfo` | `router.js`, `bap-header`. |
| **`router.js`** | Enrutador SPA sin recarga anti-XSS | `initRouter`, `navigateTo`, `getCurrentRoute`, `getQueryParams` | `auth.js`, `analytics.js`, elementos `<a>`. |
| **`storage.js`** | Cifrado AES-GCM 256-bit y Firebase RTDB | `secureEncryptData`, `secureDecryptData`, `getFromStorageAsync`, `setToStorageAsync` | `auth.js`, Firebase RTDB, Vistas. |
| **`i18n.js`** | Internacionalización y sanitización DOMPurify | `applyI18n`, `getI18nContent`, `sanitizeHTML`, `replaceTokensInDOM` | Web Components, `markdown.js`. |
| **`analytics.js`** | Taxonomía unificada de telemetría | `analytic.logEvent.*` | `router.js`, Componentes UI. |
| **`util.js`** | UUIDs criptográficos y notificaciones Toast | `generateUUID`, `bapNotify`, `isMobile`, `loadScript` | `customComponentsRegistration.js`, `storage.js`. |
| **`googleDrive.js`** | Cliente REST v3 de Google Drive | `searchFolder`, `createFolder`, `uploadFile`, `getFile` | `auth.js` (tokens OAuth 2.0). |
| **`markdown.js`** | Parser local de Markdown a HTML | `parseMarkdown`, `renderMarkdownToContainer` | `bap-dialog`, Simulador de migración. |

---

## 🛡️ Seguridad: Reglas recomendadas para Realtime Database

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "allowed_users": {
      "$userKey": {
        ".read": "auth != null",
        ".write": false
      }
    }
  }
}
```
