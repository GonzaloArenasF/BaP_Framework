# Núcleo del Framework (Core Engine)

Este directorio alberga los módulos lógicos principales de BaP Framework, actuando como el motor que orquesta el enrutamiento, la autenticación, la internacionalización, la persistencia criptográfica y la telemetría.

> [!IMPORTANT]
> **Antes de implementar `auth.js`/`router.js`:** la validación de whitelist y los *guards* de ruta se ejecutan en el **cliente** — son una capa de UX, **no** seguridad. La autorización real de los datos depende de las **Reglas de Seguridad de Firebase** que configures. Ver [Seguridad: Reglas recomendadas](#seguridad-reglas-recomendadas-para-realtime-database) (abajo) y [`SECURITY.md`](../../SECURITY.md).

## Contexto de los Archivos

Los archivos en `./src/_main/` componen la lógica de control del framework:
- [./src/_main/constants.js](./src/_main/constants.js): Única fuente de verdad para la configuración global. Resuelve `ENV_URL` dinámicamente según `window.location.origin` (previniendo colisiones de puertos por AirPlay en macOS) y almacena marcadores de versión y configuraciones.
- [./src/_main/firebaseInit.js](./src/_main/firebaseInit.js): Gateway de inicialización centralizado para Firebase App, Auth, Database y Analytics.
- [./src/_main/auth.js](./src/_main/auth.js): Gestiona el inicio/cierre de sesión (proveedor Google Identity) y realiza una validación cruzada asíncrona de listas blancas (`/allowed_users/`) en Firebase Realtime Database.
- [./src/_main/routerPaths.js](./src/_main/routerPaths.js): Catálogo estricto de rutas de la aplicación, asociando URLs con vistas y reglas de acceso (si requiere sesión o no).
- [./src/_main/router.js](./src/_main/router.js): El motor de enrutamiento SPA. Evita ataques XSS al crear componentes usando `document.createElement()` en lugar de interpolar strings HTML en `innerHTML`, y valida de forma estricta los query parameters de la URL.
- [./src/_main/storage.js](./src/_main/storage.js): Capa de persistencia. Expone funciones asíncronas seguras que implementan cifrado **AES-GCM de 256 bits** y derivación **PBKDF2** (con 100,000 iteraciones y salt) a través de la **Web Crypto API** del navegador, aislando los datos locales con el `uid` del usuario. Mantiene funciones síncronas básicas con advertencias en consola.
- [./src/_main/i18n.js](./src/_main/i18n.js): Motor de internacionalización. Recorre el DOM de forma eficiente y segura usando un `TreeWalker` nativo para traducir nodos de texto sin romper listeners. Contiene `sanitizeHTML()` como filtro XSS avanzado basado en DOMPurify.
- [./src/_main/analytics.js](./src/_main/analytics.js): Centraliza el registro taxonómico de eventos de telemetría (páginas, clics, diálogos, errores 404) hacia Google Analytics.
- [./src/_main/util.js](./src/_main/util.js): Caja de herramientas comunes (generación de UUIDs criptográficamente fuertes mediante `crypto.randomUUID()`, validación responsiva y cargadores dinámicos).

## Sinergia con el Directorio Padre

- Este motor lógico alimenta directamente a todo el directorio [./src/](./src/README.md) y es importado en el arranque [./src/index.js](./src/index.js) para inicializar los servicios en cascada al cargar el DOM.

## Sinergia con Subdirectorios

- [./src/_main/i18n/](./src/_main/i18n/README.md): Almacena los diccionarios y traducciones específicas de idiomas de forma asíncrona, las cuales son consumidas por `i18n.js`.

## Seguridad: Reglas recomendadas para Realtime Database

> ⚠️ **Importante (responsabilidad del desarrollador que implementa BaP).** La validación de whitelist (`/allowed_users/`) y los *guards* de ruta de `auth.js`/`router.js` se ejecutan en el **cliente**: son una capa de UX/conveniencia y **no** constituyen la frontera de seguridad real. Un usuario puede eludir cualquier comprobación de JavaScript. La autorización efectiva de los datos depende **exclusivamente** de las **Reglas de Seguridad de Firebase** que configures en tu propio proyecto.

BaP **no despliega ni sobrescribe** las reglas de tu proyecto (no se versiona ningún `database.rules.json` en el framework, precisamente para no pisar tu configuración). A continuación se ofrece una **plantilla recomendativa** *deny-by-default* como punto de partida; **adáptala a tu modelo de datos** y publícala tú mismo desde la consola de Firebase o tu propio `firebase.json`:

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

- `.read`/`.write` globales en `false`: nada es legible ni escribible salvo lo que se habilite explícitamente.
- `allowed_users/$userKey`: legible solo por usuarios autenticados; escritura denegada desde el cliente (la whitelist se administra desde la consola/Admin SDK).
- Endurece según tu caso: por ejemplo, limitar la lectura a la propia entrada del usuario, o validar el `uid`/`email` del token.

> El inicio de sesión usa OAuth con Google (`signInWithPopup`); el *rate limiting* de autenticación lo gestiona Google/Firebase Auth a nivel de proyecto (por eso el framework ya no expone un contador `loginAttempts` propio, que sería eludible y solo daría una falsa expectativa de seguridad).

### La "Regla de Oro" (bypass de seguridad)

Cuando `CONSTANT.FIREBASE_AVAILABLE` es `false`, `auth.js` y `router.js` **omiten** las validaciones de sesión y whitelist (`isUserAuthorized()` devuelve `true`, los *guards* dejan pasar). Es un comportamiento **intencional** para agilizar el desarrollo local y habilitar un modo "sitio 100% estático sin Firebase".

Para que este bypass **no llegue accidentalmente a producción**, existen dos controles:

1. **Compilación (VUL-04, [./gulpfile.js](./gulpfile.js))**: `optimize:prod` aborta el build si se compila para producción con credenciales presentes pero `FIREBASE_AVAILABLE` ≠ `"true"`.
2. **Runtime ([./src/_main/constants.js](./src/_main/constants.js))**: en un hostname no local con credenciales en el bundle, Firebase se habilita automáticamente, ignorando el `.env`. La detección de "host local" es una **heurística** (`localhost`, rangos privados `192.168.`, `10.`, `172.`); por diseño, cualquier caso ambiguo se resuelve hacia *habilitar* Firebase (lado seguro).

> **Recordatorio de alcance:** BaP es para prototipos/MVP. El bypass afecta la navegación de **vistas**, no el acceso a **datos** (protegido por las Security Rules). Quien lo despliegue en producción asume el riesgo y debe configurar Firebase + reglas; el framework no sustituye una arquitectura de seguridad propia.

## Referencias Cruzadas e Integración

- **Inyección en Build Time**: Las credenciales sensibles de Firebase en `constants.js` se manejan como marcadores de reemplazo (`%%NOMBRE_VAR%%`). El script de automatización [./gulpfile.js](./gulpfile.js) se encarga de leerlas de los archivos `./.env.*` de la raíz e inyectarlas al compilar.
- **Configuración Maestra**: El motor lee el archivo de configuración central [./bap.config.json](./bap.config.json) para cargar dinámicamente las rutas personalizadas y registrar Custom Elements.
- **Pruebas unitarias**: Toda la lógica central y las funciones asíncronas de criptografía se validan minuciosamente en el directorio espejo [./test/](./test/README.md).
