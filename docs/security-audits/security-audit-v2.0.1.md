# 🔒 Informe de Seguridad — BaP Framework v2.0.1

> **Analista:** Experto en Ciberseguridad con especialización en plataformas Firebase
> **Fecha:** Mayo 2026
> **Alcance:** Análisis estático de código fuente completo (white-box)
> **Repositorio:** `GonzaloArenasF/BaP_Framework`

---

## Resumen Ejecutivo

BaP Framework es un sistema de desarrollo web ligero basado en Vanilla JS, HTML5 y CSS3 con integración exclusiva de Firebase. Tras un análisis exhaustivo de todos los archivos fuente, se identificaron **14 vulnerabilidades** distribuidas en los siguientes niveles de riesgo:

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| 🔴 Crítica | 3 | Requiere acción inmediata |
| 🟠 Alta | 4 | Corrección prioritaria |
| 🟡 Media | 4 | Planificación a corto plazo |
| 🔵 Baja | 3 | Deuda técnica a gestionar |

**Fortalezas detectadas:** El framework implementa correctamente el patrón de lista blanca (whitelist) en Firebase RTDB para control de acceso de segundo factor, usa Firebase App Check con reCAPTCHA Enterprise, y aplica el aislamiento de Shadow DOM en el componente `bap-notification`. Estas son decisiones de diseño positivas.

---

## Arquitectura Analizada

```
BaP Framework
├── src/                         ← Código fuente (no desplegado directamente)
│   ├── _main/                   ← Núcleo del sistema
│   │   ├── constants.js         ← ⚠️ Credenciales hardcodeadas
│   │   ├── firebaseInit.js      ← Inicialización de servicios Firebase
│   │   ├── auth.js              ← Control de sesión y whitelist
│   │   ├── router.js            ← Motor de enrutamiento con bypass
│   │   ├── storage.js           ← Persistencia (local, sesión, RTDB)
│   │   ├── i18n.js              ← ⚠️ Mutación de innerHTML masiva
│   │   └── util.js              ← Utilidades generales
│   └── _components/             ← Web Components personalizados
│       ├── bap-dialog/          ← ⚠️ XSS via innerHTML + Base64
│       ├── bap-header/          ← ⚠️ Carga de script externo dinámico
│       └── bap-notification/    ← ✅ Shadow DOM correctamente aislado
├── public/                      ← Bundle compilado (desplegable)
├── gulpfile.js                  ← Pipeline de build
└── firebase.json                ← ⚠️ Sin cabeceras de seguridad HTTP
```

---

## Hallazgos de Vulnerabilidades

---

### 🔴 CRÍTICA — VUL-01: Credenciales de Firebase expuestas en control de versiones (hardcoded secrets)

**Archivo:** `src/_main/constants.js` — Líneas 42–51

**Descripción:**
Las credenciales completas del proyecto Firebase están hardcodeadas directamente en el código fuente JavaScript que se sube al repositorio público de GitHub y se despliega como código de cliente.

```javascript
FBC: {
    AP: "AIzaSyBfv-umLC6LYto61IInbzxWpOfoVlBxFL0",  // API Key expuesta
    AD: "bap-framework.firebaseapp.com",
    PID: "bap-framework",
    SB: "bap-framework.firebasestorage.app",
    MSID: "558852148292",
    AID: "1:558852148292:web:89f2d09c37deae7c0a0011",
    MID: "G-GK0WRKXPH2"
}
```

**Impacto:**
- Un actor malicioso puede extraer la `apiKey` desde el código fuente (incluso del bundle obfuscado con herramientas de reversión básica) para realizar ataques directos a la API de Firebase.
- Permite enumerar rutas de la Realtime Database, intentar escrituras no autorizadas si las reglas de seguridad son permisivas, y abusar de quotas de servicio generando costos inesperados (billing abuse).
- El `messagingSenderId` y `appId` expuestos permiten a terceros registrar aplicaciones en el mismo proyecto Firebase.

**Contexto importante:** En Firebase, la `apiKey` del cliente no es un secreto en el mismo sentido que una clave de API backend, ya que el acceso a los datos está controlado por las Reglas de Seguridad de Firebase. **Sin embargo**, la exposición de todas las credenciales en un repositorio público combinada con la ausencia de reglas de seguridad documentadas representa un riesgo real de abuso.

**Recomendación:**
1. **Inmediato:** Rotar la API Key en la consola de Google Cloud si se sospecha abuso.
2. Implementar **Firebase App Check** con reCAPTCHA Enterprise de forma completa (el campo `RECAPTCHA.ID` está vacío en el código actual).
3. Usar un sistema de inyección de variables de entorno durante el build de Gulp en lugar de hardcodear los valores. En `gulp-imports.js` crear una función que lea desde un archivo `.env` local (ya incluido en `.gitignore`) y los inyecte en el HTML/JS como reemplazos de tokens durante la fase `optimize`.
4. Auditar y endurecer las Reglas de Seguridad de Firebase Realtime Database para que ningún dato sea accesible sin autenticación válida.

---

### 🔴 CRÍTICA — VUL-02: Inyección XSS potencial en sistema de plantillas i18n (innerHTML masivo)

**Archivos:**
- `src/_main/i18n.js` — Líneas 56–67
- `src/index.js` — Líneas 16–23

**Descripción:**
La función `applyI18n()` reemplaza el contenido completo de `document.head.innerHTML` y `document.body.innerHTML` mediante strings de texto plano. Esta técnica de mutación masiva de innerHTML destruye y reconstruye el DOM entero, lo que puede provocar que event listeners se pierdan, scripts se re-ejecuten y, en el peor caso, permite XSS si algún token `{variable}` en las plantillas HTML llega a contener código no sanitizado.

```javascript
// i18n.js — Lines 56-67
document.head.innerHTML = document.head.innerHTML
    .replaceAll("{ENV_URL}", ENV_URL)        // ← Valor de constants.js, controlado
    .replaceAll("{head-app-name}", CONSTANT.APP_NAME)
    ...

document.body.innerHTML = document.body.innerHTML  // ← RIESGO ALTO
    .replaceAll("{app-name}", CONSTANT.APP_NAME)
    ...
```

**Impacto:**
- Si en el futuro algún valor del diccionario i18n o de `constants.js` es alimentado desde una fuente externa o editable por el usuario, se abre una superficie de ataque XSS directa.
- La re-asignación de `document.body.innerHTML` elimina todos los event listeners previamente registrados, lo que puede causar fallos silenciosos de funcionalidad difíciles de rastrear.
- La función `_applyPageTokens` también usa `document.body.innerHTML = document.body.innerHTML.replaceAll(...)` en un bucle recursivo sobre el objeto i18n, amplificando el riesgo.

**Recomendación:**
1. Migrar a un sistema de templating basado en elementos DOM individuales con `textContent` (no `innerHTML`) para valores escalares, o usar `<template>` tags del W3C.
2. Para los reemplazos de tokens, usar `querySelectorAll("[data-i18n-key]")` y actualizar `textContent` de cada nodo individualmente en lugar de mutar el DOM completo.
3. Si se mantiene el enfoque de string-replace, aplicar una función de sanitización (ej. `DOMPurify`) sobre cualquier valor que no sea una constante local del sistema.

---

### 🔴 CRÍTICA — VUL-03: XSS en componente `bap-dialog` mediante inyección de HTML arbitrario

**Archivos:**
- `src/_components/bap-dialog/bap-dialog.js` — Líneas 43–51
- `src/index.js` — Líneas 65–76

**Descripción:**
El componente `bap-dialog` acepta como contenido de su cuerpo (`bodyContent`) el valor crudo de `this.innerHTML` del elemento host, y posteriormente lo inyecta sin sanitización dentro de la plantilla HTML mediante `result.replace("{dialog-body-content}", props.bodyContent || "")`. Esta plantilla es luego asignada a `template.innerHTML`.

```javascript
// En bap-dialog.js — connectedCallback()
bodyContent: this.innerHTML,  // ← Contenido HTML arbitrario del elemento

// En preRender():
result = result.replace("{dialog-body-content}", props.bodyContent || "");  // ← Sin sanitizar

// En customComponentsRegistration.js:
template.innerHTML = preRender ? preRender(html, props) : html;  // ← Asignado a template.innerHTML
```

Adicionalmente, el componente decodifica URLs desde atributos Base64 (`link-url-base64`) y las inyecta directamente en un tag `<a href="...">` sin validación del esquema de URL. Esto permite inyectar URLs con protocolos peligrosos como `javascript:`.

**Impacto:**
- Un atacante que pueda controlar el contenido innerHTML del elemento `<bap-dialog>` (a través de query params, datos de RTDB no sanitizados, o contenido dinámico) puede ejecutar scripts arbitrarios.
- La decodificación Base64 de URLs sin validación de esquema (`javascript:void(0)` codificado en Base64) permite XSS de tipo URL injection.

**Recomendación:**
1. **Inmediato:** Antes de asignar a `template.innerHTML`, sanitizar `props.bodyContent` con una librería como `DOMPurify` o implementar una función de sanitización que rechace tags de script y atributos de eventos.
2. Para las URLs decodificadas desde Base64, validar que el protocolo sea exclusivamente `https:` antes de construir el tag `<a>`:
```javascript
const decodedUrl = atob(props.linkUrlBase64);
const url = new URL(decodedUrl);
if (!["https:"].includes(url.protocol)) throw new Error("Protocolo no permitido");
```
3. Considerar usar el elemento nativo `<dialog>` del HTML5 (con soporte universal en 2024+) que tiene manejo de focus trap y accesibilidad incorporados.

---

### 🟠 ALTA — VUL-04: Bypass de seguridad explícito sin control de entorno de despliegue

**Archivos:**
- `src/_main/constants.js` — Línea 10
- `src/_main/auth.js` — Líneas 48–51, 83–87
- `src/_main/router.js` — Líneas 48–55, 195–199

**Descripción:**
El flag `CONSTANT.FIREBASE_AVAILABLE = false` actúa como un "interruptor maestro" de toda la seguridad del sistema. Cuando está en `false`, **todas las verificaciones de autenticación, whitelist y control de rutas son completamente omitidas**, permitiendo acceso irrestricto a cualquier ruta marcada como protegida.

```javascript
// constants.js
CONSTANT.FIREBASE_AVAILABLE: false  // ← Valor por defecto en el repositorio

// auth.js — isUserAuthorized()
if (!CONSTANT.FIREBASE_AVAILABLE) {
    return true;  // ← Bypass total de autorización
}

// router.js — isAccessAllowed()
} else {
    console.warn("Bypass de seguridad de ruta activo para:", route.pathname);
    return true;  // ← Bypass total de enrutamiento
}
```

**El valor `false` es el valor por defecto en el repositorio.** Si un desarrollador olvida cambiar este flag antes de hacer un deploy, toda la aplicación queda sin protección alguna.

**Impacto:**
- Un despliegue accidental con `FIREBASE_AVAILABLE: false` en producción expone todas las rutas protegidas a cualquier usuario anónimo.
- El patrón es conceptualmente correcto para desarrollo local, pero el mecanismo de control es frágil y propenso a error humano.

**Recomendación:**
1. Vincular `FIREBASE_AVAILABLE` automáticamente a `IS_PROD` en lugar de requerir configuración manual:
```javascript
// constants.js
export const IS_PROD = window.location.hostname === "bap-framework.gonzaloarenasf.cl";
export const FIREBASE_AVAILABLE = IS_PROD; // Automático, sin intervención manual
```
2. Agregar una validación en el pipeline de Gulp (`gulpfile.js`) que verifique y fuerce `FIREBASE_AVAILABLE = true` antes de hacer deploy a producción, fallando el build si el valor es incorrecto.
3. Documentar este flag con un `// @deploy-check` comment que pueda ser detectado por un pre-commit hook.

---

### 🟠 ALTA — VUL-05: Carga dinámica de script de tercero sin integridad verificada (SRI)

**Archivo:** `src/_components/bap-header/bap-header.js` — Líneas 66–69

**Descripción:**
El componente `bap-header` inyecta dinámicamente un elemento `<script>` que carga el traductor de Google desde un dominio externo sin verificación de integridad (Subresource Integrity - SRI) y sin configuración de Content Security Policy.

```javascript
// bap-header.js — postRender()
const script = document.createElement("script");
script.type = "text/javascript";
script.src = "//translate.google.com/translate_a/element.js";
document.body.appendChild(script);
```

**Problemas adicionales detectados:**
- Usa protocolo relativo `//` en lugar de `https://`, permitiendo degradación a HTTP en contextos inseguros.
- El script se carga en **todas las páginas** que incluyan `<bap-header>`, independientemente de si el usuario necesita traducción.
- La función `googleTranslateElementInit()` exportada en el mismo archivo referencia `google.translate` como global, introduciendo dependencia de un recurso externo no controlado.
- No hay `defer` ni `async` en la carga del script, bloqueando el render.

**Impacto:**
- Si el CDN de Google Translate fuera comprometido o el dominio respondiera contenido malicioso, el script se ejecutaría con acceso completo al DOM de la aplicación (ataque Supply Chain).
- Viola el principio de mínima dependencia del framework.

**Recomendación:**
1. Agregar el atributo `async` al script y cargar siempre con `https://`.
2. Implementar un Content Security Policy (CSP) que incluya `translate.google.com` en la lista blanca explícita de scripts (`script-src`).
3. Considerar eliminar la integración del Google Translator del componente genérico y convertirla en una funcionalidad opt-in que cada proyecto active explícitamente.
4. Si se mantiene, agregar un atributo `crossOrigin="anonymous"` al script.

---

### 🟠 ALTA — VUL-06: Cifrado insuficiente en localStorage/sessionStorage (pseudo-cifrado con Base64)

**Archivo:** `src/_main/storage.js` — Líneas 22–23

**Descripción:**
La función de "cifrado" implementada para el almacenamiento local es una codificación Base64 simple más un separador estático. Esto **no es cifrado**; es ofuscación trivial. Cualquier atacante que acceda a las DevTools del navegador puede decodificar el contenido en segundos.

```javascript
// storage.js
const encryptData = (data, secretKey) => btoa(data) + "/@/" + secretKey;
const decryptData = (encryptedData) => atob(encryptedData.split("/@/")[0]);
```

**Problemas adicionales:**
- La `secretKey` se almacena junto al dato cifrado (separada por `/@/`), lo que hace completamente inútil el concepto de clave privada.
- `btoa()` solo codifica en Base64 y tiene problemas con caracteres Unicode.
- La `secretKey` es pasada por el desarrollador como parámetro, pero si la clave se incluye en el código fuente JavaScript (como es lo usual), es igualmente accesible al atacante.

**Impacto:**
- Cualquier dato "cifrado" en localStorage es recuperable trivialmente por cualquier script que se ejecute en el mismo origen, o por un atacante con acceso físico al dispositivo.
- Si datos sensibles (tokens, datos de sesión, información personal) son almacenados localmente creyendo que están cifrados, se genera una falsa sensación de seguridad.

**Recomendación:**
1. **Inmediato:** Documentar claramente en los comentarios que este mecanismo es **ofuscación, no cifrado**, para evitar uso inadecuado.
2. Para cifrado real en cliente, implementar la **Web Crypto API** nativa del navegador (`window.crypto.subtle`) con AES-GCM, derivando la clave con PBKDF2 desde un secreto del servidor, nunca desde el código fuente.
3. Como alternativa pragmática: no almacenar datos sensibles en localStorage/sessionStorage. Usar tokens de sesión de Firebase Auth (que ya gestiona Firebase de forma segura) y recuperar datos sensibles directamente desde el backend.
4. Considerar usar IndexedDB con cifrado para datos que requieran persistencia local.

---

### 🟠 ALTA — VUL-07: Firebase SDK versionado y desactualizado (pin a versión antigua)

**Archivo:** `src/_main/firebaseInit.js` — Líneas 15–22

**Descripción:**
Todos los módulos de Firebase se importan con una versión fija (`10.4.0`) desde el CDN de Google, sin mecanismo de actualización automática.

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
// ... todas las importaciones apuntan a la versión 10.4.0
```

**Contexto:** La versión 10.4.0 de Firebase JS SDK fue publicada en octubre de 2023. Al momento de este análisis (mayo 2026), existen múltiples versiones mayores más recientes con correcciones de seguridad, incluyendo parches críticos en el manejo de tokens de autenticación.

**Impacto:**
- CVEs reportados contra versiones antiguas del SDK permanecen sin parchar.
- El pin a la versión CDN impide actualizaciones de seguridad automáticas.

**Recomendación:**
1. Actualizar a la última versión estable del Firebase JS SDK (verificar en [firebase.google.com/support/release-notes](https://firebase.google.com/support/release-notes/js)).
2. Si se mantiene el patrón de importación desde CDN (válido para este framework), agregar el hash de integridad (SRI) a cada importación, o migrar a importaciones vía `npm` + bundler en el pipeline de Gulp para gestionar actualizaciones de forma controlada.

---

### 🟡 MEDIA — VUL-08: Ausencia total de Content Security Policy (CSP)

**Archivos afectados:** `firebase.json`, todos los archivos HTML

**Descripción:**
No existe ninguna cabecera de seguridad HTTP configurada en el despliegue de Firebase Hosting. No hay `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, ni `Referrer-Policy`.

```json
// firebase.json — Sin sección "headers"
{
  "hosting": {
    "public": "public",
    "ignore": [...]
    // ← No hay "headers" definidos
  }
}
```

**Impacto:**
- **Sin CSP:** Cualquier XSS exitoso tiene control total del navegador. Scripts inline, eval() y recursos externos no controlados pueden ejecutarse libremente.
- **Sin X-Frame-Options:** La aplicación puede ser embebida en iframes de sitios terceros, habilitando ataques de **Clickjacking**.
- **Sin X-Content-Type-Options:** El navegador puede ejecutar archivos con MIME type incorrecto.
- **Sin HSTS:** Permite ataques de downgrade a HTTP.

**Recomendación:**
Agregar una sección `headers` en `firebase.json`:

```json
{
  "hosting": {
    "public": "public",
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' https://www.gstatic.com https://translate.google.com; connect-src 'self' https://*.firebase.io https://*.firebaseio.com wss://*.firebaseio.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'self'"
          }
        ]
      }
    ]
  }
}
```

---

### 🟡 MEDIA — VUL-09: Parseado manual inseguro de Query Parameters (sin URLSearchParams)

**Archivos:**
- `src/_main/router.js` — Líneas 93–100 y 138–143
- `src/_main/router.js` — Línea 100

**Descripción:**
Los query parameters de la URL son parseados manualmente con splits de strings y luego inyectados directamente como atributos HTML dentro de `<main>`. Esto es una implementación frágil y potencialmente explotable.

```javascript
// router.js — loadContent()
const queryParams = window.location.href.split("?")[1].split("&");
params = [...queryParams.map((param) => `${param.split("=")[0]}=${param.split("=")[1]}`)];
...
// Inyección directa en el DOM:
document.getElementsByTagName("main")[0].innerHTML = `<${route.component} ${params.join(" ")} />`;
```

**Impacto:**
- Si un query param contiene caracteres HTML/JS especiales (ej. `?name="><script>alert(1)</script>`), estos se inyectan directamente en el innerHTML de `<main>`, produciendo **XSS reflejado**.
- El split manual no maneja correctamente valores con múltiples signos `=`, valores codificados en URL, ni caracteres especiales como `+`, `%20`, etc.
- No se aplica `decodeURIComponent` a los valores, lo que puede producir comportamientos inesperados.

**Recomendación:**
1. Reemplazar el parseado manual por la API nativa `URLSearchParams`:
```javascript
// Reemplazar el parseado manual en getQueryParams()
export function getQueryParams() {
    return Object.fromEntries(new URL(window.location.href).searchParams);
}
```
2. Para la inyección de atributos en `loadContent()`, usar `element.setAttribute(key, value)` sobre el elemento creado con `document.createElement()`, nunca concatenar atributos directamente en strings HTML.
3. Sanitizar todos los valores de query params antes de usarlos en el DOM con `encodeURIComponent()` / `textContent`.

---

### 🟡 MEDIA — VUL-10: Configuración del servidor de desarrollo con CORS abierto y sin HTTPS

**Archivo:** `package.json` — Línea 8

**Descripción:**
El servidor de desarrollo se inicia con `http-server ./src -o --cors`, lo que habilita CORS de forma irrestricta (`Access-Control-Allow-Origin: *`) para todos los orígenes en el entorno local.

```json
"server": "http-server ./src -o --cors"
```

Adicionalmente, el servidor corre sobre HTTP plano (no HTTPS), lo que implica que durante el desarrollo:
- Las cookies de sesión no tienen protección `Secure`.
- Las conexiones a Firebase (que requieren HTTPS) pueden tener comportamientos inesperados.
- Los tokens de autenticación viajan en texto plano en la red local.

**Impacto:**
- En entornos de red compartida (oficinas, cafeterías, redes WiFi públicas), un atacante en la misma red puede interceptar tráfico de desarrollo incluyendo tokens de Firebase, datos de sesión y credenciales.
- El CORS abierto en desarrollo puede enmascarar problemas de política CORS que se manifestarán en producción.

**Recomendación:**
1. Agregar `--ssl` al servidor de desarrollo o usar una herramienta como `mkcert` para generar certificados locales de desarrollo.
2. Limitar CORS al origen `http://localhost:8080` explícitamente en lugar de `*`.
3. Documentar que el servidor de desarrollo es solo para entornos locales aislados.

---

### 🟡 MEDIA — VUL-11: UUID generado con `Math.random()` (no criptográficamente seguro)

**Archivo:** `src/_main/util.js` — Líneas 68–74

**Descripción:**
La función `generateUUID()` usa `Math.random()` que no es criptográficamente seguro (CSPRNG). Los UUIDs generados son predecibles si el atacante conoce el estado del generador o puede inferirlo.

```javascript
export function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,  // ← Math.random() NO es seguro
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

**Impacto:**
- Si los UUIDs generados se usan como identificadores de sesión, tokens de reset de contraseña, o identificadores de recursos privados en Firebase RTDB, un atacante puede predecirlos y acceder a recursos ajenos.
- En el contexto actual se usa principalmente para IDs de componentes en el DOM (riesgo bajo), pero el patrón es peligroso si el uso se expande.

**Recomendación:**
Reemplazar con `crypto.randomUUID()` de la Web Crypto API (disponible en todos los navegadores modernos):
```javascript
export function generateUUID() {
  // API nativa criptográficamente segura (Chrome 92+, Firefox 95+, Safari 15.4+)
  return crypto.randomUUID();
}
```

---

### 🔵 BAJA — VUL-12: Source maps expuestos en el bundle de producción

**Archivo:** `gulpfile.js` — Líneas 90–101 y 110–118

**Descripción:**
El pipeline de Gulp genera y escribe source maps junto al bundle de producción con `sourcemaps.write()`. Esto significa que los source maps (que contienen el código fuente original antes de la ofuscación) son desplegados junto a los archivos en `/public` y son accesibles públicamente.

```javascript
// gulpfile.js
.pipe(sourcemaps.init({ largeFile: true }))
.pipe(sourcemaps.identityMap())
.pipe(obfuscate({ compact: true }))
...
.pipe(sourcemaps.write())  // ← Escribe los source maps junto al bundle
.pipe(gulp.dest("public"))
```

**Impacto:**
- Los source maps expuestos revelan el código fuente completo y legible, anulando completamente el beneficio de la ofuscación con `gulp-javascript-obfuscator`.
- Un atacante puede cargar los source maps desde las DevTools del navegador y leer toda la lógica de negocio, estructuras de datos y rutas de la aplicación.

**Recomendación:**
Para producción, eliminar los source maps del build o enviarlos a un servicio privado de monitoreo de errores (como Sentry) sin exponerlos públicamente:
```javascript
// gulpfile.js — En la tarea de producción
.pipe(obfuscate({ compact: true }))
// .pipe(sourcemaps.write())  ← Comentar/eliminar para producción
.pipe(gulp.dest("public"))
```
Para debugging de producción, usar Sentry o similar con upload privado de source maps.

---

### 🔵 BAJA — VUL-13: Lógica de validación invertida en `logAnalyticEvent()`

**Archivo:** `src/_main/firebaseInit.js` — Líneas 57–60

**Descripción:**
La validación de campos requeridos en `logAnalyticEvent` usa el operador de coalescencia nula invertido (`??`) en lugar del operador de negación lógica (`!`), lo que hace que la validación nunca se active correctamente.

```javascript
// firebaseInit.js — Operador incorrecto
!type ?? (errorMsg = "Event type name not included");   // ← ?? debería ser ||
!name ?? (errorMsg = "Event name not included");
!func ?? (errorMsg = "Functionality name not included");
!userType ?? (errorMsg = "User type not included");
```

El operador `??` devuelve el operando derecho solo si el izquierdo es `null` o `undefined`. Pero `!type` siempre evalúa a `true` o `false`, nunca a `null`, por lo que la expresión `!type ?? (...)` nunca ejecuta el lado derecho.

**Impacto:**
- Los eventos analíticos mal formados (sin tipo, nombre o función) son enviados a Firebase Analytics sin validación, contaminando los datos de telemetría.
- Esto es un bug lógico que puede distorsionar el análisis de comportamiento de usuarios.

**Recomendación:**
Corregir el operador:
```javascript
if (!type) errorMsg = "Event type name not included";
if (!name) errorMsg = "Event name not included";
if (!func) errorMsg = "Functionality name not included";
if (!userType) errorMsg = "User type not included";
```

---

### 🔵 BAJA — VUL-14: `public/` versionado en Git (bundle de producción en control de versiones)

**Archivos:** `.gitignore` — Línea 5 (comentada)

**Descripción:**
La carpeta `public/` (bundle compilado y desplegable) está siendo trackeada por Git. El `.gitignore` tiene la exclusión comentada:

```gitignore
# Build / distribución (descomentar si no se quiere versionar el bundle)
# public/
```

**Impacto:**
- El historial de Git acumula múltiples versiones del bundle compilado (código minificado + source maps), aumentando el tamaño del repositorio innecesariamente.
- Los source maps históricos quedan permanentemente en el historial de Git, incluso si se elimina del repositorio en el futuro (requeriría `git filter-branch` o `git filter-repo` para purgar completamente).
- Las credenciales de Firebase en `constants.js` (VUL-01) quedan también en el bundle público trackeado.

**Recomendación:**
1. Descomentar la línea `# public/` en `.gitignore`.
2. Limpiar el historial de Git para eliminar versiones previas del bundle con `git filter-repo --path public/ --invert-paths`.
3. Configurar el deploy de Firebase Hosting en un pipeline de CI/CD (GitHub Actions) que construya el bundle en el momento del deploy sin necesidad de versionar el artefacto.

---

## Plan de Mitigación Priorizado

| Prioridad | ID | Acción | Esfuerzo estimado |
|-----------|-----|--------|-------------------|
| 🔴 1 | VUL-02, VUL-03 | Implementar sanitización HTML (DOMPurify) en todas las inyecciones innerHTML | 1–2 días |
| 🔴 2 | VUL-01 | Migrar credenciales Firebase a inyección por variables de entorno en Gulp build | 1 día |
| 🟠 3 | VUL-08 | Agregar cabeceras de seguridad HTTP en `firebase.json` | 2 horas |
| 🟠 4 | VUL-04 | Vincular `FIREBASE_AVAILABLE` automáticamente al entorno de producción | 2 horas |
| 🟠 5 | VUL-09 | Migrar parseado de query params a `URLSearchParams` | 4 horas |
| 🟠 6 | VUL-07 | Actualizar Firebase SDK a versión actual | 2 horas |
| 🟡 7 | VUL-06 | Documentar limitaciones del "cifrado" y migrar a Web Crypto API si hay datos sensibles | 1 día |
| 🟡 8 | VUL-05 | Agregar `https://` y `async` al script de Google Translator | 1 hora |
| 🔵 9 | VUL-12 | Eliminar source maps del build de producción | 1 hora |
| 🔵 10 | VUL-11 | Reemplazar `Math.random()` por `crypto.randomUUID()` | 30 min |
| 🔵 11 | VUL-13 | Corregir operador lógico en validación de analytics | 15 min |
| 🔵 12 | VUL-14 | Excluir `public/` de Git y limpiar historial | 2 horas |

---

## Conclusión

BaP Framework demuestra un diseño de arquitectura coherente y una filosofía de desarrollo consciente. Los mecanismos de whitelist en Firebase RTDB y la separación modular del código son puntos fuertes que construyen sobre una base sólida.

Las vulnerabilidades identificadas son en gran mayoría consecuencia natural de las compensaciones inherentes al desarrollo con Vanilla JS puro sin frameworks de seguridad (como Lit, Vue o React, que tienen protecciones XSS incorporadas). El patrón de inyección mediante `innerHTML` es el vector de riesgo más recurrente en el framework.

Con las correcciones propuestas, especialmente las de severidad Crítica y Alta, el framework puede alcanzar un nivel de seguridad apropiado para proyectos MVP en entornos de producción controlados, manteniendo su filosofía de ligereza y simplicidad.

---

*Informe generado mediante análisis estático de código fuente (white-box). No se realizaron pruebas de penetración dinámicas (DAST) ni análisis de infraestructura de Firebase.*
