# 🔒 Política y Modelo de Seguridad — BaP Framework

Este documento es el **punto único de entrada** a la seguridad de BaP Framework: consolida el alcance, el modelo de responsabilidad, los controles implementados y las obligaciones de quien lo implementa. Las auditorías formales detalladas están en [`./docs/security-audits/`](./docs/security-audits/).

---

## 🎯 Alcance

> [!IMPORTANT]
> **BaP Framework está diseñado para prototipos y MVPs**, no como una solución de seguridad definitiva. Prioriza la agilidad de desarrollo. Quien lo lleve a producción **asume el riesgo** y es responsable de endurecer su propia infraestructura.

BaP es un framework **client-only** (HTML/CSS/JS vanilla, sin backend propio). Esto define un límite estructural: **la frontera de seguridad real de los datos nunca está en el cliente**, sino en los servicios que el desarrollador configure (Firebase Auth, App Check y Reglas de Seguridad).

---

## 🤝 Modelo de Responsabilidad Compartida

| Responsabilidad de **BaP Framework** | Responsabilidad del **desarrollador que lo implementa** |
|---|---|
| Sanitización XSS (DOMPurify) en los puntos de inyección de los componentes | Configurar las **Reglas de Seguridad** de Firebase RTDB |
| Inyección de credenciales en build-time (nunca en el repo) | Activar **App Check** (*enforced*) y restringir reCAPTCHA por dominio |
| Cabeceras HTTP / CSP en `firebase.json` | Restringir la `apiKey` por referrer en Google Cloud Console |
| Cifrado AES-GCM / PBKDF2 para almacenamiento local | No exponer datos sensibles vía rutas RTDB sin reglas |
| Validación de build que evita despliegues inseguros (VUL-04) | Revisar y mantener las dependencias de su propio proyecto |

> El software se proporciona **"tal cual"** (ver [LICENSE](./LICENSE)). El autor no se responsabiliza por la información que el desarrollador expone ni por cómo utiliza el framework.

---

## 🔑 Manejo de Credenciales

- Las credenciales de Firebase y reCAPTCHA se inyectan en **build-time** desde los archivos `.env.*` (ignorados por Git) reemplazando tokens `%%NOMBRE%%`. **Nunca** se versionan en el código fuente.
- Las **claves web de Firebase y el *site key* de reCAPTCHA son públicas por diseño**: viajan al cliente en cualquier SPA con Firebase. No son secretos. La ofuscación del bundle dificulta el *reverse-engineering* de la lógica, pero **no** es —ni debe usarse como— una medida de confidencialidad de claves.
- La protección real no es ocultar esas claves, sino: **App Check *enforced* + reCAPTCHA restringido por dominio + restricción de la `apiKey` por referrer + Reglas de Seguridad**.

---

## 🚦 La "Regla de Oro" (bypass de seguridad)

Cuando `CONSTANT.FIREBASE_AVAILABLE` es `false`, el enrutador **omite** las validaciones de sesión y whitelist. Es **intencional**: habilita el desarrollo local y el modo "sitio 100% estático sin Firebase".

Para evitar que llegue accidentalmente a producción existen **dos controles**:

1. **Compilación (VUL-04)**: `npm run optimize:prod` **aborta el build** si hay credenciales pero `FIREBASE_AVAILABLE` ≠ `"true"`.
2. **Runtime**: en un hostname no local con credenciales en el bundle, Firebase se habilita automáticamente (la detección de host local es una heurística cuyos bordes fallan hacia el lado seguro).

> El bypass afecta la **navegación de vistas**, no el **acceso a datos** (protegido por las Reglas de Seguridad).

---

## 🛂 Autorización y Reglas de Seguridad (RTDB)

Los *guards* de ruta y la validación de whitelist (`/allowed_users/`) se ejecutan en el **cliente**: son una capa de **UX/conveniencia, no un control de seguridad** (cualquier comprobación de JavaScript es eludible). La autorización efectiva depende **exclusivamente** de las Reglas de Seguridad del proyecto del desarrollador.

BaP **no versiona ni despliega** un `database.rules.json` (para no sobrescribir las reglas de tu proyecto). Plantilla recomendada *deny-by-default* como punto de partida:

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

> El *rate limiting* de autenticación lo gestiona Google/Firebase Auth (el login es OAuth con Google; no hay contraseña propia que adivinar).

---

## 🛡️ Controles Implementados en el Framework

- **Sanitización XSS**: DOMPurify (allowlist) empaquetado localmente (*vendored*), aplicado en los puntos de inyección de componentes e i18n.
- **Cabeceras HTTP / CSP**: en `firebase.json` — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, y una CSP que bloquea `<style>` inline (`style-src-elem`).
- **Criptografía**: almacenamiento local con AES-GCM 256 + PBKDF2 (100k iteraciones, salt/IV aleatorios) vía Web Crypto API.
- **Enrutador seguro**: instanciación de componentes con `document.createElement` + validación de atributos, sin interpolación de HTML.
- **Build seguro**: ofuscación de JS y validación que aborta despliegues de producción mal configurados.

---

## 📣 Reportar una Vulnerabilidad

Si descubres un problema de seguridad, repórtalo de forma responsable a **gonzaloarenasf+bap-framework@gmail.com** antes de divulgarlo públicamente.

---

## 📚 Referencias

- Auditorías de seguridad: [`./docs/security-audits/`](./docs/security-audits/)
- Núcleo, autenticación y reglas: [`./src/_main/README.md`](./src/_main/README.md)
- Licencia y *disclaimer*: [`./LICENSE`](./LICENSE)
