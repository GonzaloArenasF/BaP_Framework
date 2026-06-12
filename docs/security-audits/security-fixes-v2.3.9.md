# 🛡️ Log de Correcciones de Seguridad — BaP Framework v2.3.9

> **Referencia:** [security-audit-v2.3.9.md](./security-audit-v2.3.9.md)
> **Inicio:** Junio 2026
> **Transición de versión:** `v2.3.9` → `v2.4.0`
> **Metodología:** Corrección por hallazgo, verificada con la suite de pruebas (Vitest, 214 tests) y con un build real de Gulp tras cada cambio estructural.

---

## Alcance de esta ronda

Esta ronda aborda los **15 hallazgos** de la auditoría `v2.3.9`. Tres de ellos no se corrigieron con cambios de código en el primer barrido automático y se trataron de forma diferenciada tras análisis con el responsable del proyecto:

- **SEC-01** (credenciales en historial de Git) — **reclasificado a 🔵 Riesgo Aceptado** tras análisis contextual (ver sección dedicada más abajo). No requiere corrección de código.
- **SEC-09** (autorización whitelist client-side / Reglas de Seguridad no versionadas) — **mitigado** vía documentación + eliminación de `loginAttempts` (ver detalle).
- **SEC-10** (bypass de la "Regla de Oro" con `FIREBASE_AVAILABLE=false`) — **mitigado por controles existentes + documentado** (ver detalle). No procede *fail-closed*.

Los 12 hallazgos restantes (1 corrección incompleta + 11 nuevos) fueron corregidos o mitigados con cambios de código en esta versión. **No queda ningún hallazgo abierto sin tratar.**

---

## Estado General

| ID | Severidad | Descripción breve | Estado |
|----|-----------|-------------------|--------|
| SEC-02 | 🟠 Alta | `bap-dialog`: validación de URL no impedía romper el atributo | ✅ Corregida en v2.4.0 |
| SEC-03 | 🟠 Alta | `bap-chip`: `innerHTML` del host sin sanitizar | ✅ Corregida en v2.4.0 |
| SEC-04 | 🟠 Alta | `bap-loading-state`: `innerHTML`/atributo sin sanitizar | ✅ Corregida en v2.4.0 |
| SEC-05 | 🟡 Media | DOMPurify cargado desde CDN externo sin SRI | ✅ Corregida en v2.4.0 (vendored local) |
| SEC-06 | 🟡 Media | Sitio CDN sin cabeceras de seguridad | ✅ Corregida en v2.4.0 (cabeceras de CDN) |
| SEC-07 | 🟡 Media | Falta `Strict-Transport-Security` (HSTS) | ✅ Corregida en v2.4.0 |
| SEC-08 | 🟡 Media | CSP: `'unsafe-inline'` en estilos + `img-src` amplio | ✅ Mitigada en v2.4.0 (ver detalle) |
| SEC-11 | 🔵 Baja | `getFromStorageAsync` (RTDB) sin sanitización | ✅ Corregida en v2.4.0 (flag opt-in) |
| SEC-12 | 🔵 Baja | `.firebase/` versionado | ✅ Corregida en v2.4.0 |
| SEC-13 | 🔵 Baja | Dependencias transitivas con CVEs | 🟨 Parcial / documentada (ver detalle) |
| SEC-14 | 🔵 Baja | IDs de DOM con `Math.random()` | ✅ Corregida en v2.4.0 |
| SEC-15 | 🔵 Baja | `escape()`/`unescape()` obsoletos | ✅ Corregida en v2.4.0 |
| SEC-01 | 🟠 → 🔵 | Credenciales (públicas por diseño) en historial de Git | ✅ Reclasificada a Riesgo Aceptado (ver detalle) |
| SEC-09 | 🟡 Media | Whitelist client-side / Reglas RTDB / rate limiting | ✅ Mitigada en v2.4.0 (doc + eliminación de `loginAttempts`) |
| SEC-10 | 🟡 Media | Bypass de la "Regla de Oro" | ✅ Mitigada por controles existentes + documentada |

> **Verificación global:** los 214 tests de la suite (Vitest) pasan tras los cambios, y el build de producción de Gulp (`optimize`) se completa correctamente, copiando el DOMPurify vendored al bundle y eliminando toda referencia a CDNs externos en `public/`.

---

## Detalle de Correcciones

---

### ✅ SEC-02 — `bap-dialog`: la validación de URL no impedía romper el atributo

**Severidad:** 🟠 Alta
**Versión:** `v2.3.9` → `v2.4.0`

#### Problema
`isSafeImageUrl()` y la validación del enlace Base64 confirmaban el **esquema** de la URL (`https://`, `http://`, etc.) pero no rechazaban comillas u otros caracteres que escapan del contexto de un atributo HTML entrecomillado. Como las URLs se insertaban por interpolación de string dentro de `src="..."` / `href="..."`, una URL como `https://x" onerror="..."` pasaba la validación de esquema e inyectaba un event handler (XSS por inyección de atributos).

#### Solución aplicada
Se añadió el helper `hasUnsafeUrlChars(url)` que rechaza cualquier URL que contenga comillas (`"`, `'`), backtick (`` ` ``), ángulos (`<`, `>`) o espacios en blanco. Se integró en **dos puntos**:

1. `isSafeImageUrl()`: rechaza la URL antes de validar el esquema (afecta a `image-header-left`, `image-header-right`, `image-detail`).
2. La validación `isSafeProtocol` del enlace Base64: ahora exige `!hasUnsafeUrlChars(decodedUrl)` además del esquema válido, protegiendo el `href` interpolado.

Las URLs legítimas codifican esos caracteres, por lo que la restricción no afecta el uso normal. La advertencia existente para esquemas peligrosos (`javascript:`) se mantiene intacta.

```javascript
function hasUnsafeUrlChars(url) {
  return /["'`<>\s]/.test(url);
}
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_components/bap-dialog/bap-dialog.js` | Helper `hasUnsafeUrlChars()`; integrado en `isSafeImageUrl()` y en la validación del enlace Base64 |

---

### ✅ SEC-03 — `bap-chip`: `innerHTML` del host inyectado sin sanitizar

**Severidad:** 🟠 Alta
**Versión:** `v2.3.9` → `v2.4.0`

#### Problema
`bap-chip` leía `this.innerHTML` (contenido no confiable del host) como `props.label` y lo interpolaba en la plantilla vía `html.replace("{label}", props.label)`, que luego `createCustomComponent` asignaba a `template.innerHTML`. No aplicaba ninguna sanitización, a diferencia de `bap-notification` o `bap-dialog`.

#### Solución aplicada
Se importó `sanitizeHTML()` (DOMPurify allowlist) y se aplicó sobre `props.label` en `preRender`:

```javascript
import { sanitizeHTML } from "../../_main/i18n.js";

function preRender(html, props) {
  return html.replace("{label}", sanitizeHTML(props.label));
}
```

El texto plano de las chips se preserva sin cambios; cualquier marcado peligroso (scripts, event handlers) es eliminado.

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_components/bap-chip/bap-chip.js` | Import de `sanitizeHTML`; sanitización del label en `preRender` |

---

### ✅ SEC-04 — `bap-loading-state`: `innerHTML` y atributo inyectados sin sanitizar

**Severidad:** 🟠 Alta
**Versión:** `v2.3.9` → `v2.4.0`

#### Problema
`props.message` (`this.innerHTML`) y `props.subMessage` (atributo `sub-message`) —ambos no confiables— se interpolaban sin sanitizar en `template.innerHTML` mediante `replaceAll`.

#### Solución aplicada
Se importó `sanitizeHTML()` y se aplicó a ambos valores antes de la interpolación:

```javascript
import { sanitizeHTML } from "../../_main/i18n.js";

let htmlWithProps = html.replaceAll("{message}", sanitizeHTML(props.message));
htmlWithProps = htmlWithProps.replaceAll(
  "{sub-message}",
  props.subMessage ? `<h3>${sanitizeHTML(props.subMessage)}</h3>` : ""
);
```

Los tests `LDS-01/02/03` (mensaje, sub-mensaje y ausencia de sub-mensaje) siguen pasando, confirmando que el contenido legítimo se preserva.

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_components/bap-loading-state/bap-loading-state.js` | Import de `sanitizeHTML`; sanitización de `message` y `sub-message` |

---

### ✅ SEC-05 — DOMPurify empaquetado localmente (vendored) en lugar de CDN externo

**Severidad:** 🟡 Media
**Versión:** `v2.3.9` → `v2.4.0`

#### Problema
DOMPurify —el único componente de sanitización del framework— se importaba como ES module desde `https://cdn.jsdelivr.net`, sin SRI (los `import` estáticos de ESM no lo admiten). Un compromiso del CDN o un MITM podía servir una versión que no sanitiza, anulando silenciosamente toda la defensa XSS; y una caída del CDN rompía la carga de `i18n.js` y sus dependientes.

#### Solución aplicada
1. Se **vendoró** `node_modules/dompurify@3.1.7/dist/purify.es.mjs` a `src/_main/vendor/purify.es.mjs` (se eliminó la referencia al sourcemap para evitar un 404 cosmético en producción).
2. Se cambió el import en `i18n.js` a la ruta local del mismo origen:
   ```javascript
   import DOMPurify from "./vendor/purify.es.mjs";
   ```
3. Se extendió `copyStaticFiles` en `gulpfile.js` para copiar `**/*.mjs` al bundle (los `.mjs` **no** pasan por la ofuscación de JS, preservando la integridad de la librería).
4. Se eliminó `https://cdn.jsdelivr.net` de las directivas `script-src` y `connect-src` del CSP en `firebase.json` (ya no es necesario; CSP más estricto).
5. Se actualizó el alias de DOMPurify en `vitest.config.js` (forma de array con `find` por RegExp `/.*\/vendor\/purify\.es\.mjs$/`) para que los tests sigan usando el mock determinista.

**Verificación:** el build genera `public/_main/vendor/purify.es.mjs`, el `i18n.js` compilado importa `./vendor/purify.es.mjs`, y no queda **ninguna** referencia a `jsdelivr` en `public/`.

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/vendor/purify.es.mjs` | **Nuevo** — DOMPurify 3.1.7 vendored |
| `src/_main/i18n.js` | Import local de DOMPurify; comentario actualizado |
| `gulpfile.js` | `copyStaticFiles` copia `**/*.mjs` |
| `firebase.json` | `jsdelivr` eliminado de `script-src` y `connect-src` |
| `vitest.config.js` | Alias de DOMPurify por RegExp (forma de array) |

---

### ✅ SEC-06 — Cabeceras de seguridad en el sitio CDN (orientadas a servir recursos)

**Severidad:** 🟡 Media
**Versión:** `v2.3.9` → `v2.4.0`

#### Problema
`cdn/firebase.json` no definía ninguna cabecera de respuesta.

#### Solución aplicada
Considerando que el sitio CDN **no expone una aplicación navegable sino que dispone recursos** para ser consumidos por otros orígenes, se añadieron cabeceras orientadas a un CDN (no restrictivas en framing, pero seguras en tipo de contenido y transporte, y habilitando CORS):

```json
"headers": [{
  "source": "**",
  "headers": [
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
    { "key": "Access-Control-Allow-Origin", "value": "*" },
    { "key": "Access-Control-Allow-Methods", "value": "GET, HEAD, OPTIONS" },
    { "key": "Access-Control-Max-Age", "value": "3600" },
    { "key": "Cache-Control", "value": "public, max-age=3600" }
  ]
}]
```

- `nosniff` evita interpretación incorrecta de Content-Type (ataques polyglot).
- HSTS fuerza HTTPS.
- `Access-Control-Allow-Origin: *` + `Allow-Methods` permiten que el recurso sea consumido cross-origin (función propia de un CDN).
- `Cache-Control` habilita el cacheo esperado de un CDN.
- **No** se añadió `X-Frame-Options`/`frame-ancestors` restrictivos, ya que un CDN de recursos no es una superficie de clickjacking relevante.

> ⚠️ **Pendiente de verificación manual (no modificado):** el campo `"site": "cdn-bap-framewotk"` contiene un posible typo (`framewotk`). No se alteró para no romper el target de despliegue de Firebase; debe verificarse contra la consola de Firebase (el dominio real en `constants` es `cdn-bap-framework`).

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `cdn/firebase.json` | Bloque `headers` orientado a CDN (CORS + nosniff + HSTS + cache) |

---

### ✅ SEC-07 — Cabecera `Strict-Transport-Security` (HSTS) en el sitio principal

**Severidad:** 🟡 Media
**Versión:** `v2.3.9` → `v2.4.0`

#### Problema
El `firebase.json` principal no incluía HSTS, dejando la primera conexión expuesta a SSL stripping.

#### Solución aplicada
Se añadió a la cabecera `**`:
```json
{ "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
```
Se omitió `preload` deliberadamente (inscripción difícil de revertir; debe ser una decisión explícita).

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `firebase.json` | Cabecera HSTS añadida |

---

### ✅ SEC-08 — CSP: bloqueo de estilos inline `<style>` sin romper terceros

**Severidad:** 🟡 Media
**Versión:** `v2.3.9` → `v2.4.0`
**Consideración del responsable:** *"Cuida que la eliminación de ese inline no rompa la funcionalidad."*

#### Problema
La CSP usaba `style-src 'self' 'unsafe-inline' ...`. El vector de mayor valor de la CSS-injection (exfiltración por selectores de atributo, p.ej. `input[value^="a"]{background:url(...)}`) **requiere un bloque `<style>` inline**; los atributos `style=""` no permiten escribir selectores.

#### Análisis de no-romper-funcionalidad
- Se verificó que el framework **no usa ningún bloque `<style>` inline** ni inyecta `<style>` por JS (`grep` sin resultados).
- El único estilo inline propio eran los atributos `style="..."` de `bap-svg-image`, que se **eliminaron** (ver más abajo, migrados a CSSOM).
- Los terceros (badge de **reCAPTCHA Enterprise** vía App Check, **Google Tag Manager**) pueden inyectar atributos `style=""` en el documento. Eliminar `'unsafe-inline'` por completo de los **atributos** rompería esa capa visual, y una CSP basada en *nonces* requiere generación por petición en el servidor (imposible en Firebase Hosting estático).

#### Solución aplicada (mitigación medida)
1. **`bap-svg-image`:** se eliminaron los atributos `style="..."` del markup; las dimensiones dinámicas (ancho/alto/`transform: scale`) ahora se aplican vía **CSSOM** (`element.style.*`), que **no** constituye estilo inline para la CSP y no requiere `'unsafe-inline'`. Los tests `SVG-01/SVG-05` (que leen `figure.style.width`) siguen pasando.
2. **CSP en `firebase.json`:** se añadió la directiva granular
   ```
   style-src-elem 'self' https://fonts.googleapis.com https://www.gstatic.com
   ```
   que gobierna `<style>`/`<link>`/`@import` **sin** `'unsafe-inline'`, bloqueando así la inyección de `<style>` (el vector real de exfiltración). Se incluyó `fonts.googleapis.com` (el `@import` de fuentes en `main.css`) y `www.gstatic.com` (estilos de reCAPTCHA).
   Se mantiene `style-src ... 'unsafe-inline' ...` como **fallback para atributos** `style=""` (sin `style-src-attr` explícito), preservando el badge de reCAPTCHA y cualquier estilo de atributo de terceros.

#### Trade-off documentado
- Se bloquea el vector de mayor impacto (CSS-injection vía `<style>`) sin romper terceros.
- Los atributos `style=""` de terceros siguen permitidos (necesario en hosting estático). La defensa de fondo se mantiene en la capa de sanitización: DOMPurify excluye `style` de `ALLOWED_ATTR` y `<style>` de `ALLOWED_TAGS`, por lo que ningún dato sanitizado puede introducir estilos.
- `img-src 'self' data: https:` se **mantiene a propósito**: `bap-dialog` soporta por diseño URLs de imagen HTTPS arbitrarias (característica del framework). Restringirlo rompería esa funcionalidad; su endurecimiento queda como decisión por despliegue.
- **Recomendación residual:** para una CSP totalmente estricta, migrar a *nonces* generados por servidor (Cloud Functions / App Hosting) y eliminar `'unsafe-inline'` también de los atributos.

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_components/bap-svg-image/bap-svg-image.js` | Estilos inline → CSSOM (`element.style.*`) |
| `firebase.json` | Directiva `style-src-elem` (sin `'unsafe-inline'`) |

---

### ✅ SEC-11 — `getFromStorageAsync` (RTDB): sanitización opt-in (verificada sin romper funcionalidad)

**Severidad:** 🔵 Baja
**Versión:** `v2.3.9` → `v2.4.0`

#### Problema
La rama RTDB de `getFromStorageAsync` devolvía `snapshot.val()` crudo; si ese dato se renderizaba luego como HTML, podía materializar un XSS almacenado.

#### Solución aplicada (sin cambio de comportamiento por defecto)
Se añadió un parámetro **opt-in** `sanitize` con valor por defecto `false`. Sólo cuando `sanitize === true` **y** el valor leído es un `string`, se aplica `sanitizeHTML()`:

```javascript
export const getFromStorageAsync = async ({ storageType, item, secretKey, sanitize = false }) => {
  // ...
  case CONSTANT.STORAGE.SOURCE.DB:
    onValue(dbConnection, (snapshot) => {
      const val = snapshot.val();
      resolve(sanitize && typeof val === "string" ? sanitizeHTML(val) : val);
    }, ...);
};
```

**Verificación funcional:** por defecto (`sanitize` ausente) el comportamiento es idéntico al anterior — el test `STO-18` (lee un objeto de RTDB y lo espera intacto) sigue pasando, igual que el resto de la suite de storage. La sanitización principal debe seguir ocurriendo en el punto de renderizado (cubierto por SEC-02/03/04); este flag es una capa adicional opcional.

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/storage.js` | Import de `sanitizeHTML`; parámetro `sanitize` opt-in en `getFromStorageAsync` (rama RTDB) |

---

### ✅ SEC-12 — `.firebase/` ignorado y desindexado

**Severidad:** 🔵 Baja
**Versión:** `v2.3.9` → `v2.4.0`

#### Problema
La caché de despliegue `.firebase/hosting.*.cache` estaba versionada y no figuraba en `.gitignore`.

#### Solución aplicada
1. Se añadió `.firebase/` a `.gitignore`.
2. Se desindexó del control de versiones con `git rm -r --cached .firebase` (el archivo permanece en disco; sólo deja de versionarse).

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `.gitignore` | Regla `.firebase/` |
| (índice Git) | `.firebase/` desindexado (`--cached`) |

---

### 🟨 SEC-13 — Dependencias transitivas con CVEs (parcial / documentada)

**Severidad:** 🔵 Baja
**Versión:** `v2.3.9` → `v2.4.0`

#### Acción y resultado
Se ejecutó `npm audit fix` (sin `--force`). **No aplicó cambios de código**: la totalidad de los avisos restantes (≈35: moderados y altos, en `undici`, `teeny-request`, `retry-request`, etc.) sólo se resuelven con **bumps de versión mayor** que requieren `--force` y que romperían `firebase-tools`.

#### Decisión (respetando "no romper funcionalidad")
- **No** se ejecutó `npm audit fix --force` para no comprometer el pipeline de build/deploy.
- Punto clave: **estos avisos viven en dependencias de build/deploy (`firebase-tools`) y en el paquete npm `firebase`, ninguno de los cuales se envía al cliente.** El SDK de Firebase de runtime se carga desde `gstatic.com/firebasejs/10.11.0` (CDN), y `src/`/tests no importan el paquete npm `firebase`. El riesgo en el cliente desplegado es por tanto nulo; el residual se limita al entorno de desarrollo/despliegue.

#### Recomendación
Planificar una actualización mayor de `firebase-tools` (y opcionalmente del paquete npm `firebase`) en una rama dedicada, validando el flujo `deploy-prod` antes de fusionar.

---

### ✅ SEC-14 — IDs de DOM con UUID criptográfico

**Severidad:** 🔵 Baja
**Versión:** `v2.3.9` → `v2.4.0`

#### Problema
`bap-dialog` (`bapDialog-${Math.floor(Math.random()*1000000)}`) y `createCustomComponent` (`bapCustomId${Math.floor(Math.random()*...)}`) generaban IDs de DOM con `Math.random()`, susceptibles a colisiones que vincularían eventos al elemento equivocado.

#### Solución aplicada
Ambos reutilizan ahora `generateUUID()` (basado en `crypto.randomUUID`, ya presente desde VUL-11):
```javascript
// bap-dialog.js
id: this.getAttribute("id") || `bapDialog-${generateUUID()}`,
// customComponentsRegistration.js
const elementID = `bapCustomId-${generateUUID()}`;
```
El test `CCR-09` se actualizó para validar el nuevo formato (`/^bapCustomId-[0-9a-f-]+$/i`), preservando su intención (verificar la autogeneración del ID).

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_components/bap-dialog/bap-dialog.js` | Import de `generateUUID`; ID con UUID |
| `src/_components/customComponentsRegistration.js` | Import de `generateUUID`; `elementID` con UUID |
| `test/_components/customComponentsRegistration.test.js` | Aserción del formato de ID actualizada |

---

### ✅ SEC-15 — `escape()`/`unescape()` reemplazados por `TextEncoder`/`TextDecoder`

**Severidad:** 🔵 Baja
**Versión:** `v2.3.9` → `v2.4.0`

#### Problema
La conversión Base64 ↔ UTF-8 usaba `escape()`/`unescape()` (obsoletos) en `storage.js` y `bap-dialog.js`.

#### Solución aplicada
- **`storage.js`:** `encryptData`/`decryptData` reutilizan los helpers existentes `uint8ToBase64`/`base64ToUint8` con `TextEncoder`/`TextDecoder`. El resultado es idéntico para UTF-8 válido, por lo que no se rompe el round-trip (verificado con los tests `STO-*`).
- **`bap-dialog.js`:** nuevo helper `base64ToUtf8()` con `TextDecoder`, usado en la decodificación de los enlaces Base64 (tests `DLG-06/10/11` siguen pasando).

```javascript
// bap-dialog.js
function base64ToUtf8(b64) {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
```

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/storage.js` | `encryptData`/`decryptData` con `TextEncoder`/`TextDecoder` |
| `src/_components/bap-dialog/bap-dialog.js` | Helper `base64ToUtf8()`; decodificación sin `escape/unescape` |

---

## Hallazgo Reclasificado a Riesgo Aceptado

### 🔵 SEC-01 — Credenciales en el historial de Git → **Riesgo Aceptado** (severidad original 🟠 Alta, reevaluada)

La auditoría clasificó este hallazgo como 🟠 Alta de forma **conservadora**. Tras un análisis contextual con el responsable del proyecto, se reevalúa y se documenta como **riesgo aceptado, sin corrección de código**. La fundamentación es la siguiente:

#### 1. Lo expuesto es público por diseño, no es un secreto filtrado
El bundle de `public/` **debe** incluir la configuración de Firebase porque el framework se sirve vía CDN al cliente. Las claves expuestas — `apiKey`, `authDomain`, `projectId`, `appId`, `messagingSenderId`, `measurementId` y el **site key de reCAPTCHA** — son **públicas por diseño** en el modelo de Firebase web: se entregan al navegador en cualquier SPA con Firebase, con o sin CDN. No existe forma de evitarlo, y cualquiera puede verlas en el runtime de producción actual. El historial no las hace "más expuestas" de lo que ya están por necesidad.

> **Sobre la ofuscación:** tiene valor legítimo (dificulta el reverse-engineering casual de la lógica / propiedad intelectual del *cómo*), pero **no es** —ni se documenta como— una medida de confidencialidad de claves: enreda la lógica, no oculta literales. Esta distinción queda explícita.

#### 2. La defensa real está configurada y es la correcta
La protección de un proyecto Firebase **no** depende de ocultar esas claves, sino de:
- **App Check (reCAPTCHA Enterprise) en modo *enforced*** — inicializado en `firebaseInit.js`.
- **reCAPTCHA restringido por dominio** — configuración aplicada por el responsable. Esto **neutraliza el único vector "vivo"**: el site key reutilizado (`6Lf7O_…`, presente tanto en el historial como en `.env.production`) **no produce tokens válidos desde un dominio no autorizado**. App Check + restricción de dominio se refuerzan mutuamente, dejando la clave expuesta prácticamente inútil para un atacante.
- **Security Rules del RTDB** — frontera de autorización de datos. Es responsabilidad del desarrollador que implementa el framework (ver SEC-09) y está **cubierta por el texto de licencia**, que declara que el framework no se responsabiliza de la información que el usuario expone ni de cómo lo utiliza.

> **Límite honesto:** App Check + restricción de dominio responden a *"¿quién/qué puede hablar con el backend?"* (anti-bot/anti-abuso). **No** sustituyen a las Security Rules, que gobiernan *"¿qué puede leer/escribir cada quién una vez autenticado?"*. Son capas complementarias; ambas del lado anti-abuso ya están correctamente puestas.

#### 3. El historial residual no expone secretos reales
`public/` no se versiona desde **VUL-14** (`ac8b4ee0`, v2.2.9). Los 14 commits previos (`82b86949` → `ac8b4ee0`) aún contienen el bundle del proyecto de **desarrollo** (`bim-project-caf37`), pero su contenido es el material público-por-diseño ya descrito. El único residuo que **no** es público por diseño son dos **IPs de LAN doméstica** (`192.168.x`, `172.x`) — fuga de reconocimiento de impacto mínimo. No hay *secret keys* server-side, service accounts ni `databaseURL` sensibles en ese historial.

#### Decisión
- **Sin corrección de código** (no hay nada en `src/` que cambiar).
- **Sin rotación de claves** (rotar claves públicas no aporta valor).
- **Sin purga de historial** (reescribir SHAs con `git filter-repo`/BFG tiene un costo alto — rompe clones, fuerza push — para un riesgo bajo, dado que el contenido es público por diseño).
- **Mitigación efectiva ya aplicada por el responsable:** App Check enforced + reCAPTCHA restringido por dominio. Se recomienda mantener además la restricción de la `apiKey` por referrer HTTP en Google Cloud Console como defensa en profundidad.

---

### ✅ SEC-09 — Whitelist client-side / Reglas de RTDB / rate limiting

**Severidad:** 🟡 Media
**Versión:** `v2.3.9` → `v2.4.0`

Este hallazgo agrupaba tres sub-temas con tratamiento distinto. Tras análisis con el responsable, se resolvió así:

#### A) Autorización por whitelist client-side — documentada como UX, no seguridad
Los *guards* (`isAccessAllowed`, `sessionStartedControl`) y la consulta de `/allowed_users/` se ejecutan en el cliente, por lo que son **inherentemente eludibles**. Convertirlos en server-side exigiría un backend (Cloud Functions), rompiendo la filosofía client-only del framework. Es un caso de **responsabilidad compartida** (cubierta por la licencia). Se documentó explícitamente —en el README del núcleo y en la página de documentación `core`— que los guards son una capa de UX/conveniencia y que la frontera de seguridad real son las Security Rules del proyecto del propio desarrollador.

#### B) Reglas de Seguridad no versionadas — plantilla recomendativa documentada (sin desplegar)
Se decidió **no versionar un `database.rules.json` activo** en el framework: referenciarlo en `firebase.json` provocaría que el `deploy` del desarrollador **sobrescribiera sus propias reglas** (mismo principio de "no pisar la configuración del usuario" aplicado en SEC-01). En su lugar se publicó una **plantilla recomendativa *deny-by-default*** en dos lugares:

- **`src/_main/README.md`**: plantilla JSON completa (copiable) + explicación de cada regla + advertencia de autorización client-side.
- **Página de documentación `core`** (`src/pages/core/index.html` + `es-ES.js`): sección "Seguridad: Reglas recomendadas para Realtime Database" con la plantilla renderizada (i18n + DOMPurify), visible para los usuarios del framework.

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

#### C) NEW-05 (rate limiting `loginAttempts`) — eliminado
`loginAttempts` se definía en `bap.config.json`/`constants.js` pero **nunca se usaba**. Como el login es OAuth con Google (`signInWithPopup`) —sin contraseña propia que adivinar— el rate limiting lo gestiona Google/Firebase Auth a nivel de proyecto; un contador client-side era eludible y solo creaba una **falsa expectativa de seguridad**. Se eliminó por completo.

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/_main/README.md` | Sección "Seguridad: Reglas recomendadas para RTDB" (plantilla + advertencia client-side) |
| `src/pages/core/index.html` | Sección de seguridad RTDB con tokens i18n |
| `src/_main/i18n/es-ES.js` | Claves `rtdbSecurityTitle`/`Desc`/`rtdbRulesNote*`/`rtdbRulesExample` |
| `bap.config.json` | Eliminado el bloque `security.loginAttempts` |
| `src/_main/constants.js` | Eliminado `AUTH.LOGIN_ATTEMPTS` (comentario explicativo) |
| `gulpfile.js` | Eliminado el token `%%BAP_LOGIN_ATTEMPTS%%` |
| `test/_main/constants.test.js` | Aserción actualizada (`LOGIN_ATTEMPTS` ahora `undefined`) |

> **Queda fuera de esta corrección** (no es código del framework): la exportación/endurecimiento real de las Security Rules en el proyecto Firebase del desarrollador que implementa BaP, que es su responsabilidad.

---

### ✅ SEC-10 — Bypass de la "Regla de Oro" (`FIREBASE_AVAILABLE=false`)

**Severidad:** 🟡 Media
**Versión:** `v2.3.9` → `v2.4.0`

#### Análisis
La "Regla de Oro" (si `FIREBASE_AVAILABLE` es `false`, los *guards* y la whitelist se omiten) es **intencional**: habilita el desarrollo local y el modo "sitio 100% estático sin Firebase". El escenario crítico —que el bypass llegue a producción con Firebase— **ya está cubierto por dos controles existentes**:

1. **Validación en compilación (VUL-04, `gulpfile.js`)**: `optimize:prod` aborta el build si hay credenciales pero `FIREBASE_AVAILABLE` ≠ `"true"`.
2. **Autodetección en runtime (`constants.js`)**: en un hostname no local con credenciales, Firebase se fuerza a `true`, ignorando el `.env`.

Además, el bypass afecta la **navegación de vistas**, no el **acceso a datos**: el RTDB sigue protegido por las Security Rules (responsabilidad del desarrollador). Sin configuración Firebase válida, las llamadas a la base ni siquiera conectan.

#### Decisión
- **No se aplica *fail-closed***: rompería el modo "sitio estático sin Firebase" (caso de uso legítimo) y duplicaría una protección que ya existe. La propuesta original del audit se descarta tras este análisis.
- **Se documentó el modelo** de la "Regla de Oro" y el **encuadre de alcance del framework** (prototipos/MVP, no solución de seguridad definitiva; quien lo lleve a producción asume el riesgo) en:
  - `README.md` (sección "Alcance y Modelo de Seguridad").
  - `src/_main/README.md` (subsección "La 'Regla de Oro' (bypass de seguridad)").
  - Página de documentación `core` (`index.html` + claves i18n `bypassProdNote`, `mvpScopeTitle`, `mvpScopeNote`).

#### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `README.md` | Sección "Alcance y Modelo de Seguridad" (filosofía MVP + modelo de bypass) |
| `src/_main/README.md` | Subsección técnica de la "Regla de Oro" (build guard + autodetección + alcance) |
| `src/pages/core/index.html` | Nota de producción del bypass + callout de alcance MVP |
| `src/_main/i18n/es-ES.js` | Claves `bypassProdNote`, `mvpScopeTitle`, `mvpScopeNote` |

> **Residuo documentado:** la autodetección de "host local" es una heurística por hostname (frágil por naturaleza), pero sus bordes fallan hacia el lado seguro (habilitar Firebase). No se considera necesario endurecerla dado el alcance MVP del framework y el control duro de build ya existente.

---

## Resumen de Verificación

| Verificación | Resultado |
|--------------|-----------|
| Suite de pruebas (Vitest) | ✅ 214/214 tests pasan |
| Build de producción (`npm run optimize`) | ✅ Completa sin errores |
| DOMPurify vendored copiado al bundle | ✅ `public/_main/vendor/purify.es.mjs` |
| Import compilado apunta a `./vendor/purify.es.mjs` | ✅ Verificado (post-ofuscación) |
| Referencias a CDN externo (`jsdelivr`) en `public/` | ✅ Ninguna |
| `style=` inline en `bap-svg-image` compilado | ✅ Ninguno (migrado a CSSOM) |
| CSP: `style-src-elem` sin `'unsafe-inline'` + HSTS | ✅ Presentes |
| Versión propagada al bundle | ✅ `v2.4.0` |

---

*Correcciones aplicadas y verificadas sobre el código fuente. La validación dinámica (DAST) y la auditoría de las Firebase Security Rules siguen recomendadas (ver SEC-09 y la auditoría base).*
