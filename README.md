# BaP Framework - v2.2.3

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
> Para activar la integración, crea un proyecto en Firebase. Luego, copia el archivo `.env.example` como `.env` en la raíz del proyecto, completa las credenciales con los valores de tu proyecto Firebase, y establece la constante `CONSTANT.FIREBASE_AVAILABLE` en `true` en `src/_main/constants.js`.
> 
> ⚠️ El archivo `.env` está en `.gitignore` y **nunca debe subirse al repositorio**. El archivo `.env.example` sirve como plantilla de referencia.

---

## 📂 Estructura de Archivos

La arquitectura del framework se organiza de manera clara y altamente modular:

```
├── cdn/                                  # Hosting paralelo para recursos estáticos pesados
├── public/                               # Directorio autogenerado con código optimizado para producción
├── src/                                  # Código fuente de desarrollo
│   ├── _components/                      # Componentes Web personalizados (Custom Elements)
│   │   ├── bap-chip/                     # Componente etiqueta (chip)
│   │   ├── bap-dialog/                   # Modal premium con glassmorphism [NUEVO]
│   │   ├── bap-footer/                   # Pie de página estándar de la aplicación
│   │   ├── bap-header/                   # Cabecera estándar con control de sesión
│   │   ├── bap-loading-state/            # Estado visual de carga
│   │   ├── bap-logo/                     # Identidad visual de la marca [NUEVO]
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
Despliega la identidad visual corporativa.
*   **Comportamiento Adaptativo**: Carga la ruta declarada en `CONSTANT.LOGO_URL` (p. ej. `/assets/bap-framework-logo.png`).
*   **SVG Fallback**: Si no se define una URL de logotipo, el componente renderiza un logotipo SVG premium vectorial y escalable adaptado al modo activo (claro/oscuro).

#### 2. `<bap-dialog>`
Modal flotante premium para interacciones detalladas.
*   **Atributos**:
    *   `id`: Identificador único (se autogenera si se omite).
    *   `title-top`: Categoría o texto pequeño arriba.
    *   `title-main`: Título de gran tamaño.
    *   `title-sub`: Subtítulo complementario.
    *   `image-header-left`: URL de la imagen decorativa del encabezado izquierdo.
    *   `image-header-right`: URL de la imagen decorativa del encabezado derecho.
    *   `image-detail`: Imagen principal del cuerpo.
    *   `link-url-base64` y `link-text-base64`: Enlace y texto del botón de acción codificados en Base64 para seguridad y prevención de scraping.
*   **Interactividad**: Implementa animación de entrada escalada, difuminado de fondo (`backdrop-filter`) tipo Glassmorphism, desactivación automática del scroll del cuerpo y cierre seguro al hacer clic fuera del modal o en el botón de cierre.

#### 3. `<bap-svg-image>`
Gestor estandarizado de vectores SVG para evitar peticiones HTTP excesivas.
*   **Atributos**:
    *   `name`: Nombre del icono (p. ej., `chevronLeft`, `menu`, etc., definidos en `icons.js`).
    *   `size`: Tamaño predefinido (`xs`, `s`, `m`, `l`, `xl`).
    *   `mobile-size`: Tamaño alternativo para dispositivos móviles.
    *   `type`: Categoría de recurso (por defecto `icon`).

#### 4. `<bap-notification>`
Sistema de alertas tipo Toast y Snackbar.
*   **Aislamiento CSS**: Inyecta su hoja de estilos directamente en el Shadow Root en tiempo de ejecución, previniendo fugas o colisiones de diseño con estilos globales de la página.

---

## 🗺️ Motor de Enrutamiento (Routing Engine)

El módulo `router.js` administra de forma centralizada la navegación de la aplicación:

1.  **Transición Controlada (`goTo(route, params)`)**: Recibe un objeto de ruta definido en `routerPaths.js` y parámetros opcionales que formatea dinámicamente en un query string.
2.  **Carga Dinámica**: Inyecta dinámicamente la etiqueta del componente de la página seleccionada dentro del contenedor `<main>` del DOM sin recargar la página entera.
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
# 1. Iniciar el servidor local de desarrollo con hot-reload
npm run server

# 2. Compilar, minificar y ofuscar el código para producción
npm run optimize

# 3. Desplegar en el canal de pruebas (QA) de Firebase
npm run deploy-qa

# 4. Desplegar en el entorno productivo de Firebase
npm run deploy-prod
```

### Proceso de Gulp (`npm run optimize`)

> [!IMPORTANT]
> Antes de compilar para producción, asegúrate de que el archivo `.env` existe en la raíz del proyecto con las credenciales de Firebase completas. Cópialo desde `.env.example` si es la primera vez.

El script de optimización automatiza las siguientes tareas:
1.  **Minificación HTML**: Limpia y reduce el tamaño de los archivos `.html` reemplazando dinámicamente marcas de variables (como `{APP_VERSION}` y entornos de producción).
2.  **Procesamiento CSS**: Consolida y minifica las hojas de estilos de componentes y generales.
3.  **Inyección de credenciales**: Lee el archivo `.env` e inyecta las credenciales de Firebase en los archivos `.js` reemplazando los tokens `%%NOMBRE%%` definidos en `constants.js`.
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