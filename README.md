# BaP Framework - v2.3.2

Un framework minimalista y de alto rendimiento basado en **HTML, CSS y JavaScript Vanilla (puro)**. Diseñado bajo la filosofía de "cero frameworks externos y cero dependencias pesadas en el cliente", BaP permite prototipar ideas de manera extremadamente rápida y sencilla, proporcionando a su vez una arquitectura robusta, modular y altamente escalable para aplicaciones en producción.

---

## 🚀 Soporte Ecosistema Firebase

BaP Framework está optimizado para integrarse de forma nativa con los servicios de **Google Firebase**:

*   **Hosting**: Firebase Hosting (despliegue veloz y seguro).
*   **Database**: Firebase Realtime Database (sincronización y persistencia en tiempo real).
*   **Analytics**: Firebase Analytics (telemetría y análisis de eventos de usuario).
*   **Auth**: Firebase Auth (autenticación segura).
*   **Recaptcha**: Firebase AppCheck / Google Cloud reCAPTCHA (protección contra bots).

> [!IMPORTANT]
> Para activar la integración, crea un proyecto en Firebase. Luego, copia el archivo `.env.example` como `.env.development` y `.env.production` en la raíz del proyecto, completa las credenciales con los valores de tu proyecto Firebase y establece la variable `FIREBASE_AVAILABLE` en `true` o `false` según el entorno.
> 
> ⚠️ Los archivos `.env.*` (incluyendo `.env.development` y `.env.production`) están en `.gitignore` y **nunca deben subirse al repositorio**. El archivo `.env.example` sirve como plantilla de referencia.
>
> 🔒 **Autodetección de Seguridad**: En entornos públicos y de producción, el framework realiza una autodetección automática del entorno evaluando `window.location.hostname`. Si detecta un hostname no local y existen credenciales en el bundle, habilitará Firebase automáticamente para prevenir omisiones accidentales del bypass local.

---

## 📂 Estructura de Archivos

La arquitectura del framework se organiza de manera clara y altamente modular:

```
├── cdn/                                  # Hosting paralelo para recursos estáticos pesados
├── docs/                                 # Documentación y guías técnicas del sistema
│   ├── security-audits/                  # Auditorías de seguridad y logs de correcciones
│   │   ├── security-audit-v2.0.1.md      # Informe de auditoría inicial v2.0.1
│   │   └── security-fixes-v2.0.1.md      # Log detallado de mitigaciones (VUL-01 a VUL-15)
│   └── upgrades/                         # Especificaciones técnicas de actualización (Spec Books)
│       └── upgrade-v2.md                 # Spec Book de actualización v2.0
├── public/                               # Directorio autogenerado con código optimizado para producción [NO VERSIÓN]
├── src/                                  # Código fuente de desarrollo
│   ├── _components/                      # Componentes Web personalizados (Custom Elements)
│   │   ├── bap-chip/                     # Componente etiqueta (chip)
│   │   ├── bap-dialog/                   # Modal premium con glassmorphism y enlaces Base64
│   │   ├── bap-footer/                   # Pie de página estándar de la aplicación
│   │   ├── bap-header/                   # Cabecera estándar con control de sesión y color toggle
│   │   ├── bap-loading-state/            # Estado visual de carga
│   │   ├── bap-logo/                     # Identidad visual de la marca
│   │   ├── bap-notification/             # Sistema de notificaciones (Toast y Snackbar)
│   │   ├── bap-spinner/                  # Indicador de carga animado
│   │   ├── bap-svg-image/                # Renderizador de imágenes SVG estandarizadas
│   │   └── customComponentsRegistration.js # Registro global de Custom Elements en el DOM
│   ├── _main/                            # Motor y núcleo lógico del framework
│   │   ├── i18n/                         # Archivos de idioma (es-ES.js, etc.)
│   │   ├── analytics.js                  # Manejador unificado de eventos de analíticas
│   │   ├── auth.js                       # Lógica de sesión, inicio/cierre y whitelist
│   │   ├── constants.js                  # Constantes del entorno y configuración global
│   │   ├── firebaseInit.js               # Inicialización y adaptadores de Firebase
│   │   ├── i18n.js                       # Controlador y enlace de traducción en el DOM
│   │   ├── router.js                     # Motor de enrutamiento dinámico
│   │   ├── routerPaths.js                # Definición de rutas y tipos de navegación
│   │   ├── storage.js                    # Capa de persistencia (Local, Session, RTDB)
│   │   └── util.js                       # Utilidades generales del sistema
│   ├── assets/                           # Favicons, logotipos, manifiestos y recursos locales
│   ├── pages/                            # Directorios independientes por cada página
│   ├── style/                            # Sistema de diseño y hojas de estilo base
│   │   ├── colors.css                    # Definición de paletas (Claro/Oscuro) y viewport
│   │   ├── forms.css                     # Estilos estándar para elementos de formularios
│   │   ├── main.css                      # Estilos generales y tipografías
│   │   └── titles.css                    # Jerarquía y estética de encabezados
│   └── wip-page/                         # Página plantilla de construcción (Work in Progress)
├── gulpfile.js                           # Pipeline de automatización Gulp
├── package.json                          # Manifiesto de dependencias y scripts de desarrollo
└── README.md                             # Documentación del framework
```

---

## 🧠 El Núcleo de la Aplicación (Directorio `src/_main/`)

El directorio `src/_main/` representa la columna vertebral funcional del framework. Cada archivo actúa como un módulo especializado que se conecta de manera sinérgica con el resto del ecosistema para dar soporte y dinamismo a toda la aplicación.

### 🔄 Sinergia entre Módulos y Flujo de Trabajo

A continuación, se detalla el rol de cada pieza lógica y cómo interactúan entre sí:

| Módulo | Responsabilidad Principal | Sinergia con el Ecosistema |
| :--- | :--- | :--- |
| **`constants.js`** | Única fuente de verdad para la configuración global del framework (variables de versión, disponibilidad de Firebase y URLs dinámicas en base a `window.location.origin`). Las credenciales de Firebase se definen como tokens `%%NOMBRE%%` que son inyectados en tiempo de build desde el archivo `.env` local (ver `gulp-imports.js` y `gulpfile.js`). | **Alimenta a todos los módulos:** Cualquier cambio en el estado del entorno es consumido instantáneamente por el motor de autenticación, almacenamiento, enrutamiento y registro de componentes. |
| **`firebaseInit.js`** | Gateway de integración del ecosistema Google Firebase. Inicializa dinámicamente las instancias de App, Auth, Database y Analytics de forma centralizada. | **Provee los recursos base:** Evita la múltiple instanciación y expone las instancias unificadas (`bapAuth`, `bapDB`, `bapAnalytics`) requeridas por el módulo de seguridad (`auth.js`) y telemetría (`analytics.js`). |
| **`auth.js`** | Gestiona el estado de sesión activo de los usuarios y realiza el control lógico de acceso mediante validación asíncrona contra la lista blanca (`/allowed_users/`) de Realtime Database. | **Asegura la navegación:** Proporciona los estados de sesión (`userSession`) y los resultados de autorización que el motor de enrutamiento (`router.js`) requiere para permitir o bloquear el acceso a rutas protegidas. |
| **`routerPaths.js`** | Diccionario estricto donde se declaran las rutas disponibles de la aplicación, asociando cada path de URL a un componente de página y a sus reglas de validación (p. ej., si requiere inicio de sesión). | **Mapa de navegación:** Estructura los destinos que el motor de enrutamiento (`router.js`) procesará en base al tipo de transición (`REDIRECT` o `LOAD_COMPONENT`). |
| **`router.js`** | El motor de enrutamiento principal. Controla las transiciones (`goTo`), parsea parámetros de consulta (`getQueryParams`), inyecta componentes dinámicamente en la etiqueta `<main>` y gestiona el bypass local. | **Orquestador de la UI:** Conecta el estado del navegador con el validador de seguridad (`auth.js`), las rutas de navegación (`routerPaths.js`) y las utilidades globales para dar fluidez a la navegación sin recarga física de página. |
| **`storage.js`** | Capa unificada de persistencia que encapsula el acceso seguro a `localStorage`, `sessionStorage` y escritura remota en Firebase Realtime Database. | **Persistencia de datos:** Permite que cualquier página o componente web guarde y recupere información de manera uniforme, disparando notificaciones estandarizadas en caso de fallos. |
| **`i18n.js` y `i18n/`** | Motor de internacionalización. Carga los diccionarios idiomáticos de forma asíncrona y parsea el DOM para traducir elementos interactivos en tiempo de ejecución. | **Internacionalización fluida:** Traduce los componentes dinámicos en base al idioma seleccionado del navegador, asegurando que las notificaciones del enrutador y componentes se muestren en el idioma correcto. |
| **`analytics.js`** | Módulo de telemetría y analítica de datos. Centraliza las llamadas a eventos clave (aperturas de diálogos, accesos a páginas y telemetría de errores 404). | **Monitoreo de negocio:** Recolecta datos de navegación a través de wrappers seguros que conectan directamente con la instancia inicializada de Firebase Analytics en `firebaseInit.js`. |
| **`util.js`** | Caja de herramientas comunes (generación de UUIDs aleatorios, validación de viewports móviles, conversión de tipos de datos y carga de recursos asíncronos). | **Soporte estructural:** Facilita la creación y manipulación rápida de propiedades internas utilizadas tanto en Custom Elements como en lógica de controladores core. |

---

## 🧩 Componentes Web Personalizados (Custom Elements)

El framework utiliza componentes web basados en el estándar del W3C, facilitando un encapsulamiento limpio y modular.

### Registro Dinámico
Todos los componentes se registran mediante la función `setCustomComponents()` en `customComponentsRegistration.js`. La función interna `createCustomComponent()` gestiona de manera asíncrona la descarga y el reemplazo en el DOM de la plantilla HTML y su respectiva hoja de estilos CSS.

---

### 💳 Detalle de Componentes

#### 1. `<bap-logo>`
Despliega la identidad visual corporativa de la aplicación.
*   **Comportamiento Adaptativo**: Carga dinámicamente la ruta declarada en `CONSTANT.LOGO_URL`.
*   **SVG Fallback**: Si no hay una imagen definida, renderiza un logotipo vectorial SVG escalable y adaptado cromáticamente al modo de color activo (claro/oscuro).

#### 2. `<bap-dialog>`
Modal interactivo premium con estética moderna y medidas de seguridad avanzadas.
*   **Atributos**:
    *   `id`: Identificador único (autogenerado si se omite).
    *   `title-top`, `title-main`, `title-sub`: Estructura jerárquica de títulos del encabezado.
    *   `image-header-left`, `image-header-right`: Decoraciones visuales de cabecera.
    *   `image-detail`: Imagen descriptiva principal del cuerpo.
    *   `link-url-base64` y `link-text-base64`: URL y etiqueta del botón de acción codificados en Base64 para prevenir scraping de enlaces.
*   **Seguridad**: El cuerpo del mensaje (`bodyContent`) y los títulos son sanitizados estrictamente con `sanitizeHTML()` antes de inyectarse en el DOM. Además, las URLs decodificadas de Base64 se validan contra protocolos permitidos (`https://`, `http://`, `mailto:`, enlaces relativos, anclas) bloqueando cualquier esquema interactivo peligroso (como `javascript:`).
*   **Interactividad**: Incluye animación de entrada con escala progresiva, fondo difuminado (`backdrop-filter`) tipo Glassmorphism, bloqueo del scroll corporal y cierre automático al hacer clic en el botón de cerrar o fuera del modal.

#### 3. `<bap-svg-image>`
Orquestador de vectores SVG diseñado para optimizar el rendimiento y evitar múltiples peticiones HTTP individuales.
*   **Atributos**:
    *   `name`: Identificador del icono (definidos en la biblioteca interna de vectores).
    *   `size`: Tamaños predefinido (`xs`, `s`, `m`, `l`, `xl`).
    *   `mobile-size`: Tamaño opcional adaptado a dispositivos móviles.
    *   `type`: Clasificación del recurso (`icon` por defecto).

#### 4. `<bap-notification>`
Manejador de notificaciones visuales asíncronas en pantalla (Toasts, Snackbars y alertas de error).
*   **Aislamiento CSS**: Inyecta y aísla su hoja de estilos directamente en el Shadow Root de la instancia, previniendo la contaminación de la interfaz del host y garantizando consistencia de visualización ante notificaciones múltiples.

#### 5. `<bap-chip>`
Elemento etiqueta modular para destacar estados, etiquetas o categorías.
*   **Atributos**: `id`.
*   **Contenido**: Lee el texto interno de la etiqueta en el DOM y lo asocia automáticamente al placeholder `{label}` en su plantilla.

#### 6. `<bap-loading-state>`
Capa de bloqueo e indicador de carga de pantalla completa, diseñado para transiciones de carga de vistas.
*   **Atributos**:
    *   `sub-message`: Mensaje secundario (renderizado en una etiqueta `<h3>`).
*   **Contenido**: El texto del nodo interno actúa como el mensaje principal de carga.

#### 7. `<bap-spinner>`
Loader circular animado con estética premium minimalista basado en CSS keyframes.

#### 8. `<bap-header>`
Cabecera interactiva y adaptativa para el control de sesiones de usuario y preferencias de tema de color.
*   **Atributos**:
    *   `hide-actions`: Oculta botones de navegación de la barra.
    *   `show-admin-actions`: Revela las opciones exclusivas para administradores.
    *   `is-admin-user`: Flag para comprobar visualmente el rol del usuario.
    *   `color-mode`: Modo inicial de color (`light` por defecto).
*   **Lógica de Color**: Provee el selector de temas de color (Light/Dark). Al cambiar el tema, añade las clases `.light-mode` o `.dark-mode` al `<body>` (lo que propaga los colores CSS definidos en `colors.css`), actualiza el logo y los botones y almacena la selección en `localStorage` de forma persistente.

#### 9. `<bap-footer>`
Pie de página estandarizado y localizado.
*   **Dinámico**: En tiempo de compilación o ejecución local, inyecta la versión de la aplicación `{APP_VERSION}` y los datos de contacto y redes sociales definidos en las constantes del sistema.

---

## 🗺️ Motor de Enrutamiento (Routing Engine)

El módulo `router.js` administra de forma centralizada la navegación de la aplicación:

1.  **Transición Controlada (`goTo(route, params)`)**: Recibe un objeto de ruta definido en `routerPaths.js` y parámetros opcionales que formatea dinámicamente en un query string.
2.  **Carga Dinámica Segura (Inmunidad XSS)**: A diferencia de los métodos de interpolación de strings mediante `innerHTML` (que exponen a la aplicación a ataques XSS reflejados a través de parámetros de URL), el enrutador crea los componentes programáticamente usando la API nativa de creación del DOM (`document.createElement(route.component)`).
    *   **Inyección Controlada de Atributos**: Parsea las variables utilizando la API **`URLSearchParams`** para decodificar caracteres especiales y acentos de manera segura.
    *   **Validación de Claves**: Aplica una expresión regular estricta (`/^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/`) sobre los nombres de los query parameters antes de asociarlos como atributos del elemento mediante `setAttribute()`, asegurando que solo viajen datos de texto inocuos e impidiendo la inyección de atributos peligrosos en el componente.
3.  **🛡️ Regla de Oro (Bypass de Seguridad Local)**:
    Si `CONSTANT.FIREBASE_AVAILABLE` es `false` (entorno local de pruebas o desarrollo sin Firebase), el enrutador anula automáticamente todas las restricciones de inicio de sesión y validación de listas blancas, facilitando un flujo de desarrollo continuo y ágil.

---

## 🔑 Autenticación y Control Whitelist (Doble Factor Lógico)

Cuando Firebase está habilitado, BaP Framework implementa un robusto control de acceso compuesto por:

1.  **Firebase Auth**: Autenticación nativa utilizando el proveedor Google Identity.
2.  **Whitelist en Realtime Database**:
    *   **Sanitización (`sanitizeUserKey(email)`)**: Convierte el correo electrónico del usuario a minúsculas y reemplaza todos los puntos (`.`) por comas (`,`) para poder usarse como llaves de Firebase sin provocar errores.
    *   **Verificación asíncrona (`isUserAuthorized(user)`)**: Consulta de forma segura en `/allowed_users/{sanitized_email}`. Si el valor no es explícitamente `true`, el acceso se bloquea, cerrando la sesión de inmediato con `userSignOut` y redirigiendo al usuario a la landing page.

> [!TIP]
> **Estructura JSON de la Lista Blanca en Firebase Realtime Database**:
> ```json
> {
>   "allowed_users": {
>     "correo_sanitizado@dominio,com": true,
>     "nombre_usuario@gmail,com": true
>   }
> }
> ```

---

## 📦 Persistencia Criptográfica y Segura (Módulo `storage.js`)

El framework cuenta con una capa unificada y robusta para gestionar la persistencia en el cliente y en la nube de forma segura:

1. **Métodos Asíncronos Seguros (Recomendados - Criptografía AES-GCM)**:
   Las funciones asíncronas `getFromStorageAsync`, `setToStorageAsync` y `updateStorageAsync` implementan encriptación de nivel bancario utilizando la **Web Crypto API** nativa del navegador:
   * **Derivación de Clave (PBKDF2)**: Deriva una clave fuerte AES de 256 bits a partir de una contraseña suministrada (con 100,000 iteraciones, salt aleatorio y HMAC-SHA256).
   * **Cifrado Simétrico (AES-GCM)**: Cifra el payload localmente generando un vector de inicialización (IV) único por cada escritura.
   * **🔑 Enlace de Sesión Dinámico (Opción A)**: El framework está diseñado para usar el **`uid` del usuario autenticado en Firebase (`auth.currentUser.uid`)** combinado con un salt interno estable. De este modo, los datos locales del usuario en el navegador quedan cifrados de forma completamente aislada por cuenta y no se guarda ningún secreto estático en los archivos de la aplicación.
2. **Métodos Síncrono-Retrocompatibles (Obsoletos)**:
   Las funciones síncronas `getFromStorage`, `setToStorage` y `updateStorage` continúan disponibles para evitar breaking changes en aplicaciones existentes. Sin embargo, su capacidad de "cifrado" actúa únicamente como una **ofuscación de Base64** Unicode-safe. Estas funciones muestran advertencias en la consola indicando que no deben utilizarse para datos sensibles.

## 🛡️ Medidas de Seguridad y Mitigaciones (v2.1.0 a v2.3.0)

A raíz de una revisión y auditoría exhaustiva, BaP Framework incorpora un estándar de seguridad de grado de producción sin añadir librerías pesadas en el cliente:

### 1. Inmunidad XSS Reflejado y Dom-Based XSS
*   **i18n Seguro**: Reemplaza el uso histórico de `document.body.innerHTML` y `document.head.innerHTML` (que rompía listeners e introducía superficies XSS) por la función `replaceTokensInDOM()`. Esta función recorre el DOM de forma eficiente y segura mediante un `TreeWalker` nativo de alto rendimiento, modificando exclusivamente los valores de los nodos de texto (`Node.TEXT_NODE`) y los atributos de los elementos.
*   **Sanitizador HTML de Emergencia**: El framework cuenta con la utilidad `sanitizeHTML()` en `i18n.js`. Si se requiere inyectar traducciones con formato HTML legítimo (como `<strong>` o `<code>`), el texto se procesa usando `DOMParser` para eliminar selectivamente etiquetas peligrosas (`<script>`, `<iframe>`, `<style>`, `<object>`, `<embed>`), así como manejadores de eventos inline (`on*`) y esquemas URI de tipo `javascript:`.
*   **Instanciación Limpia de Componentes**: El enrutador elimina la concatenación directa de strings HTML en `<main>`. En su lugar, utiliza `document.createElement` y `element.setAttribute`, tratando el payload de la URL estrictamente como cadenas de texto no ejecutables.

### 2. Endurecimiento de la Configuración y Secretos
*   **Inyección a través de variables de entorno**: Las credenciales sensibles de Firebase y de reCAPTCHA ya no están hardcodeadas en `src/_main/constants.js`. Se manejan como tokens de reemplazo (`%%NOMBRE_VAR%%`) y se inyectan en tiempo de build con Gulp leyendo los archivos `.env.development` o `.env.production` locales (protegidos por `.gitignore`).
*   **Validación de Construcción de Gulp**: El script `gulpfile.js` aborta el pipeline si se intenta compilar para producción (`ENV_URL` coincide con `ENV_PROD`) y el bypass `FIREBASE_AVAILABLE` está establecido en `false` en el archivo de entorno de producción.

### 3. Criptografía Avanzada en Persistencia (`storage.js`)
*   Se depreca el uso de codificación simple Base64 en los métodos síncronos, emitiendo alertas de advertencia en consola.
*   Se introducen las funciones asíncronas `getFromStorageAsync`, `setToStorageAsync` y `updateStorageAsync` que implementan cifrado **AES-GCM de 256 bits** y derivación de clave robusta **PBKDF2** con 100,000 iteraciones y salt dinámico (usando la **Web Crypto API** nativa del navegador).

### 4. Generación de UUIDs Fuertes
*   La función `generateUUID()` en `util.js` utiliza la Web Crypto API (`crypto.randomUUID()` o `crypto.getRandomValues()`) para garantizar identificadores criptográficamente fuertes y no predecibles, limitando el fallback a `Math.random()` a entornos sin soporte de seguridad en el navegador.

### 5. Content Security Policy (CSP) y Encabezados de Red
El archivo `firebase.json` define directivas estrictas para el servidor:
*   `X-Frame-Options: SAMEORIGIN` (Mitigación contra Clickjacking).
*   `X-Content-Type-Options: nosniff` (Previene inyecciones MIME).
*   `Referrer-Policy: strict-origin-when-cross-origin`.
*   `Content-Security-Policy`: Define una política de seguridad estricta para registrar la carga de scripts, fuentes e integraciones exclusivamente a dominios de confianza (`self`, CDN de Firebase, reCAPTCHA, Google Analytics y Google Fonts).

---

## 📊 Módulo de Analíticas y Telemetría

El módulo `analytics.js` centraliza la telemetría del framework mediante un diccionario unificado para evitar llamadas huérfanas o dispersas a lo largo de la aplicación:

*   **Exportación Principal (`analytic.logEvent`)**: Provee los métodos unificados de registro para asegurar que todas las métricas sigan una misma estructura taxonómica.
*   **Tipos de Eventos Estándar (`EVENT_TYPE`)**:
    *   `ENTER_PAGE`: Registro de navegación a páginas.
    *   `BUTTON_CLICK`: Clics en botones o enlaces clave.
    *   `OPEN_DIALOG` y `CLOSE_DIALOG`: Apertura y cierre de modales.
    *   `LOGIN` y `LOGOUT`: Eventos de inicio y cierre de sesión de usuarios.
    *   `ERROR` y `PROCESS`: Telemetría de fallos y de flujos de procesos.
*   **Tipos de Usuarios (`USER_TYPE`)**: Distingue de forma nativa entre roles `Admin` y `User`.
*   **Eventos de Telemetría Disponibles**:
    *   `logEvent.enterLandingPage()`: Gatillado al ingresar exitosamente a la landing page.
    *   `logEvent.pageNotFound()`: Gatillado al acceder a rutas inexistentes (`404.html`) para recolectar telemetría de errores de navegación.

---

## 🧪 Pruebas Unitarias y Cobertura (Testing)

El framework incorpora una infraestructura moderna, rápida y robusta para garantizar la calidad del código, utilizando herramientas de vanguardia integradas directamente en el flujo de desarrollo:

*   **Vitest**: Como motor principal para la ejecución ultrarrápida de pruebas unitarias y de integración.
*   **JSDOM**: Permite emular un entorno de navegador completo en Node.js, lo que es vital para instanciar, probar y asertar el comportamiento de los Web Components (Custom Elements) de forma totalmente aislada.
*   **Mocks de Firebase**: El directorio `test/mocks/` provee simulaciones avanzadas y limpias de los servicios de Firebase (`bapAuth`, `bapDB`, `bapAnalytics`) evitando que las pruebas hagan llamadas reales a la red o modifiquen datos vivos.
*   **Cobertura de Código (Coverage)**: Utilizando `@vitest/coverage-v8`, se pueden generar reportes de cobertura exhaustivos ejecutando `npm run test:coverage`.
*   **Estructura Espejo**: Las pruebas en la carpeta `test/` siguen la misma estructura exacta que `src/` (p. ej. `test/_components/`, `test/_main/`), haciendo el mantenimiento intuitivo.

---

## 🎨 Diseño y Estética Premium

El framework cuenta con un diseño visual moderno, premium y minimalista:

*   **Paleta de Colores Curada**:
    *   **Turquesa/Cian Eléctrico (`#62aec4`)**: Color de énfasis para enlaces, botones principales, loaders y estados hover.
    *   **Azul Medianoche Profundo (`#111825`)**: Color primario oscuro, usado como fondo en modo oscuro y para textos principales en modo claro.
    *   **Gris Platino (`#eaece9`)**: Tonalidad sutil para tarjetas y bordes limpios.
*   **Tipografía de Vanguardia**:
    *   **`Space Grotesk`**: Fuente geométrica e ingenieril para encabezados (`h1` a `h6`), logotipo y modales, aportando una personalidad tecnológica única.
    *   **`Plus Jakarta Sans`**: Fuente excepcionalmente legible y equilibrada para el cuerpo del texto y elementos generales.
*   **Modo Claro / Modo Oscuro**: Variables CSS estructuradas y documentadas dentro de `colors.css` para un control total de la interfaz.

---

## 💻 Patio de Pruebas e Interactividad Local

La página de inicio principal (`src/index.html`) sirve como un **Patio de Pruebas interactivo en tiempo real**. Los desarrolladores pueden levantar el servidor local e interactuar directamente con:
*   Visualizaciones responsivas de los componentes `<bap-logo>` y `<bap-spinner>`.
*   Iconos SVG responsivos con el componente `<bap-svg-image>`.
*   Triggers dinámicos para inyectar modales premium `<bap-dialog>` y disparar bloqueos temporales de carga con `<bap-loading-state>`.
*   Notificaciones Toasts y Alertas visuales con `<bap-notification>`.

---

## 🛠️ Ciclo de Desarrollo y Compilación

BaP Framework utiliza un robusto pipeline de automatización con **Gulp** para compilar y preparar la aplicación para entornos de producción.

### Comandos de Consola

```bash
# 1. Ejecutar la suite completa de pruebas unitarias
npm run test

# 2. Ejecutar las pruebas en modo interactivo (Watch Mode)
npm run test:watch

# 3. Generar el reporte de cobertura de código
npm run test:coverage

# 4. Iniciar el servidor local de desarrollo
# Nota: Por seguridad, el CORS abierto está deshabilitado por defecto para prevenir lectura de datos desde pestañas externas.
npm run server

# 5. Compilar, minificar y ofuscar el código usando el entorno de desarrollo (.env.development)
npm run optimize

# 6. Compilar, minificar y ofuscar el código usando el entorno de producción (.env.production)
npm run optimize:prod

# 7. Desplegar en el entorno productivo de Firebase (ejecuta optimize:prod internamente)
npm run deploy-prod
```

### Proceso de Gulp (`npm run optimize` / `npm run optimize:prod`)

> [!IMPORTANT]
> Antes de compilar para producción, asegúrate de que el archivo `.env.production` existe en la raíz del proyecto con las credenciales de Firebase completas. Cópialo desde `.env.example` si es la primera vez.

El script de optimización automatiza las siguientes tareas:
1.  **Minificación HTML**: Limpia y reduce el tamaño de los archivos `.html` reemplazando dinámicamente marcas de variables (como `{APP_VERSION}` y entornos de producción).
2.  **Procesamiento CSS**: Consolida y minifica las hojas de estilos de componentes y generales.
    *   *Source Maps Condicionales*: Gulp detecta si el build es para producción (`IS_PROD: true`) y, si es así, deshabilita la generación de mapas de origen (`.map`) para evitar la exposición de código original en producción y reducir el peso del bundle.
3.  **Inyección de credenciales**: Lee el archivo `.env` correspondiente al script (`.env.development` o `.env.production`) e inyecta las credenciales de Firebase y entornos en los archivos `.js` reemplazando los tokens `%%NOMBRE%%` definidos en `constants.js`.
    *   *Validación Crítica*: Si se compila con el entorno productivo activo, verifica que `FIREBASE_AVAILABLE` sea `"true"`. En caso contrario, aborta la compilación para evitar brechas de seguridad accidentales.
4.  **Ofuscación JavaScript**: Ejecuta `gulp-javascript-obfuscator` sobre toda la lógica interna y de componentes en `/public`, garantizando la protección de la propiedad intelectual antes del despliegue.

---

## 🍎 Mitigación de Conflictos de Puertos en macOS (Servicio AirPlay)

> [!NOTE]
> En macOS, el servicio nativo de **AirPlay Receiver** suele ocupar el puerto por defecto `8080`. Cuando levantas el servidor local (`npm run server`), el ejecutable redirigirá automáticamente el tráfico hacia el siguiente puerto libre disponible (como `8081` o `8082`).
>
> **Resolución Dinámica**: BaP Framework resuelve `ENV_URL` dinámicamente evaluando `window.location.origin` si se ejecuta dentro del navegador. Esto evita la colisión clásica de puertos (donde el navegador intenta descargar componentes en `8080` de manera estricta y falla con `net::ERR_CONNECTION_REFUSED`), permitiendo un desarrollo completamente libre de bloqueos.

---

## 📄 Licencia

Copyright © 2026 **[Gonzalo A. Arenas Flores](http://gonzaloarenasf.cl)**

Este proyecto está licenciado bajo la **Licencia MIT** — libre de utilizar, copiar, modificar, fusionar, publicar, distribuir y sublicenciar.

> [!WARNING]
> El software se proporciona **"tal cual"**, sin garantía de ningún tipo, expresa o implícita. El uso de este framework es bajo responsabilidad exclusiva del usuario. El autor no asume ninguna responsabilidad por daños directos, indirectos, incidentales o consecuentes derivados de su uso, incluyendo —pero sin limitarse a— pérdida de datos, brechas de seguridad o mal funcionamiento en producción.

```
MIT License

Copyright (c) 2026 Gonzalo A. Arenas Flores

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```