---
name: bap-security-auditor
description: >-
  Audita el cumplimiento del modelo de seguridad de BaP Framework definido en SECURITY.md.
  Verifica reglas de Firebase Realtime Database / Firestore, reCAPTCHA / AppCheck, autodetección de hostnames,
  ausencia de credenciales en repositorios y metadatos i18n/SEO.
  Usar cuando el usuario pida revisar la seguridad del proyecto o preparar el sitio para auditar.
---

# Auditoría de Seguridad de BaP Framework (`bap-security-auditor`)

Esta skill audita la aplicación contra el modelo de seguridad definido en [`SECURITY.md`](../../SECURITY.md).

---

## 🔍 Checklist de Auditoría

1. **Protección de Credenciales**:
   - Verificar que `.env`, `.env.development` y `.env.production` estén incluidos en `.gitignore`.
   - Confirmar que `.env.example` solo contenga valores de plantilla de referencia.

2. **Validación de Entorno en Compilación (VUL-04)**:
   - En compilaciones productivas (`IS_PROD: true`), confirmar que `FIREBASE_AVAILABLE` esté fijado estrictamente en `"true"`.

3. **Guards de Ruta vs Reglas de Base de Datos**:
   - Recordar que los *guards* en JavaScript son UX, no seguridad.
   - Verificar que la autorización real esté reforzada mediante **Reglas de Seguridad de Firebase** (Security Rules).

4. **AppCheck y reCAPTCHA**:
   - Verificar que el token de AppCheck y reCAPTCHA por dominio estén activos para proteger el acceso a las APIs.

5. **Pruebas de Seguridad**:
   - Ejecutar las pruebas de integración y seguridad:
     ```bash
     npm run test
     ```
