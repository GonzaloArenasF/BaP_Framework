# Diccionarios de Idiomas (Internacionalización)

Este directorio alberga los diccionarios de traducciones e internacionalización (i18n) en formato estructurado de JavaScript para dar soporte multi-idioma a la aplicación.

## Contexto de los Archivos

Los archivos en `./src/_main/i18n/` definen los textos legibles de la interfaz:
- [./src/_main/i18n/es-ES.js](./src/_main/i18n/es-ES.js): Diccionario en español que estructura los textos para vistas comunes, diálogos, barra de navegación, pie de página, notificaciones y errores del sistema de enrutamiento.
- `./src/_main/i18n/index.html`: Plantilla de índice para mapear o registrar los lenguajes soportados por el motor de internacionalización.

## Sinergia con el Directorio Padre

- Este subdirectorio sirve de almacenamiento estático para el orquestador de internacionalización [./src/_main/i18n.js](../README.md).
- El motor carga de forma asíncrona estos diccionarios según el lenguaje detectado en el navegador del usuario (`navigator.language`) o el parámetro manual configurado en la sesión.

## Referencias Cruzadas e Integración

- **Consumo en Componentes**: Las etiquetas de botones de cambio de tema ("Light" / "Dark") en `<bap-header>` ([./src/_components/bap-header/](../../_components/bap-header/README.md)) y los textos de contacto del pie de página `<bap-footer>` ([./src/_components/bap-footer/](../../_components/bap-footer/README.md)) se obtienen resolviendo claves contra estos diccionarios en tiempo de ejecución.
- **Pruebas de Traducción**: La integridad y la existencia de claves obligatorias se validan en el test de integración [./test/](./test/README.md).
- **Procesamiento de Compilación**: Gulp empaqueta estos archivos de idiomas optimizándolos en el bundle final de la carpeta pública de producción `./public/` configurado en [./gulpfile.js](./gulpfile.js).
