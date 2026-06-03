# Especificación Técnica de Actualización (Spec Book)
## BaP Framework — Sincronización v2.0 (Desarrollo Guiado por Especificaciones)

Este documento representa la **Especificación de Actualización Oficial (v2.0)** para el **BaP Framework**. A través de la metodología *Spec Driven Development*, esta especificación define los contratos, interfaces, comportamientos de seguridad extrema, arquitectura visual y estándares de documentación que deben implementarse para sincronizar el repositorio base con la versión en producción del proyecto `bpmn-editor` (rama `development`).

---

## 1. Reglas Generales del Framework & Estándar de Documentación

### 1.1 Contrato de Guardia de Firebase (Firebase Guard Pattern)
*   **Regla de Oro:** Si `CONSTANT.FIREBASE_AVAILABLE` es `false`, el framework debe operar con total estabilidad en su capa local y enrutar las vistas públicas y protegidas de forma normal.
*   **Comportamiento de la Lista Blanca (Bypass):** Si Firebase no está configurado o está inactivo, **el control de seguridad de la lista blanca (Whitelist) NO debe aplicar**. El sistema debe permitir que el flujo del usuario continúe con total normalidad (ej. modo de desarrollo sin conexión o bypass de autenticación local).
*   **Intercepción de Funcionalidades:** Si el desarrollador o la aplicación solicita una funcionalidad acoplada a Firebase (como inicio de sesión por popup) cuando el servicio no está activo, el sistema **no debe crashear**. En su lugar, debe emitir una advertencia clara en la consola informando que Firebase requiere ser configurado para esa característica.

### 1.2 Estándar Obligatorio de Documentación del Código (Spec Rule)
> [!IMPORTANT]
> Todo el código fuente del framework (JavaScript, CSS, HTML) debe estar **perfectamente documentado en español** para facilitar la mantenibilidad, escalabilidad y la integración de nuevos colaboradores hispanohablantes.

1.  **Idioma Obligatorio de Documentación:**
    *   Todos los comentarios de código, descripciones JSDoc, explicaciones de variables, anotaciones inline y documentación técnica del repositorio **deben estar redactados única y exclusivamente en español**.
2.  **Documentación de Código JavaScript (JSDoc Estricto):**
    *   Todas las clases (ej. Custom Elements), utilidades, enrutadores y funciones de persistencia **deben** llevar bloques de comentario formateados bajo el estándar **JSDoc**.
    *   Cada bloque debe declarar con precisión: la descripción clara de la función, las propiedades de entrada con sus tipos `@param {type} name - descripción` y los valores de retorno `@returns {type}`.
3.  **Anotaciones en Hojas de Estilos (CSS):**
    *   Cada variable de color declarada en `colors.css` (tanto en `.light-mode` como en `.dark-mode`) debe acompañarse de un comentario explicativo indicando su rol en el viewport (ej. fondos, diálogos, bordes).
4.  **Marcado HTML e i18n:**
    *   Los archivos de plantilla HTML de los Custom Elements deben incluir comentarios estructurales claros que expliquen el rol de los marcadores de posición (`placeholders` del tipo `{label}`) y el flujo de inyección del Light DOM.

---

## 2. Especificación de Módulos Técnicos y Componentes

### MÓDULO 1: Web Components y Aislamiento de Estilos

#### 1.1 Corrección del Ciclo de Vida de `BapSvgImage`
*   **Contrato de Elemento:** `bap-svg-image` debe migrar fuera del constructor para cumplir con el estándar W3C Custom Elements.
*   **Firma del Ciclo de Vida:**
    ```javascript
    export class BapSvgImage extends HTMLElement {
      connectedCallback() {
        const name = this.getAttribute("name");
        const mobileSize = this.getAttribute("mobile-size");
        const size = isMobile() && mobileSize ? mobileSize : this.getAttribute("size");
        const type = this.hasAttribute("type") ? this.getAttribute("type") : "icon";

        if (!name || !size) return;

        // Inyección limpia en el innerHTML en lugar de outerHTML
        this.innerHTML = `
          <figure style="width:${sizes[type][size].px}px; height:${sizes[type][size].px}px; display: flex; justify-content: center; align-items: center;">
            <svg width="${sizes[type][size].px}" height="${sizes[type][size].px}" viewBox="${sizes[type][size].viewBox}" fill="none" style="transform: scale(${sizes[type][size].scale});">
              ${images[type][name]}
            </svg>
          </figure>
        `;
      }
    }
    ```

#### 1.2 Corrección de Aislamiento de Estilos en `<bap-notification>` (Shadow DOM)
*   **Contrato de Aislamiento:** Inyectar incondicionalmente la hoja de estilos en el Shadow Root de cada instancia para evitar que notificaciones duplicadas pierdan estilos en Shadow DOM.

#### 1.3 Nuevo Componente Genérico: `<bap-logo>`
*   **Descripción:** Componente genérico y portable para desplegar la identidad visual del sitio. Reemplaza las referencias rígidas a `<gaf-logo>`.
*   **Comportamiento de Configuración:** Debe leer la ruta de la imagen o el SVG desde `CONSTANT.LOGO_URL` en `constants.js`. Si no se define, cargará un vector SVG genérico del framework embebido en su lógica.

#### 1.4 Nuevo Componente Genérico: `<bap-dialog>` (Modal Premium)
*   **Descripción:** Siguiendo el exitoso patrón de `gaf-dialog` en `bpmn-editor`, se integra al framework un sistema nativo de diálogos/modales flotantes y premium.
*   **Propiedades Soportadas:** `id`, `box-id` (contenedor padre para retornar el modal al cerrarse), `image-header-left`, `image-header-right`, `image-detail`, `title-top`, `title-main`, `title-sub`, y soporte de links decodificados en Base64 para adjuntar enlaces interactivos.
*   **Funcionamiento:** Inyecta en el Light DOM el modal, y tras cerrarse, remueve el elemento restaurando el flujo de scroll (`document.body.style.overflow = "auto"`).

---

### MÓDULO 2: Enrutador y Guardias de Ruta (Routing Engine)

#### 2.1 Nueva Firma de Navegación: `goTo`
*   **Contrato Técnico:**
    ```javascript
    /**
     * @param {Object} route - Objeto de ruta del diccionario de rutas.
     * @param {Object} [params] - Parámetros query string.
     */
    export async function goTo(route, params) {
      if (!route || !route.pathname) {
        // Redirección segura de error a 404
        window.location.href = `${window.location.origin}/404.html`;
        return;
      }

      if (await isAccessAllowed(route)) {
        navigateTo(route, params);
        if (route.navigation === NAVIGATION_TYPES.LOAD_COMPONENT) {
          loadContent(route);
        }
      } else {
        bapNotify(
          CONSTANT.NOTIFICATION.TYPE.TOAST,
          CONSTANT.NOTIFICATION.SEVERITY.INFO,
          routerI18n.notification.notAllowedEnteringPage
        );
      }
    }
    ```

#### 2.2 Integración de Guardias Dinámicos en `sessionStartedControl`
*   **Comportamiento:** Si la ruta requiere firma (`route.validate.signIn: true`):
    *   **Si Firebase está disponible:** Suscribirse a `onAuthStateChanged`. Si el usuario no está autenticado o falla la validación de Whitelist, disparar `signOut()` y retornar a la landing page pública.
    *   **Si Firebase está inactivo:** Se aplica el bypass de seguridad de la Spec. Permitir continuar el flujo y dar acceso a la ruta privada de forma local.

---

### MÓDULO 3: Autenticación Segura y Control de Whitelist (Lista Blanca)

#### 3.1 Estructura de la Lista Blanca en Firebase Realtime Database
Conforme a los nuevos requerimientos de producción, el control de acceso se valida contra el **email completo** del usuario (ej. `gonzaloarenasf@gmail.com`). 

Debido a que Firebase Realtime Database prohíbe el uso de puntos (`.`) en sus claves de consulta, el nodo `/allowed_users/` mapea las direcciones de correo completas **reemplazando todos los puntos por comas (`,`)**:

```json
{
  "allowed_users": {
    "gonzaloarenasf@gmail,com": true,
    "colaborador1@dominio,cl": true
  }
}
```

#### 3.2 Algoritmo de Sanitización de Correos Completos
El proceso de autenticación debe sanitizar el correo electrónico completo del usuario antes de realizar la consulta en la base de datos:

```javascript
/**
 * Sanitiza la dirección de correo electrónico completa del usuario para consultas en Firebase RTDB.
 * Remplaza todos los puntos (".") por comas (",") para evitar caracteres prohibidos.
 * 
 * @param {string} email - Ejemplo: "usuario.nombre@gmail.com"
 * @returns {string} - Ejemplo: "usuario,nombre@gmail,com"
 */
export function sanitizeUserKey(email) {
  if (!email) return "";
  return email.toLowerCase().replace(/\./g, ",");
}
```

#### 3.3 Flujo de Autenticación de Doble Factor Lógico
1.  **Lanzamiento de Firma:** Si se ejecuta `userSignIn()` y `FIREBASE_AVAILABLE` es `false`, abortar de inmediato de forma segura, notificar al desarrollador por consola y permitir el flujo del usuario (Bypass de seguridad local).
2.  **Verificación con Firebase Activo:**
    *   Invocar: `signInWithPopup(bapAuth, new GoogleAuthProvider())`.
    *   Tras obtener la credencial, evaluar de forma asíncrona: `isUserAuthorized(result.user)`.
3.  **Consulta asíncrona de Whitelist (`isUserAuthorized`):**
    ```javascript
    /**
     * Consulta asíncrona a Realtime Database en el nodo /allowed_users/email_sanitizado.
     * Si Firebase no está configurado, la función retorna automáticamente true para permitir el bypass.
     */
    export async function isUserAuthorized(user) {
      // 1. Regla de Oro: Si Firebase no está habilitado, omitir control y dejar seguir el flujo
      if (!CONSTANT.FIREBASE_AVAILABLE) {
        return true;
      }
      
      if (!user || !user.email) return false;
      
      const emailSanitized = sanitizeUserKey(user.email);
      const dbRef = ref(bapDB, `/allowed_users/${emailSanitized}`);
      
      return new Promise((resolve) => {
        onValue(
          dbRef,
          (snapshot) => {
            // Retorna true únicamente si el valor coincide exactamente con true en el RTDB
            resolve(snapshot.val() === true);
          },
          (error) => {
            console.error("Error al consultar la Whitelist de usuarios:", error);
            resolve(false);
          },
          { onlyOnce: true }
        );
      });
    }
    ```

---

### MÓDULO 4: Analíticas de Producción y 404 Telemetría

#### 4.1 Diccionario Unificado de Analíticas (`analytics.js`)
*   Se unifican todos los eventos por sección en un solo objeto exportado para evitar llamadas a métodos huérfanos.
*   **Definición del Evento 404:**
    ```javascript
    const generalPageEvents = {
      enterLandingPage: () => logAnalyticEvent({
        type: EVENT_TYPE.ENTER_PAGE,
        name: "enter_landing_page",
        func: "landing_page",
        userType: USER_TYPE.USER,
      }),
      pageNotFound: () => logAnalyticEvent({
        type: EVENT_TYPE.ENTER_PAGE,
        name: "page_not_found",
        func: "404",
        userType: USER_TYPE.USER,
      })
    };

    export const analytic = {
      logEvent: {
        ...generalPageEvents
      }
    };
    ```

---

### MÓDULO 9: Patrón de Integración de IA Ultraligero (CDN-based ESM)
*   **Descripción:** Para proyectos que requieran integrar inteligencia artificial (como Gemini API) sin arrastrar pesadas dependencias que afecten la ligereza del framework, se establece como estándar el patrón de **importación ESM directa mediante CDN** (`esm.run`):
    ```javascript
    import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
    ```
*   Esto conserva el framework libre de empaquetadores complejos y compatible con el servidor local del pipeline.

---

## 3. Plan de Verificación y Compilación (Siguiente Turno)

### 3.1 Verificación de Integración Estática con Gulp
Para asegurar la total conformidad con el pipeline de distribución tras aplicar la Spec de Actualización v2.0:
1.  **Ejecutar Optimización Local:**
    ```bash
    npm run optimize
    ```
2.  **Verificación del Ofuscador y Compresor:** Validar que `gulp-javascript-obfuscator` y `gulp-htmlmin` procesen sin fallos los archivos de componentes modularizados (`bap-logo` e inyección de Shadow DOM en `bap-notification`).
3.  **Inspección del directorio `/public`:** Asegurar que todos los metatags e inyecciones de variables locales operen correctamente bajo `IS_PROD: false`.
