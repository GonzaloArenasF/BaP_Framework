---
name: bap-build-and-deploy
description: >-
  Ejecuta el ciclo de pruebas unitarias, compilación con Gulp y despliegue en Firebase Hosting.
  Solicita siempre la confirmación explícita del usuario antes de ejecutar el despliegue a producción (deploy-prod).
  Usar cuando el usuario solicite compilar, optimizar, probar o desplegar la aplicación a producción.
---

# Compilación y Despliegue (`bap-build-and-deploy`)

Esta skill controla el pipeline automatizado de pruebas, optimización con Gulp y despliegue productivo a Firebase Hosting.

---

## 🧪 Paso 1: Pruebas Unitarias Pre-Build (Bloqueante)

Ejecutar la suite completa de pruebas unitarias en Vitest:
```bash
npm run test
```
* **Requisito**: Si alguna prueba falla, el proceso debe **abortarse de inmediato**. No se permite continuar sin corregir los errores.

---

## ⚙️ Paso 2: Compilación y Optimización (Gulp)

1. Para entorno de desarrollo:
   ```bash
   npm run optimize
   ```
2. Para entorno de producción:
   ```bash
   npm run optimize:prod
   ```
3. Verificaciones de Seguridad del Build:
   - Validar que `.env.production` exista en la raíz con credenciales completas.
   - Confirmar que `FIREBASE_AVAILABLE` sea `"true"`.
   - Verificar que los mapas de origen (`.map`) estén deshabilitados en producción.

---

## 🛑 Paso 3: CONFIRMACIÓN HUMANA OBLIGATORIA (Deploy)

**CRÍTICO**: Antes de ejecutar el comando de despliegue, **debes solicitar la confirmación explícita del desarrollador**:

> *"La suite de pruebas pasó con éxito y la compilación de producción se generó correctamente. ¿Confirmas que deseas proceder con el despliegue productivo a Firebase Hosting (`npm run deploy-prod`)?"*

---

## 🚀 Paso 4: Despliegue Productivo

Solo tras recibir el **"Sí" o confirmación explícita** del desarrollador:
```bash
npm run deploy-prod
```
