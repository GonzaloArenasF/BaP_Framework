# 🛡️ Log de Correcciones de Seguridad — BaP Framework v2.0.1

> **Referencia:** [security-audit-v2.0.1.md](./security-audit-v2.0.1.md)
> **Inicio:** Junio 2026
> **Metodología:** Corrección iterativa, una vulnerabilidad a la vez, con aprobación previa.

---

## Estado General

| ID | Severidad | Descripción breve | Estado |
|----|-----------|-------------------|--------|
| VUL-01 | 🔴 Crítica | Credenciales Firebase hardcodeadas | ✅ Corregida en v2.1.0 |
| VUL-02 | 🔴 Crítica | XSS via innerHTML masivo en i18n | ✅ Corregida en v2.1.2 |
| VUL-03 | 🔴 Crítica | XSS en bap-dialog via innerHTML + Base64 URL | ✅ Corregida en v2.1.3 |
| VUL-04 | 🟠 Alta | Bypass de seguridad con FIREBASE_AVAILABLE | ✅ Corregida en v2.2.0 |
| VUL-05 | 🟠 Alta | Script de Google Translate sin SRI ni async | ✅ Corregida en v2.2.1 |
| VUL-06 | 🟠 Alta | Pseudo-cifrado con Base64 en storage.js | ✅ Corregida en v2.2.2 |
| VUL-07 | 🟠 Alta | Firebase SDK desactualizado (v10.4.0) | ✅ Corregida en v2.2.3 |
| VUL-08 | 🟡 Media | Ausencia de cabeceras de seguridad HTTP (CSP) | ✅ Corregida en v2.2.4 |
| VUL-09 | 🟡 Media | Query params parseados manualmente con split() | ⏳ Pendiente |
| VUL-10 | 🟡 Media | Servidor de desarrollo con CORS abierto y sin HTTPS | ⏳ Pendiente |
| VUL-11 | 🟡 Media | UUID generado con Math.random() | ⏳ Pendiente |
| VUL-12 | 🔵 Baja | Source maps expuestos en bundle de producción | ⏳ Pendiente |
| VUL-13 | 🔵 Baja | Operador lógico incorrecto en logAnalyticEvent() | ✅ Corregida en v2.2.3 |
| VUL-14 | 🔵 Baja | Carpeta public/ versionada en Git | ⏳ Pendiente |

---

## Detalle de Correcciones

---

### ✅ VUL-01 — Credenciales Firebase hardcodeadas

**Severidad:** 🔴 Crítica
**Versión:** `v2.0.1` → `v2.1.0`
**Fecha:** Junio 2026

#### Problema
Las credenciales completas de Firebase (`apiKey`, `appId`, `messagingSenderId`, etc.) y el ID de reCAPTCHA estaban hardcodeadas directamente en `src/_main/constants.js`, exponiéndolas en el repositorio público de GitHub y en el bundle desplegado.

#### Solución aplicada
Se implementó un sistema de **inyección de credenciales en tiempo de build** mediante tokens `%%NOMBRE%%`, sin agregar dependencias externas:

1. **`.env`** *(nuevo, ignorado por Git)*: Contiene las credenciales reales. Ya estaba cubierto por `.gitignore`.
2. **`.env.example`** *(nuevo, versionado)*: Plantilla con campos vacíos para documentar qué variables son necesarias.
3. **`src/_main/constants.js`**: Las credenciales reales fueron reemplazadas por tokens `%%FIREBASE_AP%%`, `%%FIREBASE_AD%%`, etc. El código fuente ya no contiene ningún secreto.
4. **`gulp-imports.js`**: Se agregó la función `loadEnv()` que lee y parsea `.env` usando solo módulos nativos de Node.js (`fs`, `path`, `url`). Exporta `firebaseEnv` con los valores leídos.
5. **`gulpfile.js`**: Se agregó la función `replaceEnvTokens()` como paso del pipeline de Gulp, que sustituye los tokens en los archivos `.js` **antes** de la ofuscación. Las credenciales solo existen en el bundle de producción (`public/`), nunca en el código fuente.

#### Flujo resultante
```
.env (local, no en Git)
  ↓ loadEnv() en gulp-imports.js
  ↓ replaceEnvTokens() en gulpfile.js
  ↓ ofuscación con gulp-javascript-obfuscator
public/constants.js → credenciales inyectadas + ofuscadas
src/constants.js    → solo tokens %%NOMBRE%%, sin secretos
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `.env` | **CREADO** — Credenciales reales (no en Git) |
| `.env.example` | **CREADO** — Plantilla documentada (en Git) |
| `src/_main/constants.js` | Credenciales → tokens `%%NOMBRE%%` + `APP_VERSION` → `v2.1.0` |
| `gulp-imports.js` | + `loadEnv()` + export `firebaseEnv` |
| `gulpfile.js` | + `replaceEnvTokens()` en pipeline `minifyJS` |
| `package.json` | `v2.0.1` → `v2.1.0` |
| `README.md` | `v2.0.1` → `v2.1.0` |

> **Nota:** Las credenciales que ya estaban en el historial de Git no se purgan con este cambio. Se recomienda rotar la API Key de Firebase en Google Cloud Console si se sospecha que fue comprometida (ver VUL-01 del informe).

#### Enmienda — Renombrado de claves en `.env` / `.env.example`

Se realizó un ajuste posterior a la corrección inicial para mejorar la ergonomía del sistema:

**Motivación:** Firebase entrega las credenciales con nombres estándar (`apiKey`, `authDomain`, `projectId`, etc.). Mantener ese mismo naming en el `.env` permite copiar y pegar directamente desde la consola de Firebase sin necesidad de traducción manual.

**Cambios aplicados:**

| Antes | Después | Campo Firebase |
|-------|---------|----------------|
| `FIREBASE_AP` | `apiKey` | API Key |
| `FIREBASE_AD` | `authDomain` | Auth Domain |
| `FIREBASE_DURL` | `databaseURL` | Database URL |
| `FIREBASE_PID` | `projectId` | Project ID |
| `FIREBASE_SB` | `storageBucket` | Storage Bucket |
| `FIREBASE_MSID` | `messagingSenderId` | Messaging Sender ID |
| `FIREBASE_AID` | `appId` | App ID |
| `FIREBASE_MID` | `measurementId` | Measurement ID |
| `RECAPTCHA_ID` | `RECAPTCHA_ID` | *(sin cambio)* |

Los tokens internos `%%FIREBASE_AP%%`, etc. y las abreviaciones `FBC.AP`, etc. en `constants.js` **no cambiaron**. Solo se actualizó el mapeo en `gulpfile.js → replaceEnvTokens()` para que apunte a los nuevos nombres de clave.

Adicionalmente, las credenciales fueron actualizadas a un nuevo proyecto Firebase.

| Archivo | Cambio |
|---------|--------|
| `.env` | Claves renombradas a convención Firebase + nuevas credenciales |
| `.env.example` | Claves renombradas a convención Firebase |
| `gulpfile.js` | Mapeo `firebaseEnv.*` actualizado a nuevos nombres de clave |

#### Enmienda 2 — Extensión de tokens a `FIREBASE_AVAILABLE` y `RECAPTCHA.NAME`

**Versión:** `v2.1.0` → `v2.1.1`

Se extendió el sistema de inyección de tokens para cubrir dos constantes adicionales que tenían valores hardcodeados:

| Constante | Token en `constants.js` | Clave en `.env` | Tipo | Valor por defecto |
|-----------|------------------------|-----------------|------|-------------------|
| `FIREBASE_AVAILABLE` | `%%FIREBASE_AVAILABLE%%` (sin comillas) | `FIREBASE_AVAILABLE` | booleano | `false` |
| `RECAPTCHA.NAME` | `"%%RECAPTCHA_NAME%%"` (con comillas) | `RECAPTCHA_NAME` | string | — |

> ⚠️ `FIREBASE_AVAILABLE` usa el token **sin comillas** en `constants.js` para que el valor `true`/`false` del `.env` sea inyectado como booleano JS nativo, no como string.

| Archivo | Cambio |
|---------|--------|
| `src/_main/constants.js` | `false` → `%%FIREBASE_AVAILABLE%%` y `"bap-framework web site"` → `"%%RECAPTCHA_NAME%%"` + `v2.1.1` |
| `.env` | + `FIREBASE_AVAILABLE=false` y `RECAPTCHA_NAME=bap-framework web site` |
| `.env.example` | + `FIREBASE_AVAILABLE=` y `RECAPTCHA_NAME=` |
| `gulpfile.js` | + 2 entradas en `replaceEnvTokens()` |
| `package.json` | `v2.1.0` → `v2.1.1` |
| `README.md` | `v2.1.0` → `v2.1.1` |

---

### ✅ VUL-02: Inyección XSS potencial en sistema de plantillas i18n (innerHTML masivo)
 
**Severidad:** 🔴 Crítica
**Versión:** `v2.1.0` → `v2.1.2`
**Fecha:** Junio 2026
 
**Descripción:**
La función `applyI18n()` y la actualización de cabeceras en `index.js` realizaban reemplazos de tokens mediante la reasignación de strings a `document.body.innerHTML` y `document.head.innerHTML`. Esto destruía todo el DOM y re-instanciaba elementos de forma insegura, eliminando event listeners activos y abriendo superficies de XSS.
 
**Corrección implementada:**
1. **Recorrido Seguro del DOM (Traversal)**: Se implementó la función `replaceTokensInDOM(rootNode, tokenMap)` que utiliza la API nativa de alta eficiencia `document.createTreeWalker` para inspeccionar únicamente los nodos de texto (`Node.TEXT_NODE`) y los atributos de los elementos (`Node.ELEMENT_NODE`). Esto elimina por completo la necesidad de mutar e invalidar el HTML del DOM completo.
2. **Inyección Segura de HTML i18n**: Para las traducciones que legítimamente contienen etiquetas HTML de énfasis y código (como `<strong>` y `<code>`), se parsea el string usando un elemento `<template>` y se inyecta su contenido en el DOM de forma segura.
3. **Defensa en Profundidad (Sanitizador)**: Se añadió una función de sanitización ultraligera (`sanitizeHTML()`) que utiliza `DOMParser` para eliminar cualquier etiqueta `<script>`, `iframe`, `style`, `object` o `embed`, y remueve atributos de eventos interactivos (e.g. `onclick`, `onerror`) y esquemas `javascript:`, garantizando inmunidad a ataques XSS.
4. **Actualización Automática**: Se modificó `applyI18n()` para autoconstruir el mapa plano de tokens usando una función recursiva (`flattenObject()`) sobre el diccionario de páginas, aplicándolo de una sola pasada sobre el head y el body.
 
| Archivo | Cambio |
|---------|--------|
| `src/_main/i18n.js` | Remueve `document.head.innerHTML = ...` y `document.body.innerHTML = ...`. Añade `replaceTokensInDOM`, `flattenObject`, `sanitizeHTML`, y actualiza `applyI18n()` |
| `src/index.js` | Remueve la mutación manual de head/body innerHTML en el callback, reemplazándola por `replaceTokensInDOM` |
| `src/_main/constants.js` | `v2.1.1` → `v2.1.2` |
| `package.json` | `v2.1.1` → `v2.1.2` |
| `README.md` | `v2.1.1` → `v2.1.2` |
 
---
 
### ✅ VUL-03: XSS en componente `bap-dialog` mediante inyección de HTML arbitrario y Base64 URLs
 
**Severidad:** 🔴 Crítica
**Versión:** `v2.1.2` → `v2.1.3`
**Fecha:** Junio 2026
 
**Descripción:**
El Web Component `<bap-dialog>` leía `this.innerHTML` crudo del host en su cuerpo (`bodyContent`) e interpolaba textos y metadatos sin sanitización en la plantilla HTML, la cual posteriormente se asignaba a `template.innerHTML` permitiendo ejecución de scripts. Adicionalmente, decodificaba y renderizaba enlaces de Base64 (`link-url-base64`) en tags `<a>` sin validación de protocolo, permitiendo la inyección de esquemas peligrosos como `javascript:`.
 
**Corrección implementada:**
1. **Sanitización del Cuerpo y Textos**: Se importó la función de sanitización robusta y nativa `sanitizeHTML()` desde `i18n.js` y se aplicó de forma mandatoria sobre `props.bodyContent`, `props.titleTop`, `props.titleMain` y `props.titleSub`. Esto neutraliza cualquier inyección HTML maliciosa (eliminando tags `<script>`, `<iframe>` y cualquier atributo de tipo de evento `on*` o esquemas `javascript:`).
2. **Validación de Protocolo de Enlace**: Se decodifica la URL de `link-url-base64` y se valida de forma estricta su esquema. Solo se permite el paso de enlaces que utilicen esquemas seguros (`https://`, `http://`, `mailto:`, enlaces relativos, anclas) y se bloquean por completo esquemas peligrosos como `javascript:`.
3. **Escapado de Enlace**: Se aplica sanitización adicional sobre el texto visible decodificado del enlace.
 
| Archivo | Cambio |
|---------|--------|
| `src/_components/bap-dialog/bap-dialog.js` | Importa `sanitizeHTML()`. Aplica sanitización a metadatos, títulos, y `bodyContent`. Añade validación de protocolo estricta sobre enlaces Base64 |
| `src/_main/constants.js` | `v2.1.2` → `v2.1.3` |
| `package.json` | `v2.1.2` → `v2.1.3` |
| `README.md` | `v2.1.2` → `v2.1.3` |
 
---

### ✅ VUL-04: Bypass de seguridad explícito sin control de entorno de despliegue

**Severidad:** 🟠 Alta
**Versión:** `v2.1.3` → `v2.2.0`
**Fecha:** Junio 2026

**Descripción:**
El flag `FIREBASE_AVAILABLE = false` actuaba como interruptor maestro de seguridad. Cuando estaba inactivo, se omitían todas las comprobaciones de whitelist y control de accesos en el router y el módulo auth. El flag por defecto en desarrollo era `false`, por lo que si se compilaba y desplegaba sin cambiarlo manualmente a `true`, la seguridad de producción quedaba completamente desactivada (riesgo crítico de error humano).

**Corrección implementada:**
1. **Autodetección de Entorno Local (Runtime check)**: Se redefinió `FIREBASE_AVAILABLE` en `src/_main/constants.js` mediante una función autoejecutable (IIFE) que realiza un chequeo de red sobre `window.location.hostname`. Si la aplicación se ejecuta en producción o QA (cualquier hostname no local), se fuerza automáticamente a `true`. Si se ejecuta en local, se respeta el valor de `.env` para desarrollo ágil.
2. **Validación de Compilación de Gulp (Build-time check)**: Se integró una comprobación en el pipeline de Gulp (`gulpfile.js`) dentro de `replaceEnvTokens()`. Si se detecta que el archivo `constants.js` está configurado para compilar hacia producción (`ENV_URL = E.PROD`), Gulp valida que `FIREBASE_AVAILABLE` sea `"true"` en el archivo `.env`. Si no lo es, se interrumpe y aborta el pipeline de optimización con un mensaje de error explícito, evitando deploys accidentales vulnerables.

| Archivo | Cambio |
|---------|--------|
| `src/_main/constants.js` | Cambia `FIREBASE_AVAILABLE` a una IIFE con validación local y de red + bump a `v2.2.0` |
| `gulpfile.js` | Añade validación de producción crítica en `replaceEnvTokens()` para abortar ante bypass activo |
| `package.json` | `v2.1.3` → `v2.2.0` |
| `README.md` | `v2.1.3` → `v2.2.0` |

---

### ✅ VUL-05: Carga dinámica de script de tercero sin integridad verificada (SRI)

**Severidad:** 🟠 Alta
**Versión:** `v2.2.0` → `v2.2.1`
**Fecha:** Junio 2026

**Descripción:**
El componente `<bap-header>` inyectaba dinámicamente el script de Google Translate desde un origen de tercero no verificado sin SRI (Subresource Integrity) y usando un protocolo relativo. Esto introducía riesgos de seguridad Supply Chain y sobrecargas de rendimiento. Adicionalmente, el framework forzaba la inicialización del traductor en `404.js` de la página 404.html, la cual al no tener el header causaba que el script del traductor nunca se cargase, gatillando excepciones críticas de tipo `ReferenceError: google is not defined` que rompían la ejecución local del cliente en 404.

**Corrección implementada (Opción A - Recomendada):**
1. **Remoción Completa del Código Inoperativo**: Dado que ninguna plantilla HTML (ni `index.html` ni `bap-header.html`) contenía el div receptor `<div id="google_translate_element">`, el traductor era inoperante en la práctica. Removimos por completo la inyección dinámica de la etiqueta de script externo en `src/_components/bap-header/bap-header.js`.
2. **Eliminación de la Inicialización en 404**: Se eliminó la función `googleTranslateElementInit()` y su importación/llamada rota en `src/404.js`, resolviendo definitivamente el bug de crash de JavaScript en la página 404.
3. **Refactorización de Plantilla de 404 (Soporte VUL-02)**: Aprovechamos la refactorización para migrar las sustituciones inseguras de `innerHTML` en `src/404.js` a nuestro motor seguro `replaceTokensInDOM()`, eliminando por completo las mutaciones destructivas en la página de error.

| Archivo | Cambio |
|---------|--------|
| `src/_components/bap-header/bap-header.js` | Remueve inyección dinámica del script y función `googleTranslateElementInit()` |
| `src/404.js` | Remueve importación y llamada a `googleTranslateElementInit()`. Refactoriza reemplazos usando `replaceTokensInDOM` seguro |
| `src/_main/constants.js` | `v2.2.0` → `v2.2.1` |
| `package.json` | `v2.2.0` → `v2.2.1` |
| `README.md` | `v2.2.0` → `v2.2.1` |

---

### ✅ VUL-06 — Pseudo-cifrado en storage.js con Base64

**Severidad:** 🟠 Alta
**Versión:** `v2.2.1` → `v2.2.2`
**Fecha:** Junio 2026

#### Problema
Las funciones síncronas `encryptData` y `decryptData` utilizaban codificación Base64 (`btoa` / `atob`) en bruto y concatenaban la clave secreta `secretKey` en texto plano al final del string (`btoa(data) + "/@/" + secretKey`), lo cual no proporciona seguridad criptográfica real. Además, `btoa()` fallaba con caracteres Unicode (no ASCII), limitando la robustez de almacenamiento del framework.

#### Solución aplicada
Implementamos un diseño criptográfico híbrido no destructivo que soluciona la vulnerabilidad de manera definitiva y mantiene 100% de retrocompatibilidad:

1. **Aislamiento y Advertencia en Métodos Síncronos (Obsoletos)**:
   * Marcamos `encryptData` y `decryptData` como `@deprecated` en la documentación JSDoc.
   * Añadimos un `console.warn` automático que se dispara cuando son llamadas, alertando al desarrollador.
   * Refactorizaremos su codificación interna para hacerlas Unicode-safe (`btoa(unescape(encodeURIComponent(data)))`), previniendo caídas al guardar textos con tildes, eñes o emojis.
2. **Capa Criptográfica Segura Asíncrona (Web Crypto API)**:
   * Implementamos `secureEncryptData(data, password)` y `secureDecryptData(encryptedData, password)` usando **AES-GCM (256 bits)** nativo y derivación de clave por **PBKDF2** (con 100,000 iteraciones, HMAC-SHA256 y salting seguro de 16 bytes).
   * **Enlace Dinámico de Sesión (Opción A)**: El framework promueve el uso del **`uid` de Firebase Auth (`auth.currentUser.uid`)** como clave dinámica de derivación para encriptar localmente. De este modo, los datos de cada usuario quedan protegidos de forma única y aislada.
   * Empaquetamos todo en una firma estándar Base64 libre de límites de pila: `Salt (16B) + IV (12B) + Ciphertext`.
3. **Nuevos Envolventes Asíncronos**:
   * Creamos y exportamos `getFromStorageAsync`, `setToStorageAsync`, y `updateStorageAsync`.
   * Para `LOCAL` y `SESSION`, realizan cifrado/descifrado transparente AES-GCM si se provee `secretKey` (por ejemplo, el UID del usuario).
   * Para `DB` (Firebase Realtime Database), se implementó un sistema basado en `Promise` en lugar de callbacks tradicionales, modernizando su consumo.

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/storage.js` | Métodos síncronos deprecados + Unicode-safe. Añade `secureEncryptData`, `secureDecryptData` y métodos `*Async` con PBKDF2/AES-GCM |
| `src/_main/constants.js` | `v2.2.1` → `v2.2.2` |
| `package.json` | `v2.2.1` → `v2.2.2` |
| `README.md` | `v2.2.1` → `v2.2.2` + documentación de persistencia criptográfica |
| `docs/security-fixes-log.md` | Registro de corrección de VUL-06 y tabla de estado general actualizada |

---

### ✅ VUL-07 — Firebase SDK versionado y desactualizado (pin a versión antigua)

**Severidad:** 🟠 Alta
**Versión:** `v2.2.2` → `v2.2.3`
**Fecha:** Junio 2026

#### Problema
Todos los módulos del SDK de Firebase (`app`, `analytics`, `auth`, `database`, `app-check`) se importaban apuntando a la versión inestable y antigua `10.4.0` (publicada en octubre de 2023) desde el CDN de Google. Esto mantenía al framework expuesto a problemas de seguridad conocidos y sin parchar, y generaba una inconsistencia con el paquete de Firebase del lado de desarrollo definido en `package.json` (`"firebase": "^10.11.0"`).

#### Solución aplicada
1. **Actualización Coordinada del SDK**:
   * Actualizamos todas las rutas de importación de CDN en `src/_main/firebaseInit.js`, `src/_main/auth.js` y `src/_main/storage.js` para apuntar a la versión **`10.11.0`**.
   * Esta versión está en **100% consonancia** con la dependencia local instalada en el framework (`^10.11.0`), garantizando homogeneidad absoluta entre el desarrollo local y el cliente final desplegado.
   * Se mantuvieron intactas las llamadas modulares a las APIs de Firebase, asegurando compatibilidad hacia atrás sin breaking changes de sintaxis.

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/firebaseInit.js` | Importaciones de Firebase actualizadas a `10.11.0` |
| `src/_main/auth.js` | Importaciones de Firebase actualizadas a `10.11.0` |
| `src/_main/storage.js` | Importación de Firebase Database actualizada a `10.11.0` |

---

### ✅ VUL-13 — Lógica de validación invertida en logAnalyticEvent()

**Severidad:** 🔵 Baja
**Versión:** `v2.2.2` → `v2.2.3`
**Fecha:** Junio 2026

#### Problema
El validador de campos requeridos dentro de la utilidad `logAnalyticEvent()` en `src/_main/firebaseInit.js` empleaba el operador de coalescencia nula invertido (`??`) incorrectamente:
```javascript
!type ?? (errorMsg = "Event type name not included");
```
Dado que `!type` siempre retorna un valor booleano (`true` o `false`), que nunca es `null` ni `undefined`, la rama derecha que asignaba el mensaje de error jamás se ejecutaba, provocando que validaciones inválidas pasaran silenciosamente y contaminaran la base de analíticas.

#### Solución aplicada
1. **Refactorización de Condicionales**:
   * Eliminamos el uso incorrecto de `??` y lo reemplazamos por estructuras condicionales `if` explícitas e incondicionales:
     ```javascript
     let errorMsg = "";
     if (!type) errorMsg = "Event type name not included";
     if (!name) errorMsg = "Event name not included";
     if (!func) errorMsg = "Functionality name not included";
     if (!userType) errorMsg = "User type not included";
     ```
   * Esto garantiza la correcta interrupción mediante excepciones ante parámetros mal estructurados en producción, manteniendo la consistencia de los datos en Google Analytics.

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/firebaseInit.js` | Corrección de validaciones de coalescencia nula por condicionales `if` estándar en `logAnalyticEvent` |
| `src/_main/constants.js` | `v2.2.2` → `v2.2.3` |
| `package.json` | `v2.2.2` → `v2.2.3` |
| `README.md` | `v2.2.2` → `v2.2.3` |
| `docs/security-fixes-log.md` | Registro de correcciones y tabla de estados generales actualizada |

---

### ✅ VUL-08 — Ausencia total de Content Security Policy (CSP)

**Severidad:** 🟡 Media
**Versión:** `v2.2.3` → `v2.2.4`
**Fecha:** Junio 2026

#### Problema
La configuración de despliegue de Firebase Hosting carecía por completo de cabeceras HTTP de seguridad. Esto dejaba a la aplicación expuesta a ataques de clickjacking, inyecciones de MIME-sniffing, y no limitaba de ninguna forma la carga de scripts o la conectividad externa (ausencia de Content Security Policy).

#### Solución aplicada
1. **Configuración de Cabeceras HTTP de Seguridad en `firebase.json`**:
   * Agregamos la clave `"headers"` con directivas globales (`"source": "**"`) para inyectar cabeceras en todas las respuestas del servidor:
     * `X-Frame-Options: SAMEORIGIN`: Protege contra **Clickjacking** impidiendo que el sitio sea embebido en iframes externos no controlados.
     * `X-Content-Type-Options: nosniff`: Mitiga inyecciones de XSS previniendo que el navegador interprete tipos de recursos incorrectos.
     * `Referrer-Policy: strict-origin-when-cross-origin`: Resguarda la privacidad restringiendo la información del referrer al navegar externamente.
     * `Permissions-Policy`: Restringe el acceso a APIs de hardware del cliente (`camera=(), microphone=(), geolocation=()`).
2. **Diseño de un Content Security Policy (CSP) ultra-estricto**:
   * Declaramos una directiva CSP sumamente restrictiva y segura, adaptada de forma nativa a los recursos necesarios del framework:
     * `default-src 'self'`: Bloqueo por defecto de cualquier origen externo.
     * `script-src 'self' https://www.gstatic.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/`: Permite la ejecución de scripts únicamente del origen local, el CDN de Firebase de Google y el widget interactivo de reCAPTCHA.
     * `connect-src 'self' https://*.firebase.io https://*.firebaseio.com wss://*.firebaseio.com https://*.google-analytics.com https://*.analytics.google.com https://recaptchaenterprise.googleapis.com`: Permite y aísla de forma segura las conexiones hacia la base de datos de Firebase RTDB, Google Analytics y la API de reCAPTCHA Enterprise.
     * `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: Permite las hojas de estilos del framework, estilos dinámicos embebidos necesarios e importación de fuentes de Google.
     * `font-src 'self' https://fonts.gstatic.com`: Permite la descarga vectorial de tipografías premium desde Google Fonts.
     * `img-src 'self' data: https:`: Habilita logotipos locales, SVGs inline, e imágenes remotas sobre HTTPS.
     * `frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/`: Habilita la inyección segura del iframe de validación humana de reCAPTCHA.
     * `frame-ancestors 'self'`: Directiva CSP que anula la posibilidad de embeber el sitio en dominios ajenos.

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `firebase.json` | Incorpora la sección `"headers"` completa inyectando CSP, X-Frame-Options, y más |
| `src/_main/constants.js` | `v2.2.3` → `v2.2.4` |
| `package.json` | `v2.2.3` → `v2.2.4` |
| `README.md` | `v2.2.3` → `v2.2.4` |
| `docs/security-fixes-log.md` | Registro de corrección de VUL-08 y tabla de estados generales actualizada |

---


