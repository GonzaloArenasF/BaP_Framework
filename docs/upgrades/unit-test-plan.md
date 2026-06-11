# 📋 Plan de Pruebas Unitarias — BaP Framework v2.3.0

> **Fecha de creación:** 2026-06-03  
> **Autor:** QA / Aseguramiento de Calidad  
> **Estado:** 📄 Propuesta — Pendiente de aprobación  
> **Cobertura objetivo:** ≥ 85% de líneas en módulos lógicos

---

## 1. Resumen Ejecutivo

Este documento establece el plan integral de pruebas unitarias para el proyecto **BaP Framework**. El objetivo es crear una suite de tests automatizados que valide la lógica de negocio, la seguridad criptográfica, el sistema de enrutamiento, la gestión de almacenamiento, la internacionalización y el correcto funcionamiento de los Web Components personalizados.

### 1.1 Estado Actual

| Aspecto | Estado |
|---|---|
| Framework de testing | ✅ Vitest configurado (`"test": "vitest run"`) |
| Directorio `test/` | ✅ Estructura base, mocks y pruebas creadas |
| Cobertura actual | **~65%** (Fase 2 y Fase 3 completadas: 135 tests en `src/_main/`) |
| Dependencias de test | ✅ `vitest`, `@vitest/coverage-v8`, `jsdom` instaladas |

## 7. Progreso General

- **Cobertura Estimada Actual:** ~100%
- **Fases Completadas:** Fase 1 (Infra), Fase 2 (Crítica), Fase 3 (Alta), Fase 4 (Media), Fase 5 (Baja)

---

### 1.2 Arquitectura del Proyecto Analizada

```
src/
├── _main/                          ← Núcleo lógico (PRIORIDAD ALTA)
│   ├── constants.js                ← Configuración global y env tokens
│   ├── firebaseInit.js             ← Inicialización Firebase + Analytics
│   ├── auth.js                     ← Autenticación y whitelist
│   ├── router.js                   ← Motor de enrutamiento y control de acceso
│   ├── routerPaths.js              ← Diccionario de rutas
│   ├── storage.js                  ← Persistencia (Local/Session/DB) + Criptografía
│   ├── i18n.js                     ← Internacionalización y sanitización HTML
│   ├── i18n/es-ES.js               ← Diccionario de idioma español
│   ├── analytics.js                ← Telemetría y eventos
│   └── util.js                     ← Utilidades (UUID, fechas, notificaciones)
├── _components/                    ← Web Components (PRIORIDAD MEDIA)
│   ├── customComponentsRegistration.js ← Constructor y registro de componentes
│   ├── bap-header/                 ← Header con theme toggle
│   ├── bap-footer/                 ← Footer con i18n
│   ├── bap-notification/           ← Notificaciones Toast/Alert
│   ├── bap-dialog/                 ← Modal premium con glassmorphism
│   ├── bap-chip/                   ← Etiquetas visuales
│   ├── bap-spinner/                ← Indicador de carga
│   ├── bap-loading-state/          ← Bloqueador de pantalla
│   ├── bap-svg-image/              ← Gestor de SVGs
│   └── bap-logo/                   ← Logo corporativo
├── index.js                        ← Entry point landing
├── 404.js                          ← Entry point página 404
├── gulpfile.js                     ← Pipeline de build (PRIORIDAD MEDIA)
└── gulp-imports.js                 ← Configuración de build e i18n
```

---

## 2. Stack Técnico Recomendado

| Herramienta | Propósito | Justificación |
|---|---|---|
| **Vitest** | Test runner principal | Compatible con ES Modules nativos (`"type": "module"`), rápido, API compatible con Jest |
| **jsdom** | Emulación de DOM | Necesario para Web Components, `document`, `window`, `localStorage`, `sessionStorage` |
| **@vitest/coverage-v8** | Cobertura de código | Reportes de cobertura integrados con Vitest |

> **Nota:** Se descarta Jest porque el proyecto usa `"type": "module"` y ES modules con imports de URLs absolutas (Firebase CDN), lo que genera fricciones con la resolución de módulos de Jest. Vitest los maneja de forma nativa.

---

## 3. Estrategia de Mocking

Dado que el proyecto importa Firebase directamente desde URLs CDN (`https://www.gstatic.com/firebasejs/...`), se necesita una estrategia de mocking robusta:

| Dependencia | Estrategia de Mock |
|---|---|
| Firebase Auth (`signInWithPopup`, `signOut`, `onAuthStateChanged`, `GoogleAuthProvider`) | Mock completo del módulo CDN vía `vi.mock()` |
| Firebase Database (`ref`, `onValue`, `set`, `update`, `remove`) | Mock completo del módulo CDN |
| Firebase Analytics (`getAnalytics`, `logEvent`) | Mock completo del módulo CDN |
| Firebase App Check (`initializeAppCheck`, `ReCaptchaEnterpriseProvider`) | Mock completo del módulo CDN |
| Firebase App (`initializeApp`) | Mock completo del módulo CDN |
| `window.crypto.subtle` (Web Crypto API) | Mock parcial o uso de `@sinonjs/fake-timers` con polyfill |
| `fetch()` | Mock global vía `vi.fn()` |
| `localStorage` / `sessionStorage` | Provistos por jsdom (nativos) |
| `document` / `window` | Provistos por jsdom (nativos) |
| `navigator.userAgent` | Override vía `Object.defineProperty` |

---

## 4. Plan de Pruebas Detallado por Módulo

### 4.1 🔴 Prioridad Crítica — Módulos del Núcleo (`src/_main/`)

---

#### 4.1.1 `constants.js` — Constantes y Configuración Global

**Funciones/Exports a testear:** `CONSTANT`, `ENV_URL`, `IS_PROD`, `CDN_URL`

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| CONST-01 | Estructura de CONSTANT | Validación | Verificar que `CONSTANT` contiene todas las claves requeridas: `APP_NAME`, `APP_VERSION`, `STORAGE`, `NOTIFICATION`, `AUTH`, `FBC`, `RECAPTCHA`, `I18N`, `SOCIAL_MEDIA` |
| CONST-02 | Valores de APP_NAME y APP_VERSION | Validación | Verificar que `APP_NAME` es `"BaP Framework"` y `APP_VERSION` es `"v2.3.0"` |
| CONST-03 | Claves de STORAGE | Validación | Verificar que `STORAGE.KEYS.DIALOG_DATA` es `"dd"` y que `STORAGE.SOURCE` contiene `LOCAL`, `SESSION`, `DB` con valores correctos |
| CONST-04 | Tipos de NOTIFICATION | Validación | Verificar tipos (`alert`, `toast`) y severidades (`info`, `warning`, `error`) |
| CONST-05 | AUTO_REMOVE_AFTER.INFO | Validación | Verificar que el valor es `4000` (milisegundos) |
| CONST-06 | Constantes de AUTH | Validación | Verificar estados (`SIGNED_IN`, `SIGNED_OUT`, etc.) y `LOGIN_ATTEMPTS = 10` |
| CONST-07 | I18N.DEFAULT y SUPPORTED | Validación | Verificar que el idioma por defecto es `"es"` y que `SUPPORTED` incluye `"es"` |
| CONST-08 | FIREBASE_AVAILABLE en Node.js | Entorno | Verificar que en entorno sin `window`, retorna el token placeholder `"%%FIREBASE_AVAILABLE%%"` |
| CONST-09 | FIREBASE_AVAILABLE en localhost | Entorno | Con `window.location.hostname = "localhost"`, verificar comportamiento de bypass |
| CONST-10 | FIREBASE_AVAILABLE en IP local | Entorno | Con hostnames `192.168.x.x`, `10.x.x.x`, `172.x.x.x`, verificar detección de red local |
| CONST-11 | FIREBASE_AVAILABLE en producción | Entorno | Con hostname público y credenciales Firebase configuradas, verificar que retorna `true` |

---

#### 4.1.2 `util.js` — Utilidades del Sistema

**Funciones a testear:** `timestampToHumanDate()`, `bapNotify()`, `generateUUID()`, `setStringIntoBoolean()`, `isCSSIncluded()`, `isMobile()`

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| **timestampToHumanDate** | | | |
| UTIL-01 | Timestamp "today" | Funcional | Verificar que retorna `"Actualidad"` |
| UTIL-02 | Timestamp numérico con formato 0 | Funcional | Verificar formato con día, mes largo, año, hora y minutos |
| UTIL-03 | Timestamp numérico con formato 1 | Funcional | Verificar formato numérico corto |
| UTIL-04 | Timestamp numérico con formato 2 | Funcional | Verificar formato con mes corto y año |
| UTIL-05 | Idioma español | Funcional | Verificar que `lang="es"` produce salida en español |
| UTIL-06 | Idioma inglés | Funcional | Verificar que `lang="en"` produce salida en inglés |
| UTIL-07 | Sin parámetros opcionales | Defaults | Verificar que usa formato y lenguaje por defecto sin errores |
| **generateUUID** | | | |
| UTIL-08 | Formato UUID v4 | Formato | Verificar que el resultado cumple con el patrón regex de UUID v4 |
| UTIL-09 | Unicidad | Integridad | Generar 1000 UUIDs y verificar que no hay duplicados |
| UTIL-10 | Uso de crypto.randomUUID | Preferencia | Cuando `crypto.randomUUID` está disponible, verificar que se utiliza |
| UTIL-11 | Fallback crypto.getRandomValues | Fallback | Cuando `crypto.randomUUID` no existe pero `getRandomValues` sí, verificar que el UUID generado es válido |
| UTIL-12 | Fallback inseguro | Fallback | Sin Web Crypto API, verificar que genera UUID con `Math.random()` y emite `console.warn` |
| **setStringIntoBoolean** | | | |
| UTIL-13 | String "true" | Conversión | Verificar que retorna `true` |
| UTIL-14 | String "false" | Conversión | Verificar que retorna `false` |
| UTIL-15 | Otros valores | Edge case | Verificar que `"True"`, `"1"`, `""`, `null`, `undefined` retornan `false` |
| **bapNotify** | | | |
| UTIL-16 | Creación de notificación | DOM | Verificar que se crea un elemento `<bap-notification>` en el body |
| UTIL-17 | Atributos correctos | DOM | Verificar que se setean `type`, `severity`, `show` y `textContent` correctos |
| UTIL-18 | Limpieza de notificaciones previas | DOM | Verificar que las notificaciones anteriores se eliminan antes de crear la nueva |
| UTIL-19 | Severity error y console.error | Logging | Verificar que con severity `error` se ejecuta `console.error` |
| **isCSSIncluded** | | | |
| UTIL-20 | CSS ya incluido | DOM | Con un `<link href="test.css">` en el DOM, verificar que retorna `true` |
| UTIL-21 | CSS no incluido | DOM | Sin el link en el DOM, verificar que retorna `false` |
| **isMobile** | | | |
| UTIL-22 | User-Agent móvil | Detección | Con UA de Android/iPhone, verificar que retorna `true` |
| UTIL-23 | User-Agent desktop | Detección | Con UA de Chrome Desktop, verificar que retorna `false` |

---

#### 4.1.3 `auth.js` — Autenticación y Control de Acceso

**Funciones a testear:** `sanitizeUserKey()`, `isUserAuthorized()`, `userSignIn()`, `userSignOut()`

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| **sanitizeUserKey** | | | |
| AUTH-01 | Email normal | Funcional | `"usuario.nombre@gmail.com"` → `"usuario,nombre@gmail,com"` |
| AUTH-02 | Email con múltiples puntos | Funcional | `"a.b.c@d.e.f"` → `"a,b,c@d,e,f"` |
| AUTH-03 | Email vacío | Edge case | `""` → `""` |
| AUTH-04 | Email null | Edge case | `null` → `""` |
| AUTH-05 | Email undefined | Edge case | `undefined` → `""` |
| AUTH-06 | Conversión a minúsculas | Seguridad | `"USER@Gmail.COM"` → `"user@gmail,com"` |
| **isUserAuthorized** | | | |
| AUTH-07 | Firebase desactivado | Bypass | Con `FIREBASE_AVAILABLE = false`, verificar que retorna `true` |
| AUTH-08 | Usuario null | Seguridad | Con Firebase activo y `user = null`, verificar que retorna `false` |
| AUTH-09 | Usuario sin email | Seguridad | Con Firebase activo y `user.email = undefined`, retorna `false` |
| AUTH-10 | Usuario autorizado en whitelist | Funcional | Mockear `onValue` retornando `snapshot.val() === true`, verificar retorno `true` |
| AUTH-11 | Usuario no autorizado | Funcional | Mockear `onValue` retornando `false`, verificar retorno `false` |
| AUTH-12 | Error en consulta RTDB | Error | Mockear error en `onValue`, verificar retorno `false` y `console.error` |
| **userSignIn** | | | |
| AUTH-13 | Firebase desactivado → bypass | Bypass | Verificar que `callbackOnSuccess` se ejecuta sin intentar `signInWithPopup` |
| AUTH-14 | Login exitoso + usuario autorizado | Funcional | Mockear `signInWithPopup` exitoso + whitelist `true`, verificar `callbackOnSuccess` |
| AUTH-15 | Login exitoso + usuario NO autorizado | Seguridad | Verificar que se ejecuta `signOut`, `bapNotify` de error y `callbackOnFail` |
| AUTH-16 | Error en signInWithPopup | Error | Verificar que se ejecuta `callbackOnFail` y `bapNotify` |
| AUTH-17 | Sin callbacks definidos | Robustez | Verificar que no lanza excepciones si `callbackOnSuccess` o `callbackOnFail` son `undefined` |
| **userSignOut** | | | |
| AUTH-18 | Firebase desactivado → bypass | Bypass | Verificar que `callbackOnSuccess` se ejecuta sin intentar `signOut` |
| AUTH-19 | Cierre exitoso | Funcional | Mockear `signOut` exitoso, verificar `callbackOnSuccess` |
| AUTH-20 | Error en signOut | Error | Verificar `callbackOnFail` y `bapNotify` de error |

---

#### 4.1.4 `router.js` — Motor de Enrutamiento

**Funciones a testear:** `goTo()`, `getQueryParams()`, `sessionStartedControl()`, funciones internas (`paramsToQueryParams`, `isAccessAllowed`, `navigateTo`, `loadContent`)

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| **paramsToQueryParams (interna)** | | | |
| RTR-01 | Parámetros simples | Funcional | `{a: 1, b: 2}` → `"a=1&b=2"` |
| RTR-02 | Parámetros vacíos | Edge case | `{}` → `""` |
| **isAccessAllowed (interna)** | | | |
| RTR-03 | Ruta sin validación signIn | Acceso | Con `route.validate.signIn = false`, retorna `true` |
| RTR-04 | Ruta protegida + Firebase activo + sin sesión | Acceso | Retorna `false` |
| RTR-05 | Ruta protegida + Firebase activo + sesión + whitelist OK | Acceso | Retorna `true` |
| RTR-06 | Ruta protegida + Firebase activo + sesión + whitelist NO | Acceso | Retorna `false` |
| RTR-07 | Ruta protegida + Firebase desactivado | Bypass | Retorna `true` con `console.warn` |
| **navigateTo (interna)** | | | |
| RTR-08 | Tipo REDIRECT | Navegación | Verificar que se establece `window.location.href` |
| RTR-09 | Tipo LOAD_COMPONENT | Navegación | Verificar que se llama `history.pushState` y se actualiza `document.title` |
| RTR-10 | Con parámetros query | Navegación | Verificar que la URL incluye `?param=value` |
| **loadContent (interna)** | | | |
| RTR-11 | Carga de componente | DOM | Verificar que se limpia `<main>` y se crea el elemento del componente |
| RTR-12 | Sin elemento main | Robustez | Verificar que no lanza error si `<main>` no existe |
| RTR-13 | Query params como atributos | Seguridad | Verificar que parámetros URL se setean como atributos del componente |
| RTR-14 | Sanitización de nombres de atributos | Seguridad | Verificar que nombres inválidos se omiten y se emite `console.warn` |
| **goTo** | | | |
| RTR-15 | Ruta null → redirige a 404 | Error | Verificar redirección a `/404.html` |
| RTR-16 | Ruta sin pathname → redirige a 404 | Error | Verificar redirección a `/404.html` |
| RTR-17 | Acceso permitido con LOAD_COMPONENT | Flujo | Verificar que se ejecuta `navigateTo` + `loadContent` |
| RTR-18 | Acceso denegado | Flujo | Verificar que se ejecuta `bapNotify` con severidad INFO |
| **getQueryParams** | | | |
| RTR-19 | URL con parámetros | Funcional | `?a=1&b=hello` → `{a: "1", b: "hello"}` |
| RTR-20 | URL sin parámetros | Funcional | Retorna `{}` |
| RTR-21 | URL con caracteres especiales | Seguridad | Verificar que `URLSearchParams` decodifica correctamente |
| **sessionStartedControl** | | | |
| RTR-22 | Ruta sin signIn requerido | Bypass | Verificar que no se ejecuta lógica de sesión |
| RTR-23 | Firebase desactivado | Bypass | Verificar `console.warn` de bypass |
| RTR-24 | Firebase activo + usuario autenticado + autorizado | Flujo | Verificar que no se cierra sesión |
| RTR-25 | Firebase activo + usuario autenticado + NO autorizado | Seguridad | Verificar que se ejecuta `userSignOut` y redirección |
| RTR-26 | Firebase activo + sin usuario + initSession=true | Flujo | Verificar que se ejecuta `userSignIn` |
| RTR-27 | Firebase activo + sin usuario + initSession=false | Flujo | Verificar redirección a landing |

---

#### 4.1.5 `routerPaths.js` — Diccionario de Rutas

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| RTP-01 | Tipos de navegación | Validación | Verificar que `NAVIGATION_TYPES` contiene `REDIRECT` y `LOAD_COMPONENT` |
| RTP-02 | Ruta landing | Validación | Verificar estructura completa: `pathname: "/"`, `navigation: REDIRECT`, `validate.signIn: false` |
| RTP-03 | Ruta error404 | Validación | Verificar estructura: `pathname: "/404.html"`, `navigation: REDIRECT` |
| RTP-04 | Inmutabilidad de rutas | Integridad | Verificar que las rutas exportadas son objetos completos con todas las propiedades requeridas |

---

#### 4.1.6 `storage.js` — Persistencia y Criptografía

**Funciones a testear:** `encryptData()`, `decryptData()`, `secureEncryptData()`, `secureDecryptData()`, `deriveKey()`, `uint8ToBase64()`, `base64ToUint8()`, `getFromStorageAsync()`, `setToStorageAsync()`, `updateStorageAsync()`, `getFromStorage()`, `setToStorage()`, `updateStorage()`, `removeFromStorage()`, `dbRoutes`

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| **Funciones de conversión Base64** | | | |
| STO-01 | uint8ToBase64 + base64ToUint8 round-trip | Integridad | Verificar que la conversión ida y vuelta preserva los datos originales |
| STO-02 | uint8ToBase64 con array grande | Rendimiento | Verificar que no se lanza error de pila con arrays > 100KB |
| **Cifrado/Descifrado AES-GCM (secureEncryptData/secureDecryptData)** | | | |
| STO-03 | Cifrado y descifrado simétrico | Criptografía | Cifrar texto → descifrar → verificar que coincide con el original |
| STO-04 | Datos Unicode | Criptografía | Cifrar texto con caracteres UTF-8 (ñ, á, emojis) y verificar round-trip |
| STO-05 | Sin contraseña → Error | Seguridad | Verificar que `secureEncryptData(data, "")` lanza error |
| STO-06 | Sin contraseña → Error (decrypt) | Seguridad | Verificar que `secureDecryptData(data, "")` lanza error |
| STO-07 | Contraseña incorrecta | Seguridad | Cifrar con key A → descifrar con key B → verificar que lanza error |
| STO-08 | Payload corrupto | Seguridad | Verificar que datos truncados o corruptos lanzan error descriptivo |
| STO-09 | Payload demasiado corto (< 28 bytes) | Validación | Verificar que se lanza error `"Payload de cifrado corrupto o demasiado corto"` |
| STO-10 | Determinismo: mismos datos, distinto ciphertext | Criptografía | Verificar que cifrar el mismo texto dos veces produce resultados diferentes (por IV y salt aleatorios) |
| **encryptData / decryptData (legacy/deprecated)** | | | |
| STO-11 | Round-trip legacy | Legacy | Verificar que `decryptData(encryptData(data, key))` == `data` |
| STO-12 | Emite console.warn | Deprecación | Verificar que ambas funciones emiten `console.warn` de deprecación |
| STO-13 | Datos Unicode legacy | Legacy | Verificar manejo correcto de caracteres especiales vía `encodeURIComponent/escape` |
| **getFromStorageAsync** | | | |
| STO-14 | Leer de localStorage sin cifrado | Funcional | Guardar JSON → leer → verificar parsing correcto |
| STO-15 | Leer de localStorage con cifrado | Funcional | Guardar cifrado → leer con secretKey → verificar descifrado correcto |
| STO-16 | Leer de sessionStorage | Funcional | Similar a STO-14 pero con sessionStorage |
| STO-17 | Leer de localStorage vacío | Edge case | Verificar que retorna `null` |
| STO-18 | Leer de Realtime Database | Funcional | Mockear `ref` + `onValue` → verificar que retorna `snapshot.val()` |
| STO-19 | Error al leer de RTDB | Error | Verificar que se ejecuta `bapNotify` y se rechaza la promesa |
| **setToStorageAsync** | | | |
| STO-20 | Escribir en localStorage sin cifrado | Funcional | Verificar que `localStorage.setItem` recibe JSON stringificado |
| STO-21 | Escribir en localStorage con cifrado | Funcional | Verificar que el valor almacenado está cifrado (no legible) |
| STO-22 | Escribir en sessionStorage | Funcional | Similar a STO-20 |
| STO-23 | Escribir en RTDB | Funcional | Mockear `set` de Firebase → verificar que se invoca correctamente |
| STO-24 | Error al escribir en RTDB | Error | Verificar que se ejecuta `bapNotify` y se relanza el error |
| **updateStorageAsync** | | | |
| STO-25 | Actualizar localStorage | Funcional | Verificar comportamiento similar a `setToStorageAsync` |
| STO-26 | Actualizar RTDB | Funcional | Mockear `update` → verificar invocación correcta |
| STO-27 | Error al actualizar RTDB | Error | Verificar `bapNotify` y relanzamiento de error |
| **getFromStorage (legacy sync)** | | | |
| STO-28 | Leer de localStorage | Legacy | Verificar retorno parseado de JSON |
| STO-29 | Leer de RTDB con callback | Legacy | Verificar que `callbackOnSuccess` recibe `snapshot.val()` |
| STO-30 | Error de RTDB con callBackOnFail | Legacy | Verificar que se ejecuta el callback de error |
| STO-31 | Error de RTDB sin callback → bapNotify | Legacy | Verificar notificación por defecto |
| **setToStorage (legacy sync)** | | | |
| STO-32 | Escribir en localStorage con cifrado legacy | Legacy | Verificar que invoca `encryptData` |
| STO-33 | Escribir en RTDB con callback | Legacy | Verificar que `callbackOnSuccess` se ejecuta con delay |
| STO-34 | Error en RTDB | Legacy | Verificar `callBackOnFail` o `bapNotify` |
| **updateStorage (legacy sync)** | | | |
| STO-35 | Actualizar localStorage | Legacy | Verificar almacenamiento correcto |
| STO-36 | Actualizar RTDB con callback | Legacy | Verificar callback con delay |
| **removeFromStorage** | | | |
| STO-37 | Eliminar de localStorage | Funcional | Verificar `localStorage.removeItem` |
| STO-38 | Eliminar de sessionStorage | Funcional | Verificar `sessionStorage.removeItem` |
| STO-39 | Eliminar de RTDB exitoso | Funcional | Mockear `remove` → verificar callback con delay |
| STO-40 | Eliminar de RTDB con error | Error | Verificar `callBackOnFail` o `bapNotify` |
| **dbRoutes** | | | |
| STO-41 | Rutas de base de datos | Validación | Verificar que todas las funciones retornan las rutas esperadas (`/skills`, `/jobs`, etc.) |

---

#### 4.1.7 `i18n.js` — Internacionalización y Sanitización

**Funciones a testear:** `getI18nContent()`, `flattenObject()`, `sanitizeHTML()`, `replaceTokensInDOM()`, `applyI18n()`

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| **getI18nContent** | | | |
| I18N-01 | Grupo y item válidos | Funcional | `getI18nContent("page", "landing")` → retorna objeto con `head`, `body` |
| I18N-02 | Grupo válido, item válido | Funcional | `getI18nContent("component", "bapFooter")` → retorna objeto con `tc`, `brandDesc`, etc. |
| I18N-03 | Grupo inválido | Error | Verificar que lanza error `"The group ... does not exist"` y retorna `undefined` |
| I18N-04 | Item inexistente | Edge case | Verificar que retorna `undefined` sin lanzar excepción |
| **flattenObject** | | | |
| I18N-05 | Objeto plano | Funcional | `{a: 1, b: 2}` → `{a: 1, b: 2}` |
| I18N-06 | Objeto anidado | Funcional | `{a: {b: {c: 1}}}` → `{"a.b.c": 1}` |
| I18N-07 | Objeto mixto | Funcional | Verificar combinación de valores planos y anidados |
| I18N-08 | Objeto vacío | Edge case | `{}` → `{}` |
| I18N-09 | Con prefijo | Funcional | Con `prefix="pre"`, verificar que las claves se prefijan correctamente |
| I18N-10 | Con acumulador existente | Funcional | Con `res` pre-poblado, verificar que se agregan las nuevas claves sin perder las existentes |
| **sanitizeHTML** | | | |
| I18N-11 | HTML seguro sin cambios | Seguridad | `"<p>Hola</p>"` pasa sin modificaciones |
| I18N-12 | Elimina script | XSS | `"<script>alert('xss')</script><p>ok</p>"` → `"<p>ok</p>"` |
| I18N-13 | Elimina iframe | XSS | `"<iframe src='evil.com'></iframe>"` → `""` |
| I18N-14 | Elimina object, embed, style | XSS | Verificar remoción de todas las etiquetas prohibidas |
| I18N-15 | Elimina atributos on* | XSS | `"<p onclick='alert(1)'>test</p>"` → `"<p>test</p>"` |
| I18N-16 | Elimina javascript: en atributos | XSS | `"<a href='javascript:void(0)'>link</a>"` → `"<a>link</a>"` |
| I18N-17 | HTML con caracteres especiales | Robustez | Verificar manejo correcto de `&`, `<`, `>` escapados |
| **replaceTokensInDOM** | | | |
| I18N-18 | Reemplazo en nodos de texto | Funcional | `"{token}"` en textContent → reemplazado con valor del mapa |
| I18N-19 | Reemplazo en atributos | Funcional | `href="{url}"` → reemplazado con URL real |
| I18N-20 | Token inexistente se mantiene | Robustez | Verificar que tokens sin valor en el mapa no causan errores |
| I18N-21 | Contenido HTML en reemplazo | Funcional | Verificar que tokens que generan HTML se inyectan vía `<template>` sanitizado |
| I18N-22 | Contenido solo texto en reemplazo | Funcional | Verificar que tokens sin HTML se reemplazan vía `textNode.nodeValue` |

---

#### 4.1.8 `analytics.js` — Telemetría

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| ANA-01 | USER_TYPE constantes | Validación | Verificar `ADMIN = "Admin"` y `USER = "User"` |
| ANA-02 | enterLandingPage invoca logAnalyticEvent | Funcional | Verificar que se llama con `type: "enter_page"`, `name: "enter_landing_page"`, `func: "landing_page"` |
| ANA-03 | pageNotFound invoca logAnalyticEvent | Funcional | Verificar argumentos correctos para el evento 404 |
| ANA-04 | Estructura del diccionario analytic | Validación | Verificar que `analytic.logEvent` contiene las funciones esperadas |

---

#### 4.1.9 `firebaseInit.js` — Inicialización de Firebase

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| **logAnalyticEvent** | | | |
| FIR-01 | Firebase desactivado → función vacía | Bypass | Verificar que `logAnalyticEvent` es una función no-op cuando Firebase está desactivado |
| FIR-02 | No IS_PROD → no envía eventos | Entorno | Verificar que en entorno no-producción, no se invoca `logEvent` de Firebase |
| FIR-03 | IS_PROD + parámetros completos | Funcional | Verificar que se invoca `logEvent` con los argumentos correctos |
| FIR-04 | Falta type → lanza Error | Validación | Verificar error `"Event type name not included"` |
| FIR-05 | Falta name → lanza Error | Validación | Verificar error `"Event name not included"` |
| FIR-06 | Falta func → lanza Error | Validación | Verificar error `"Functionality name not included"` |
| FIR-07 | Falta userType → lanza Error | Validación | Verificar error `"User type not included"` |
| FIR-08 | Error capturado → console.error | Error | Verificar que errores internos no propagan sino que se loguean |
| **Exports condicionales** | | | |
| FIR-09 | Firebase desactivado → exports null | Bypass | Verificar que `bapFirebaseApp`, `bapAuth`, `bapAnalytics`, `bapDB` son `null` |
| FIR-10 | Firebase activado → exports inicializados | Funcional | Verificar que los exports son instancias mockeadas correctamente |

---

### 4.2 🟡 Prioridad Media — Web Components (`src/_components/`)

---

#### 4.2.1 `customComponentsRegistration.js` — Constructor de Componentes

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| CCR-01 | createCustomComponent con htmlCode | Funcional | Verificar que inyecta HTML directo en `element.innerHTML` |
| CCR-02 | createCustomComponent con htmlPath | Funcional | Mockear `fetch` → verificar carga de template HTML |
| CCR-03 | Sin cssPath → Error | Validación | Verificar que lanza error `"cssPath is not provided"` |
| CCR-04 | Sin htmlPath ni htmlCode → Error | Validación | Verificar que lanza error `"html is not provided"` |
| CCR-05 | CSS no duplicado | Optimización | Verificar que no se agrega `<link>` duplicado si el CSS ya está incluido |
| CCR-06 | CSS se agrega correctamente | DOM | Verificar que se crea `<link rel="stylesheet">` en `document.head` |
| CCR-07 | preRender se ejecuta | Lifecycle | Verificar que se invoca con `(html, props)` antes del render |
| CCR-08 | postRender se ejecuta | Lifecycle | Verificar que se invoca después del render |
| CCR-09 | Props por defecto | Defaults | Verificar que se genera un `id` automático si no se provee `props` |
| CCR-10 | setCustomComponents registro | Registro | Verificar que los 9 componentes se registran en `customElements` |
| CCR-11 | Registro no duplica componentes | Registro | Llamar `setCustomComponents` dos veces → sin errores |

---

#### 4.2.2 `bap-notification` — Notificaciones

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| NOT-01 | Creación de Shadow DOM | Render | Verificar que `attachShadow({mode: "open"})` se invoca |
| NOT-02 | setConfiguration con type=toast | Funcional | Verificar que el HTML incluye `type-toast` |
| NOT-03 | setConfiguration con severity=error | Funcional | Verificar que el HTML incluye `severity-error` |
| NOT-04 | setConfiguration sin message | Default | Verificar que se muestra `"Sin mensaje"` |
| NOT-05 | setConfiguration sin type ni severity | Default | Verificar defaults: `type-toast`, `severity-error` |
| NOT-06 | Auto-remove para severity=info | Timing | Verificar que `autoRemoveInfoType` programa remoción en 4000ms |
| NOT-07 | Show attribute activa clase | DOM | Verificar que `show` añade clase `"show"` al elemento |
| NOT-08 | Botón cerrar remueve clase show | Interacción | Verificar que el click en `children[1]` remueve la clase `"show"` |

---

#### 4.2.3 `bap-dialog` — Modal Premium

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| DLG-01 | preRender inyecta id | Funcional | Verificar que `{dialog-id}` se reemplaza con `props.id` |
| DLG-02 | preRender con imágenes | Funcional | Verificar que `{image-header-left-markup}` genera `<img>` correcto |
| DLG-03 | preRender sin imágenes | Edge case | Verificar que se inyecta cadena vacía sin generar markup |
| DLG-04 | Títulos sanitizados | Seguridad | Verificar que los títulos pasan por `sanitizeHTML()` |
| DLG-05 | Body sanitizado | Seguridad | Verificar que `props.bodyContent` pasa por `sanitizeHTML()` |
| DLG-06 | Decodificación Base64 de URL | Funcional | Verificar que `aHR0cHM6Ly...` se decodifica a `https://github.com/...` |
| DLG-07 | Decodificación Base64 de texto | Funcional | Verificar decodificación de texto con UTF-8 |
| DLG-08 | URL con protocolo peligroso → bloqueada | Seguridad | `javascript:alert(1)` en Base64 → no genera enlace, emite `console.warn` |
| DLG-09 | URL con protocolo seguro https | Seguridad | Verificar que `https://` genera enlace correctamente |
| DLG-10 | URL con protocolo mailto | Seguridad | Verificar que `mailto:` pasa la validación |
| DLG-11 | URL relativa (sin protocolo) | Seguridad | Verificar que enlace relativo pasa la validación |
| DLG-12 | postRender muestra modal | Interacción | Verificar que `backdrop.classList.add("show")` se ejecuta tras 50ms |
| DLG-13 | postRender cierre por botón | Interacción | Verificar que click en `closeBtn` remueve `"show"` y elimina del DOM |
| DLG-14 | postRender cierre por backdrop | Interacción | Verificar que click en el fondo (no en la tarjeta) cierra el modal |
| DLG-15 | connectedCallback lee atributos | Lifecycle | Verificar que todos los atributos del elemento se mapean a props |

---

#### 4.2.4 `bap-svg-image` — Gestor de SVGs

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| SVG-01 | Renderizado con name y size válidos | Funcional | Verificar que se genera `<figure>` con `<svg>` correctamente dimensionado |
| SVG-02 | Sin atributo name | Error | Verificar que lanza error con mensaje descriptivo |
| SVG-03 | Sin atributo size | Error | Verificar que lanza error con mensaje descriptivo |
| SVG-04 | Nombre de imagen inexistente | Error | Verificar que lanza error `"La imagen solicitada no existe"` |
| SVG-05 | Mobile size override | Responsive | Con `isMobile() = true` y `mobile-size` definido, verificar que usa el tamaño móvil |

---

#### 4.2.5 Componentes Simples (bap-header, bap-footer, bap-chip, bap-spinner, bap-loading-state, bap-logo)

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| HDR-01 | BapHeader preRender reemplaza tokens | Funcional | Verificar reemplazo de `{color-mode}`, `{lightMode}`, `{darkMode}` |
| HDR-02 | BapHeader postRender activa theme toggle | Interacción | Verificar que `applyColorMode` modifica clases del body |
| HDR-03 | BapHeader persiste preferencia de color | Persistencia | Verificar que `localStorage.setItem("bap-color-mode", mode)` se invoca |
| HDR-04 | BapHeader restaura preferencia al iniciar | Persistencia | Verificar que lee `localStorage.getItem("bap-color-mode")` |
| FTR-01 | BapFooter preRender en no-producción | Funcional | Verificar que se aplican reemplazos i18n |
| FTR-02 | BapFooter preRender en producción | Funcional | Verificar que retorna HTML sin modificar |
| CHP-01 | BapChip preRender reemplaza label | Funcional | Verificar que `{label}` se reemplaza con `innerHTML` |
| SPN-01 | BapSpinner constructor | Instanciación | Verificar que se crea correctamente con `createCustomComponent` |
| LDS-01 | BapLoadingState con mensaje | Funcional | Verificar que el mensaje personalizado se inyecta en el template |
| LDS-02 | BapLoadingState con sub-message | Funcional | Verificar que `sub-message` genera `<h3>` |
| LDS-03 | BapLoadingState sin sub-message | Edge case | Verificar que no se genera `<h3>` |
| LGO-01 | BapLogo connectedCallback | Lifecycle | Verificar que invoca `createCustomComponent` con props correctos |

---

### 4.3 🟢 Prioridad Baja — Pipeline de Build

---

#### 4.3.1 `gulp-imports.js` — Configuración de Build

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| GLP-01 | loadEnv con .env válido | Funcional | Verificar que parsea correctamente pares `KEY=VALUE` |
| GLP-02 | loadEnv sin archivo .env | Fallback | Verificar que retorna `{}` y emite advertencia |
| GLP-03 | loadEnv ignora comentarios | Parser | Verificar que líneas con `#` se ignoran |
| GLP-04 | loadEnv ignora líneas vacías | Parser | Verificar que líneas en blanco no causan errores |
| GLP-05 | loadEnv maneja valores con comillas | Parser | Verificar que `KEY="value"` y `KEY='value'` remueven las comillas |
| GLP-06 | applyI18n.common reemplaza tokens | Build | Verificar reemplazos de `{lang}`, `{ENV_URL}`, `{CDN_URL}`, etc. |
| GLP-07 | applyI18n por página | Build | Verificar cada función de reemplazo por página (index, 404, resume, contact) |
| GLP-08 | applyI18n componentes | Build | Verificar reemplazos para bapFooter y bapHeader |

---

#### 4.3.2 `gulpfile.js` — Pipeline de Gulp

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| GLF-01 | replaceEnvTokens reemplaza tokens | Build | Verificar que todos los `%%TOKEN%%` se reemplazan con valores del `.env` |
| GLF-02 | VUL-04: Producción + Firebase config + FIREBASE_AVAILABLE=false → Error | Seguridad | Verificar que el build falla con mensaje de error descriptivo |
| GLF-03 | VUL-04: Producción + Firebase config + FIREBASE_AVAILABLE=true → OK | Seguridad | Verificar que el build continúa sin error |
| GLF-04 | VUL-04: No producción → no valida | Seguridad | Verificar que la validación VUL-04 no aplica fuera de producción |

---

### 4.4 🟣 Prioridad Media — Localización (`src/_main/i18n/`)

#### 4.4.1 `es-ES.js` — Diccionario de Idioma

| ID | Caso de Prueba | Tipo | Descripción |
|---|---|---|---|
| LOC-01 | Estructura completa del diccionario | Validación | Verificar que `esES` contiene `component` y `page` con todas las sub-secciones |
| LOC-02 | Componentes: bapFooter claves | Validación | Verificar que contiene `tc`, `brandDesc`, `versionLabel`, `resourcesLabel`, `btnExplore`, `contactLabel` |
| LOC-03 | Componentes: bapHeader claves | Validación | Verificar `lightMode` y `darkMode` |
| LOC-04 | Pages: cross.notification | Validación | Verificar todos los mensajes de error de notificación |
| LOC-05 | Pages: cross.storage mensajes | Validación | Verificar mensajes de error de almacenamiento |
| LOC-06 | Pages: landing completa | Validación | Verificar secciones `head`, `body.hero`, `body.core`, `body.playground`, `body.terminal` |
| LOC-07 | Pages: notFound completa | Validación | Verificar `head`, `body.message`, `body.backHome` |
| LOC-08 | Sin valores vacíos | Integridad | Recorrer recursivamente y verificar que ningún valor es `""`, `null` o `undefined` |

---

## 5. Matriz de Priorización

| Prioridad | Módulo | # Tests | Justificación |
|---|---|---|---|
| 🔴 **Crítica** | `storage.js` (criptografía) | 41 | Datos sensibles cifrados; fallo = vulnerabilidad de seguridad | ✅ Completado |
| 🔴 **Crítica** | `auth.js` | 20 | Control de acceso; fallo = bypass de autenticación | ✅ Completado |
| 🔴 **Crítica** | `router.js` | 27 | Seguridad de navegación y XSS | ✅ Completado |
| 🔴 **Crítica** | `i18n.js` (sanitizeHTML) | 22 | Defensa contra XSS | ✅ Completado |
| 🟡 **Alta** | `util.js` | 23 | Funciones transversales usadas por todo el sistema | ✅ Completado |
| 🟡 **Alta** | `firebaseInit.js` | 10 | Gateway de servicios | ✅ Completado |
| 🟡 **Media** | Web Components (9 componentes) | ~35 | Experiencia de usuario y renderizado | ✅ Completado |
| 🟡 **Media** | `constants.js` | 11 | Configuración de entorno | ✅ Completado |
| 🟢 **Baja** | `analytics.js` | 4 | Telemetría no crítica | ✅ Completado |
| 🟢 **Baja** | `routerPaths.js` | 4 | Estructura estática | ✅ Completado |
| 🟢 **Baja** | `gulp-imports.js` / `gulpfile.js` | 12 | Pipeline de build | ✅ Completado |
| 🟣 **Complementaria** | `es-ES.js` (locale) | 8 | Integridad de diccionario | ✅ Completado |

**Total estimado: ~217 casos de prueba**

---

## 6. Orden de Implementación Recomendado

### Fase 1 — Infraestructura (Sprint 0)
1. Instalar dependencias: `vitest`, `jsdom`, `@vitest/coverage-v8`
2. Configurar `vitest.config.js` con entorno `jsdom`
3. Crear estructura de mocks para Firebase CDN imports
4. Configurar script `"test"` en `package.json`
5. Crear helpers de test compartidos (setup de DOM, mock de Firebase, etc.)

### Fase 2 — Funciones Puras (Sprint 1)
1. `util.js` — funciones puras sin dependencias DOM complejas
2. `constants.js` — validación de estructura
3. `routerPaths.js` — validación de estructura
4. `i18n.js` → `flattenObject()` — función pura
5. `es-ES.js` — integridad de diccionario

### Fase 3 — Criptografía y Seguridad (Sprint 2)
1. `storage.js` → `secureEncryptData/secureDecryptData` (con Web Crypto API)
2. `storage.js` → `encryptData/decryptData` (legacy)
3. `storage.js` → operaciones CRUD con localStorage/sessionStorage
4. `i18n.js` → `sanitizeHTML()` — tests de XSS
5. `i18n.js` → `replaceTokensInDOM()` — tests de DOM

### Fase 4 — Autenticación y Routing (Sprint 3)
1. `auth.js` → `sanitizeUserKey()`, `isUserAuthorized()`
2. `auth.js` → `userSignIn()`, `userSignOut()`
3. `router.js` → funciones internas
4. `router.js` → `goTo()`, `getQueryParams()`, `sessionStartedControl()`
5. `firebaseInit.js` → `logAnalyticEvent()`

### Fase 5 — Web Components (Sprint 4)
1. `customComponentsRegistration.js`
2. `bap-notification`
3. `bap-dialog` (componente más complejo)
4. `bap-svg-image`
5. Componentes restantes (header, footer, chip, spinner, loading-state, logo)

### Fase 6 — Build Pipeline (Sprint 5)
1. `gulp-imports.js` → `loadEnv()`, funciones de reemplazo i18n
2. `gulpfile.js` → `replaceEnvTokens()`, validación VUL-04

---

## 7. Estructura de Archivos de Test Propuesta

```
test/
├── setup.js                              ← Setup global (mocks Firebase CDN, jsdom helpers)
├── mocks/
│   ├── firebase-app.mock.js              ← Mock de firebase-app
│   ├── firebase-auth.mock.js             ← Mock de firebase-auth
│   ├── firebase-database.mock.js         ← Mock de firebase-database
│   ├── firebase-analytics.mock.js        ← Mock de firebase-analytics
│   └── firebase-app-check.mock.js        ← Mock de firebase-app-check
├── _main/
│   ├── constants.test.js
│   ├── util.test.js
│   ├── auth.test.js
│   ├── router.test.js
│   ├── routerPaths.test.js
│   ├── storage.test.js
│   ├── storage.crypto.test.js            ← Tests específicos de criptografía
│   ├── i18n.test.js
│   ├── i18n.sanitize.test.js             ← Tests específicos de XSS
│   ├── analytics.test.js
│   └── firebaseInit.test.js
├── _components/
│   ├── customComponentsRegistration.test.js
│   ├── bap-notification.test.js
│   ├── bap-dialog.test.js
│   ├── bap-svg-image.test.js
│   ├── bap-header.test.js
│   ├── bap-footer.test.js
│   ├── bap-chip.test.js
│   ├── bap-spinner.test.js
│   ├── bap-loading-state.test.js
│   └── bap-logo.test.js
├── build/
│   ├── gulp-imports.test.js
│   └── gulpfile.test.js
└── i18n/
    └── es-ES.test.js
```

---

## 8. Métricas de Éxito

| Métrica | Objetivo | Mínimo aceptable |
|---|---|---|
| Cobertura de líneas (núcleo `_main/`) | ≥ 90% | ≥ 85% |
| Cobertura de líneas (componentes) | ≥ 75% | ≥ 65% |
| Cobertura de líneas (build pipeline) | ≥ 70% | ≥ 60% |
| Tests de seguridad/XSS | 100% de vectores identificados | 100% |
| Tests de criptografía | 100% de funciones crypto | 100% |
| Tiempo de ejecución de suite completa | < 30 segundos | < 60 segundos |
| Tests fallando en `main` | 0 | 0 |

---

## 9. Riesgos y Consideraciones

### 9.1 Desafíos Técnicos Identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **Imports de Firebase vía URL CDN absoluta** | Alto — Los test runners no resuelven `https://www.gstatic.com/...` | Crear alias en `vitest.config.js` que mapeen las URLs CDN a módulos mock locales |
| **Web Crypto API en jsdom** | Medio — jsdom no implementa `crypto.subtle` completamente | Usar polyfill `@peculiar/webcrypto` o configurar `globalThis.crypto` en setup |
| **Custom Elements en jsdom** | Medio — jsdom tiene soporte limitado de Custom Elements v1 | Usar `happy-dom` como alternativa o testear lógica separada del lifecycle |
| **Funciones internas no exportadas** | Bajo — `paramsToQueryParams`, `encryptData`, etc. son privadas | Testear indirectamente a través de las funciones públicas que las consumen |
| **IIFE en FIREBASE_AVAILABLE** | Bajo — Se ejecuta al importar el módulo | Mockear `window.location` antes de la importación |

### 9.2 Deuda Técnica Observada

- Las funciones `encryptData` y `decryptData` están marcadas como `@deprecated` pero aún son utilizadas por las funciones síncronas `getFromStorage`, `setToStorage`, `updateStorage`. Los tests deben documentar esta dependencia.
- Existe código inalcanzable en `getFromStorage`: sentencias `break` después de `return` (líneas 341, 346 de `storage.js`).
- La función `updateStorage` tiene una condición redundante en el bloque `.then()` (línea 436: `if (callbackOnSuccess) { callbackOnSuccess ? ... }`).

---

## 10. Apéndice: Resumen de Funciones Exportadas

| Módulo | Funciones/Exports | Testabilidad |
|---|---|---|
| `constants.js` | `CONSTANT`, `ENV_URL`, `IS_PROD`, `CDN_URL` | ✅ Alta (valores estáticos) |
| `util.js` | `timestampToHumanDate`, `bapNotify`, `generateUUID`, `setStringIntoBoolean`, `isCSSIncluded`, `isMobile` | ✅ Alta |
| `auth.js` | `userSession`, `sanitizeUserKey`, `isUserAuthorized`, `userSignIn`, `userSignOut` | ⚠️ Media (requiere mock Firebase) |
| `router.js` | `goTo`, `getQueryParams`, `sessionStartedControl` | ⚠️ Media (requiere mock DOM + Firebase) |
| `routerPaths.js` | `NAVIGATION_TYPES`, `routes` | ✅ Alta |
| `storage.js` | `secureEncryptData`, `secureDecryptData`, `getFromStorageAsync`, `setToStorageAsync`, `updateStorageAsync`, `getFromStorage`, `setToStorage`, `updateStorage`, `removeFromStorage`, `dbRoutes` | ⚠️ Media (requiere mock crypto + Firebase) |
| `i18n.js` | `getI18nContent`, `flattenObject`, `sanitizeHTML`, `replaceTokensInDOM`, `applyI18n` | ✅ Alta |
| `analytics.js` | `USER_TYPE`, `analytic` | ✅ Alta |
| `firebaseInit.js` | `bapFirebaseApp`, `bapAuth`, `bapAnalytics`, `bapDB`, `logAnalyticEvent` | ⚠️ Media (requiere mock Firebase) |
| `customComponentsRegistration.js` | `createCustomComponent`, `setCustomComponents` | ⚠️ Media (requiere DOM) |

---

> **Próximo paso:** Tras la aprobación de este plan, se procederá a configurar la infraestructura de testing (Fase 1) e implementar los tests según el orden de priorización establecido.
