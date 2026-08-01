# Plan de Migración Asistida por IA - Estrategia de Limpieza y Portado Completo (Oficial)

Este documento detalla la estrategia de migración genérica y reutilizable para la actualización automatizada de proyectos legacy hacia BaP Framework v2.4.0. Consiste en aislar el proyecto legacy, instalar una base limpia del framework, depurar el boilerplate de fábrica y reconstruir el sitio importando selectivamente los recursos originales.

## 1. Reglas de Oro, Integridad de Git e I18n
- **Ubicación de los cambios:** Todas las modificaciones se realizarán exclusivamente en el repositorio del **proyecto legacy**. No se modificará el core de `BaP_Framework`.
- **Aislamiento en Git:** Antes de realizar cualquier acción, el orquestador creará una rama aislada de Git (`refactor/bap-migration-ia`) partiendo de `main` en el proyecto legacy.
- **Origen del Framework:** La copia de `BaP_Framework` a utilizar debe ser extraída de la rama `main` del framework.
- **Limpieza de Reportes en Reinicios:** Cada vez que el proceso sea reiniciado, se deben eliminar físicamente todos los reportes de etapa anteriores generados en el directorio `docs/` del proyecto legacy.

---

## 2. Flujo de Trabajo y Aprobación por Etapas
La migración se dividirá en 8 etapas secuenciales. Al finalizar cada etapa, el orquestador pausará su ejecución, emitirá un reporte detallado en `docs/` del proyecto legacy y esperará la confirmación explícita del usuario antes de continuar.

---

## 3. Etapas de la Migración

### Etapa 1: Aislamiento, Respaldo y Limpieza del Legacy
* **Objetivo:** Guardar todos los archivos actuales del proyecto legacy en un directorio temporal y asegurar la limpieza absoluta del espacio raíz (sin realizar ninguna copia de BaP Framework en este punto).
* **Acciones Críticas:**
  1. Asegurar la creación de la rama limpia `refactor/bap-migration-ia` partiendo estrictamente de la rama `main` del proyecto legacy.
  2. Eliminar físicamente todos los reportes de etapa anteriores generados en el directorio `docs/` del proyecto legacy para evitar información residual.
  3. Crear un directorio temporal en la raíz del proyecto legacy llamado `legacy-temp/`.
  4. Mover **todos** los archivos y carpetas existentes en la raíz del proyecto legacy (excepto `.git/` y `legacy-temp/`) al interior de `legacy-temp/`.
  5. **Limpieza Absoluta de la Raíz:** Validar que la raíz del proyecto legacy haya quedado completamente vacía de cualquier otro archivo, eliminando de forma definitiva cualquier archivo o directorio residual que no sea `.git/` o `/legacy-temp/`.

### Etapa 2: Copia e Instalación Limpia de BaP
* **Objetivo:** Traer e instalar los archivos del framework de manera controlada y sin documentación intrusiva sobre la raíz previamente limpia y respaldada.
* **Acciones Críticas:**
  1. Copiar de manera íntegra todos los archivos de la rama `main` de `BaP_Framework` al directorio raíz del proyecto legacy.
     - *Seguridad de Git:* **Excluir explícitamente** el directorio `.git/` del framework de origen durante la copia para evitar corromper el repositorio local de Git del proyecto legacy.
     - *Exclusión de Documentación:* **Excluir explícitamente** todos los archivos README (archivos `.md`) del framework durante la copia, asegurando que la documentación del framework permanezca únicamente en su propio repositorio y evitando sobrescribir el `README.md` original del proyecto legacy (resguardado a salvo en `/legacy-temp/`).
  2. *Preservación de Estilos BaP:* Conservar una copia de referencia temporal del directorio `src/style/` original de `BaP_Framework` en memoria/temporal para poder comparar e integrar estilos nuevos en la Etapa 5.
  3. *Preservación de Ignorados:* Rescatar y combinar las reglas del archivo `.gitignore` original del proyecto legacy con las del framework.

### Etapa 3: Depuración del Boilerplate (Limpieza de BaP)
* **Objetivo:** Remover todas las páginas, estilos demo, rutas, dependencias de pruebas obsoletas y demostraciones que vienen por defecto con `BaP_Framework` antes de integrar el código legacy.
* **Acciones Críticas:**
  1. **Eliminar Páginas de Demostración y sus Recursos:** Borrar las páginas web de demostración (archivos HTML y sus respectivos archivos de estilos CSS y lógica JS) que vienen de fábrica con el framework.
  2. **Eliminar Rutas de Páginas:** Eliminar todas las páginas y directorios contenidos dentro del directorio de páginas (`src/pages/` u homólogo).
  3. **Remover Estilos Base de BaP:** Eliminar por completo el directorio de estilos (`src/style/` u homólogo) de la copia de BaP instalada, preparando el terreno para restaurar la carpeta de estilos original del legacy.
  4. **Eliminar Pruebas Unitarias de Fábrica:** Borrar todos los archivos de prueba existentes dentro del directorio de pruebas (`test/` u homólogo) de la plantilla de BaP.
  5. **Remover Dependencias de Testing Legacy en package.json:** Eliminar del archivo `package.json` todas las dependencias y configuraciones de Jest (como `jest` y `jest-environment-jsdom`) para estandarizar el entorno con la nueva metodología de Vitest provista por BaP.
  6. **Depuración de Configuraciones de Fábrica:** 
     - Remover las configuraciones particulares demo contenidas en el archivo de configuración del framework (ej. `bap.config.json`).
     - Vaciar el contenido de los archivos de variables de entorno (ej. archivos `.env`).
     - Eliminar el archivo de reporte de performance o auditoría residual (ej. `lh-report.json`).
     - Eliminar cualquier otro archivo descriptivo residual que provenga del framework.
  7. **Restricción de Compilación:** **NO** se debe ejecutar ningún comando de construcción o compilación en esta etapa.

### Etapa 4: Inventario y Declaración de Configuración
* **Objetivo:** Identificar los datos, variables e integraciones particulares del proyecto legacy y configurar los archivos correspondientes en la copia limpia de BaP.
* **Acciones Críticas:**
  1. **Configuración del Archivo del Framework:** Parametrizar el archivo de configuración del framework existente (ej. `bap.config.json`) con la información identificada del proyecto legacy resguardado en `/legacy-temp` (nombre del proyecto, versión, y la definición de páginas y componentes a procesar por el pipeline).
  2. **Configuración de Variables de Entorno:** Parametrizar los archivos `.env` con las credenciales de base de datos, API keys, endpoints y tokens identificados en el proyecto original.
  3. **Ajuste de Despliegue (firebase.json):** Auditar y ajustar las reglas de hosting del archivo `firebase.json` copiado de BaP (identificando el hosting target/site y asegurando que las reglas de redirecciones y rewrites se adapten al enrutamiento de páginas del legacy).
  4. Mapear la ubicación de assets y archivos de traducción del backup.
  5. **Verificación Previa de Idioma (i18n):** En el caso de proyectos bilingües/multilingües (ej: `es` y `en`), verificar si existen los diccionarios correspondientes en `_main/i18n`. Si existen los dos diccionarios (`es-ES.js` y `en-US.js`), se definirá obligatoriamente a `es-ES` (`esES` en `gulp-imports.js`) como el archivo de idioma principal e inyectado en tiempo de compilación para los reemplazos estáticos del pipeline de Gulp.
  6. **Inventariado de Rutas de Realtime Database (dbRoutes):** Escanear el archivo `storage.js` original del proyecto legacy (resguardado en `/legacy-temp`) para identificar todas las rutas de base de datos personalizadas utilizadas por la aplicación. Si existen rutas dinámicas (con parámetros), se deben mapear y declarar en `bap.config.json` bajo `routes.realtimeDatabaseRoutes` usando la sintaxis de placeholders `{param}` (ej. `"room": "/rooms/{roomId}"`) para que el compilador las procese de forma genérica.
  7. **Mapeo de Analítica Genérica:** Las claves de eventos declaradas bajo `analytics.customEvents` en `bap.config.json` deben coincidir exactamente (1 a 1) con los nombres de los métodos llamados en el código JS legacy (ej. `analytic.logEvent.miEvento()`). Esto asegura que el generador dinámico de `analytics.js` construya la API de analítica de forma genérica para cualquier proyecto sin tener que modificar su código fuente.
  8. **Restricción de Compilación:** **NO** se debe ejecutar ningún comando de construcción en esta etapa.

### Etapa 5: Reconstrucción e Inyección de Recursos
* **Objetivo:** Importar e inyectar de manera progresiva los estilos, assets, componentes y páginas desde `/legacy-temp` hacia la estructura de BaP, integrando los estilos del framework, preservando personalizaciones críticas y refactorizando el código legacy para ser soportado por la nueva versión de BaP.
* **Acciones Críticas:**
  1. **Restauración de Estilos Legacy:** Copiar de forma íntegra la carpeta de estilos (`src/style/` u homólogo) desde `legacy-temp/` a la raíz del proyecto.
  2. **Fusión No Destructiva de Estilos BaP:**
     - Analizar la carpeta de estilos original de `BaP_Framework` (preservada en la Etapa 2).
     - Identificar y copiar al directorio de estilos aquellos archivos nuevos del framework que no existan en el estilo del legacy.
     - Para los archivos de estilos que existan en ambos lados, identificar las nuevas reglas, clases o variables CSS del framework que no estén presentes en el archivo del legacy e inyectarlas al final de dichos archivos de forma limpia, sin modificar ni sobrescribir el diseño original del legacy.
  3. **Preservación de Componentes Identitarios:** Copiar y restaurar de forma íntegra el código HTML y los archivos CSS de componentes de identidad (como el encabezado, pie de página y logotipo del sitio) desde `legacy-temp/` a la nueva estructura, evitando que las plantillas demo del framework sobrescriban la personalización de la marca del proyecto legacy.
  4. **Assets:** Copiar la carpeta de assets/recursos estáticos del legacy a la nueva estructura.
  5. **Restauración de Documentación Original:** Recuperar el archivo `README.md` original del proyecto legacy desde `legacy-temp/` y colocarlo en la raíz del proyecto.
  6. **Estandarización de Archivos Estáticos:** Renombrar archivos de metadatos estáticos mal nombrados en la raíz (ej. renombrar `robot.txt` a `robots.txt` si existe) para asegurar que el pipeline de Gulp los reconozca y copie en el build.
  7. **Refactorización de Componentes y Páginas:**
     - Modificar el código fuente de los componentes personalizados y páginas del legacy para ser completamente soportados por la nueva versión de BaP (adaptando sintaxis de registro, ciclo de vida o APIs de la versión v2.4.0).
     - **Registro de Componentes Legacy:** Asegurar que si el proyecto legacy cuenta con Web Components particulares propios, estos queden debidamente importados e instanciados al final del método `setCustomComponents()` en `customComponentsRegistration.js`.
     - **Desempaquetado de Web Components (`postRender`):** Adaptar el código de los Web Components legacy (`pc-*` u otros) para que la inicialización de eventos o queries en `postRender` no dependa del nodo host element (ya que en la v2.4.0 se elimina del DOM). Se debe envolver el template en un contenedor interno principal con un ID único dinámico (`props.id`) y realizar las queries con `document.getElementById(props.id)`. **Importante:** El motor de inicialización de componentes (`createCustomComponent`) debe heredar dinámicamente el `id` original del host element en el contenedor `<div>` resultante para evitar que las referencias y llamadas a `.remove()` de componentes (como los loading states) arrojen excepciones `TypeError` al no encontrar el ID.
     - **Robustez en el Enrutamiento (`URLSearchParams`):** Reemplazar esquemas antiguos de parseo manual de URL (ej. `.split("?")[1]`) heredando directamente el enrutador estándar de la v2.4.0 (`src/_main/router.js`), que utiliza `URLSearchParams` para inyectar y leer parámetros de consulta de forma 100% segura frente a variables nulas o no definidas.
     - **Corrección de Rutas (goTo):** Buscar y actualizar en el código JavaScript de las páginas legacy cualquier llamada de enrutador que pase strings directos (ej: `goTo('/ruta')`) por su respectivo objeto de ruta estructurado (ej: `goTo(routes.ruta)`).
     - **Seguridad e Inmunidad XSS en DOM:** Reemplazar en los controladores de las páginas las mutaciones directas mediante `.innerHTML` de los metadatos o cuerpo de la página por el uso seguro y no destructivo de las APIs de traducción y tokens del DOM (ej: llamando a `replaceTokensInDOM` y `applyI18n`).
     - **Seguridad y Robustez en Componentes:** Reemplazar generadores de ID basados en lógica pseudoaleatoria (ej. `Math.random()`) por UUIDs nativos de la plataforma (ej. `crypto.randomUUID()`) y añadir mecanismos de cancelación (`AbortController` con timeout de 8000ms) a las peticiones asíncronas de templates (llamados `fetch`).
     - **Migración Criptográfica (AES-GCM):** Actualizar el gestor de almacenamiento local (`storage.js`) reemplazando codificaciones básicas (como `btoa()`) por criptografía AES-GCM (usando Web Crypto API nativa). Implementar un bloque `try-catch` para capturar errores de descifrado asimétrico y retornar `null` de forma limpia si hay sesiones heredadas con formatos antiguos.
     - **Estandarización de Referencias a Constantes:** Evitar SyntaxErrors al resolver módulos nativos ES causados por importaciones directas de propiedades de configuración individuales (como nombres de versión o de aplicación) que asumen un export nombrado de primer nivel desde constantes. En su lugar, se deben refactorizar de forma genérica para referenciarlas utilizando la constante global `CONSTANT` (ej. usar `CONSTANT.APP_VERSION` en lugar de importar `APP_VERSION` directamente).
     - **Centralización de Enums en CONSTANT.ENUM:** Agrupar todos los enums y diccionarios estáticos del sistema (tales como `USER_TYPE`) bajo la propiedad centralizada `CONSTANT.ENUM` en `constants.js`. Se deben refactorizar de manera genérica todas las importaciones e invocaciones independientes para referenciarlas a través de este objeto centralizado (ej. usar `CONSTANT.ENUM.USER_TYPE.ADMIN` en lugar de importar `USER_TYPE` desde otro módulo).
     - **Estandarización de reCAPTCHA:** Si el proyecto legacy referencia la clave de reCAPTCHA mediante `CONSTANT.RECAPTCHA.PROD.ID` (estructura de constantes legacy de entornos) en lugar de la firma simplificada `CONSTANT.RECAPTCHA.ID` de la v2.4.0, se deben refactorizar directamente las páginas y componentes del proyecto legacy para usar `CONSTANT.RECAPTCHA.ID`. Esto evita la redundancia de datos y mantiene el archivo `constants.js` limpio y unificado con los estándares del framework.
     - **Soporte Genérico para Rutas Dinámicas en Realtime Database (dbRoutes):** Si el proyecto legacy utiliza rutas parametrizadas o dinámicas en la Firebase Realtime Database (ej: `/rooms/${roomId}` o `/rooms/${roomId}/userStories/${userStoryId}`), se deben declarar estas rutas en `bap.config.json` bajo `routes.realtimeDatabaseRoutes` usando marcadores de posición `{param}` (ej. `"room": "/rooms/{roomId}"`). Asimismo, se debe refactorizar la lógica generadora de `dbRoutes` en `storage.js` del proyecto legacy para que reciba argumentos variables `(...args)` y reemplace dinámicamente dichos marcadores en orden, manteniendo la firma original de llamadas cliente sin requerir modificaciones complejas o manuales en las páginas.
     - **Inicialización Robusta de Firebase Realtime Database (bapDB):** Para evitar que el objeto de base de datos `bapDB` sea `null` e impida realizar operaciones de lectura/escritura (lanzando `TypeError` en `ref(bapDB, ...)`), se debe flexibilizar la condición de inicialización en `firebaseInit.js` para depender únicamente de `CONSTANT.FIREBASE_AVAILABLE` (ej: `export const bapDB = CONSTANT.FIREBASE_AVAILABLE ? getDatabase(bapFirebaseApp) : null;`). Esto permite que el SDK de Firebase realice la autorresolución nativa de la URL de base de datos si el entorno legacy no declara explícitamente un valor para `databaseURL` en su configuración de variables de entorno.
     - **Preservación de Utilidades y Helpers Legacy:** Al actualizar el archivo `util.js` (u otros archivos de utilidades/helpers) con la versión del framework, cualquier función o exportación del archivo original que no esté contemplada en la nueva versión del framework debe ser conservada en el archivo resultante para garantizar la compatibilidad de firmas y evitar SyntaxErrors de importación en las páginas y componentes legacy en runtime.
     - **Estandarización de Constantes de Navegación (Mayúsculas):** Para evitar discordancia de mayúsculas/minúsculas con el enrutamiento definido en `bap.config.json` (ej: `"navigation": "REDIRECT"`), se deben refactorizar las constantes `NAVIGATION_TYPES` de `routerPaths.js` para usar mayúsculas (`REDIRECT: "REDIRECT"`, `LOAD_COMPONENT: "LOAD_COMPONENT"`), permitiendo una coincidencia exacta y limpia.
     - **Sincronización del Motor de Traducción de Compilación (i18n):** Refactorizar el motor de compilación Gulp (`gulpfile.js`) para resolver y ejecutar las funciones de traducción de forma dinámica basada en el mapeo de `bap.config.json`, en lugar de usar un switch estático cableado. Actualizar los diccionarios de reemplazo en `gulp-imports.js` para corregir desalineaciones de tokens (soportando tanto tokens legacy como modernos) y validar post-build que no queden tokens `{...}` sin resolver en los archivos HTML generados.
  8. **Declaración de Telemetría:** Asegurar que todos los eventos de analíticas llamados en las páginas legacy estén declarados en `bap.config.json` bajo `analytics.customEvents` para evitar fallos de ejecución.
  9. **Internacionalización (i18n):** Copiar los diccionarios originales del proyecto legacy y corregir deudas técnicas (completar llaves faltantes que causen caídas silenciosas en el pipeline).
  10. **Páginas y Vistas:** Mudar los archivos HTML de las páginas reales al framework e inyectarles la estructura y marcas de traducción necesarias para el nuevo pipeline.
  11. **Restricción de Compilación:** **NO** se debe ejecutar ningún comando de construcción en esta etapa.

### Etapa 6: Prueba de Compilación y Calidad
* **Objetivo:** Ejecutar la compilación local del proyecto y certificar que la aplicación funciona idénticamente a la original bajo el motor v2.4.0.
* **Acciones Críticas:**
  1. Ejecutar instalación de dependencias (`npm install`) y optimización (`npm run optimize` o comando equivalente de construcción).
  2. Verificar que el build termine con éxito y que las traducciones dinámicas se inyecten de manera correcta en el HTML de salida.
  3. Ejecutar el servidor local y verificar la navegación de la aplicación de extremo a extremo.

### Etapa 7: Generación de Pruebas Unitarias
* **Objetivo:** Construir y programar la red de seguridad del proyecto a través de tests unitarios basados en el nuevo motor de pruebas de BaP.
* **Acciones Críticas:**
  1. Diseñar y escribir los archivos de pruebas unitarias dentro del directorio de pruebas (`test/` u homólogo) para validar la lógica del cliente y el correcto funcionamiento de los web components migrados.
  2. **Mocking Genérico de Dependencias de Red/CDN:** Para aislar las pruebas y evitar llamadas reales de red, configurar en Vitest (en `setup.js` o similar) un mock genérico para cualquier módulo de terceros que sea importado mediante CDN o módulos ES (ej: `html2pdf.js` u otros).
  3. Utilizar el motor de pruebas **Vitest** y la emulación de entorno **JSDOM** configurados en el framework.
  4. Validar la suite de pruebas ejecutando `npm run test` (o comando equivalente) y asegurar que todos los casos de prueba finalicen con éxito (`exit code 0`).

### Etapa 8: Estabilización y Limpieza Final
* **Objetivo:** Cerrar el ciclo de migración de forma segura, remover la basura temporal y consolidar la documentación del proyecto.
* **Acciones Críticas:**
  1. Eliminar permanentemente la carpeta `legacy-temp/` y todos sus archivos residuales.
  2. **Actualización de Documentación:** Modificar el archivo `README.md` original del proyecto legacy (restaurado en la raíz) para actualizar la versión del sistema y dejar constancia de la integración exitosa de BaP Framework v2.4.0.
  3. **Reglas de Entrega (Estrictas):**
     - **NO** realizar despliegues a la nube (entornos de QA o Producción).
     - **NO** ejecutar commits ni push a repositorios remotos.
     - Dejar el directorio Git local limpio de carpetas temporales, pero mostrando las modificaciones listas para la inspección visual del administrador de sistemas.

---

## 4. Estructura de Reportes
Al final de cada etapa, el orquestador generará un informe Markdown y lo guardará en `docs/` del proyecto legacy para transparentar cada paso del proceso antes de solicitar la aprobación del humano.
