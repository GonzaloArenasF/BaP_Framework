# 🛡️ Log de Correcciones de Seguridad — BaP Framework v2.0.1

> **Referencia:** [security-audit-v2.0.1.md](./security-audit-v2.0.1.md)
> **Inicio:** Junio 2026
> **Metodología:** Corrección iterativa, una vulnerabilidad a la vez, con aprobación previa.

---

## Estado General

| ID | Severidad | Descripción breve | Estado |
|----|-----------|-------------------|--------|
| VUL-01 | 🔴 Crítica | Credenciales Firebase hardcodeadas | ✅ Corregida en v2.1.0 |
| VUL-02 | 🔴 Crítica | XSS via innerHTML masivo en i18n | ⏳ Pendiente |
| VUL-03 | 🔴 Crítica | XSS en bap-dialog via innerHTML + Base64 URL | ⏳ Pendiente |
| VUL-04 | 🟠 Alta | Bypass de seguridad con FIREBASE_AVAILABLE | ⏳ Pendiente |
| VUL-05 | 🟠 Alta | Script de Google Translate sin SRI ni async | ⏳ Pendiente |
| VUL-06 | 🟠 Alta | Pseudo-cifrado con Base64 en storage.js | ⏳ Pendiente |
| VUL-07 | 🟠 Alta | Firebase SDK desactualizado (v10.4.0) | ⏳ Pendiente |
| VUL-08 | 🟡 Media | Ausencia de cabeceras de seguridad HTTP (CSP) | ⏳ Pendiente |
| VUL-09 | 🟡 Media | Query params parseados manualmente con split() | ⏳ Pendiente |
| VUL-10 | 🟡 Media | Servidor de desarrollo con CORS abierto y sin HTTPS | ⏳ Pendiente |
| VUL-11 | 🟡 Media | UUID generado con Math.random() | ⏳ Pendiente |
| VUL-12 | 🔵 Baja | Source maps expuestos en bundle de producción | ⏳ Pendiente |
| VUL-13 | 🔵 Baja | Operador lógico incorrecto en logAnalyticEvent() | ⏳ Pendiente |
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

### 🔴 CRÍTICA — VUL-02: Inyección XSS potencial en sistema de plantillas i18n (innerHTML masivo)
 
**Versión:** `v2.1.1` → `v2.1.2`
 
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
 
### 🔴 CRÍTICA — VUL-03: XSS en componente `bap-dialog` mediante inyección de HTML arbitrario y Base64 URLs
 
**Versión:** `v2.1.2` → `v2.1.3`
 
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

