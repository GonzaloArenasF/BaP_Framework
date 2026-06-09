# Recursos Estáticos Locales (Assets)

Este directorio contiene las imágenes corporativas, favicons adaptativos y archivos de manifiesto para la optimización visual y compatibilidad como Progressive Web App (PWA).

## Contexto del Directorio

Los archivos contenidos en `./src/assets/` de forma estática proveen identidad visual y metadatos:
- `./src/assets/bap-framework-logo.png`: Imagen del logotipo principal del framework.
- `./src/assets/favicon.ico`, `./src/assets/favicon.svg`, `./src/assets/favicon-96x96.png`: Favicons adaptados a múltiples dispositivos y resoluciones de pantalla.
- `./src/assets/apple-touch-icon.png`: Icono optimizado para sistemas iOS cuando la app es añadida a la pantalla de inicio.
- `./src/assets/site.webmanifest`, `./src/assets/web-app-manifest-192x192.png`, `./src/assets/web-app-manifest-512x512.png`: Manifiestos de aplicación web que definen los colores, nombre y comportamiento de visualización para navegadores modernos y móviles.

## Sinergia con el Directorio Padre

Los assets de `./src/assets/` alimentan directamente a las vistas declaradas en [./src/](./src/README.md):
- Son incluidos en el encabezado `<head>` de [./src/index.html](./src/index.html) y páginas secundarias para definir la identidad del sitio web.

## Referencias Cruzadas e Integración

- **Componente Logotipo**: El componente `<bap-logo>` detallado en [./src/_components/bap-logo/](./src/_components/bap-logo/README.md) busca dinámicamente la ruta del logotipo apuntada en la constante global, la cual hace referencia a estos recursos.
- **Configuración de Versiones**: Las rutas y definiciones de los assets están expuestas en el archivo de configuración [./bap.config.json](./bap.config.json) en la raíz del proyecto.
- **Copias de Compilación**: Gulp copia este directorio íntegramente a `/public/assets/` durante la ejecución de los comandos de optimización detallados en [./gulpfile.js](./gulpfile.js).
