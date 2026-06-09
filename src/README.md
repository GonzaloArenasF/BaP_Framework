# Código Fuente del Aplicativo (Desarrollo)

Este directorio contiene el código fuente de desarrollo limpio y estructurado. Aquí es donde se escribe toda la lógica, componentes, estilos e interactividad antes de ser procesados por la automatización de compilación.

## Contexto del Directorio

Los archivos contenidos directamente en la raíz de `./src/` actúan como puntos de entrada y recursos globales de la aplicación:
- [./src/index.html](./src/index.html): La plantilla HTML base que sirve como patio de pruebas interactivo local de los componentes.
- [./src/index.js](./src/index.js): Punto de arranque (bootstrap) de JavaScript que importa las constantes globales, el orquestador de componentes y activa la traducción y enrutamiento inicial.
- [./src/index.css](./src/index.css): El puente CSS que importa las definiciones de la paleta de colores y la tipografía.
- [./src/404.html](./src/404.html), [./src/404.js](./src/404.js), [./src/404.css](./src/404.css): Páginas de manejo y visualización ante fallos de enrutamiento o páginas inexistentes.
- [./src/robots.txt](./src/robots.txt): Configuración SEO para indexación por motores de búsqueda.

## Sinergia con el Directorio Padre

Este directorio depende directamente de la configuración centralizada en la raíz del proyecto:
- La lógica de arranque requiere tokens de compilación definidos en `./.env.*` e inyectados por Gulp.
- Se compila en una estructura optimizada, minificada y ofuscada para producción dentro del directorio de distribución `./public/` (el cual está en `./.gitignore`).

## Sinergia con Subdirectorios

El código de entrada orquesta de forma unificada el flujo de los siguientes subdirectorios:
- [./src/_components/](./src/_components/README.md): Elementos visuales personalizados (Custom Elements) reutilizables.
- [./src/_main/](./src/_main/README.md): Columna vertebral y lógica funcional del framework.
- [./src/assets/](./src/assets/README.md): Identidad visual corporativa de la marca.
- [./src/pages/](./src/pages/README.md): Páginas independientes de vistas de usuario.
- [./src/style/](./src/style/README.md): Hojas de estilo globales, fuentes y paletas de colores.

## Referencias Cruzadas e Integración

- **Compilador Gulp**: El archivo [./gulpfile.js](./gulpfile.js) y [./gulp-imports.js](./gulp-imports.js) de la raíz leen los recursos de `./src/`, procesan sus variables y generan el bundle de distribución.
- **Configuración Maestra**: Las rutas declaradas en [./bap.config.json](./bap.config.json) mapean directamente a los archivos contenidos en `./src/pages/` y `./src/_components/`.
