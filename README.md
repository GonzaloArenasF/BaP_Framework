# BaP Framework - v2.3.5

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
> Para activar la integración, crea un proyecto en Firebase. Luego, copia el archivo `./.env.example` como `./.env.development` y `./.env.production` en la raíz del proyecto, completa las credenciales con los valores de tu proyecto Firebase y establece la variable `FIREBASE_AVAILABLE` en `true` o `false` según el entorno.
> 
> ⚠️ Los archivos `./.env.*` (incluyendo `./.env.development` y `./.env.production`) están en `.gitignore` y **nunca deben subirse al repositorio**. El archivo `./.env.example` sirve como plantilla de referencia.
> 
> 🔒 **Autodetección de Seguridad**: En entornos públicos y de producción, el framework realiza una autodetección automática del entorno evaluando `window.location.hostname`. Si detecta un hostname no local y existen credenciales en el bundle, habilitará Firebase automáticamente para prevenir omisiones accidentales del bypass local.

---

## 📂 Estructura del Repositorio (Índice de Navegación)

Te invitamos a explorar las distintas carpetas del repositorio para comprender a detalle su funcionamiento y capacidades técnicas. Cada directorio contiene su propio archivo de documentación técnica orientada a desarrolladores e IA:

*   📂 [./cdn/](./cdn/README.md) - Canal de distribución paralela de recursos estáticos pesados en Firebase Hosting (Multisite).
*   📂 [./docs/](./docs/README.md) - Guías técnicas generales, plan de pruebas y auditorías de seguridad del sistema.
*   📂 [./src/](./src/README.md) - Código fuente de desarrollo de la aplicación (vistas, componentes y estilos).
    *   📂 [./src/assets/](./src/assets/README.md) - Recursos locales (favicons, logotipos e imágenes corporativas).
    *   📂 [./src/pages/](./src/pages/README.md) - Páginas independientes y reglas de ruteo/anidación.
    *   📂 [./src/style/](./src/style/README.md) - Sistema de diseño visual y hojas de estilos base (colores, fuentes y formularios).
    *   📂 [./src/_components/](./src/_components/README.md) - Registro centralizado y especificaciones técnicas detalladas de los Custom Components.
    *   📂 [./src/_main/](./src/_main/README.md) - Columna vertebral lógica del framework (Enrutador, Seguridad, Cifrado y Traducción).
        *   📂 [./src/_main/i18n/](./src/_main/i18n/README.md) - Diccionarios de internacionalización asíncronos.
*   📂 [./test/](./test/README.md) - Suite de pruebas unitarias y de integración sobre JSDOM con mocks de Firebase.

---

## ⚙️ Configuración Centralizada (`./bap.config.json`)

BaP Framework aísla completamente la lógica del negocio de la configuración del proyecto a través del archivo maestro `./bap.config.json`. Al ubicar esta configuración fuera del directorio `./src/`, aseguramos que los desarrolladores puedan personalizar y escalar la aplicación sin riesgo de alterar el código fuente del núcleo.

### Características Claves de la Configuración:
1. **JSON Unificado**: Funciona como la única fuente de verdad. Gulp se encarga de leer el archivo en tiempo de construcción (build time) y de inyectar los valores como tokens (`%%BAP_*%%`) directamente en memoria, logrando una carga ultrarrápida en el cliente sin requerir llamadas AJAX adicionales.
2. **Rutas Dinámicas (`routes`)**: 
   * `appRoutes`: Permite declarar el mapa de URLs públicas e internas de la vista.
   * `realtimeDatabaseRoutes`: Define las ramas de conexión para la Firebase Realtime Database.
3. **Telemetría Extendida (`analytics.customEvents`)**: Añade o sobrescribe de forma declarativa los eventos customizados que reportarás a Firebase Analytics. El módulo `./src/_main/analytics.js` mapeará automáticamente estas entradas para crear funciones ejecutables. Al crear una nueva página, debe registrarse su respectivo evento de entrada (tipo `enter_page`) aquí y ser invocado en su script de inicialización (`index.js`).
4. **Convención de Nomenclatura para Web Components**:
   * Todos los componentes habitan dentro de la carpeta `./src/_components/`.
   * **Componentes Nativos (Core)**: Están estandarizados e integrados bajo el prefijo `bap-` (ej. `bap-dialog`, `bap-header`).
   * **Componentes Personalizados**: Como desarrollador, puedes crear e incluir tus propios Custom Elements utilizando prefijos diferentes al core. Define el registro de tus componentes en el archivo `./bap.config.json` para que el compilador Gulp genere automáticamente las inyecciones de HTML y CSS en la ruta adecuada de la carpeta pública.

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
*   **Modo Claro / Modo Oscuro**: Variables CSS estructuradas y documentadas dentro de `./src/style/colors.css` para un control total de la interfaz.

### 📐 Arquitectura de Estilos y CSS

Para asegurar la escalabilidad visual y legibilidad, se siguen tres directivas estrictas de diseño:
1.  **Estilos Reutilizables**: Todas las clases genéricas y variables globales residen centralizadas en el directorio `src/style/`.
2.  **Estilos Propios y Aislados**: Solo si un estilo pertenece de manera única a una página específica o componente de interfaz, se definirá en su CSS local correspondiente (ej. `index.css` de la carpeta local).
3.  **Cero Estilos Inline**: Nunca se utilizan estilos inline (`style="..."`) en el código HTML de desarrollo.

### 🌐 Internacionalización y Textos Estáticos (i18n)

Para mantener la consistencia multilingüe y un código fuente maquetado de forma profesional, se implementa una directiva estricta de localización:
*   **Prohibición de Textos Hardcoded**: Ninguna página o subpágina del proyecto debe contener cadenas de texto estático directamente codificadas en sus archivos HTML.
*   **Centralización en Diccionario**: Todos los textos descriptivos, títulos y metadatos SEO deben declararse bajo el diccionario estructurado [./src/_main/i18n/es-ES.js](./src/_main/i18n/es-ES.js).
*   **Tokens en HTML**: En el maquetado HTML se referenciarán estos textos utilizando tokens formados por llaves (ej: `{page.mi_pagina.body.desc}`). El motor de compilación Gulp en conjunto con el cargador asíncrono se encargarán de inyectar y resolver estas traducciones.
*   **Metadatos y SEO Obligatorios**: Toda página creada debe incluir el bloque estructurado de metadatos en su etiqueta `<head>` para la optimización de motores de búsqueda (SEO) y tarjetas de redes sociales (Open Graph y Twitter Cards). Las descripciones, palabras clave y títulos de estos tags deben enlazarse a tokens de traducción de i18n.

---

## 💻 Patio de Pruebas e Interactividad Local

La página de inicio principal (`./src/index.html`) sirve como un **Patio de Pruebas interactivo en tiempo real**. Los desarrolladores pueden levantar el servidor local e interactuar directamente con la visualización responsiva de Custom Elements y las alertas visuales en caliente.

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
> Antes de compilar para producción, asegúrate de que el archivo `./.env.production` existe en la raíz del proyecto con las credenciales de Firebase completas. Cópialo desde `./.env.example` si es la primera vez.

El script de optimización automatiza las siguientes tareas:
1.  **Minificación HTML**: Limpia y reduce el tamaño de los archivos `.html` reemplazando dinámicamente marcas de variables (como `{APP_VERSION}` y entornos de producción).
2.  **Procesamiento CSS**: Consolida y minifica las hojas de estilos de componentes y generales.
    *   *Source Maps Condicionales*: Gulp detecta si el build es para producción (`IS_PROD: true`) y, si es así, deshabilita la generación de mapas de origen (`.map`) para evitar la exposición de código original en producción y reducir el peso del bundle.
3.  **Inyección de credenciales**: Lee el archivo `./.env` correspondiente al script e inyecta las credenciales de Firebase y entornos en los archivos `.js` reemplazando los tokens `%%NOMBRE%%` definidos en `./src/_main/constants.js`.
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