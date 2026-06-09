# Pruebas Unitarias y de Integración (Testing Suite)

Este directorio contiene la suite completa de pruebas unitarias y de integración del framework, estructurada como un espejo de la carpeta de código fuente de desarrollo.

## Contexto de los Archivos y Subdirectorios

Los recursos de este directorio se encargan de validar el correcto comportamiento de la aplicación:
- [./test/setup.js](./test/setup.js): Archivo de configuración inicial para la suite de pruebas. Configura el entorno virtual del navegador utilizando **JSDOM**, registra mocks globales (como `window.location` y APIs Web de cifrado) y prepara el entorno para las aserciones de Custom Elements.
- `./test/mocks/`: Contiene emuladores del SDK de Firebase (`firebase-auth.mock.js`, `firebase-database.mock.js`, etc.) para simular respuestas de red de forma segura.
- `./test/_components/`: Suite de pruebas unitarias dedicadas a los Custom Elements (ej. `bap-dialog.test.js`, `bap-logo.test.js`), validando su renderizado en JSDOM y actualización ante cambios de atributos.
- `./test/_main/`: Pruebas de lógica funcional para el núcleo (ej. `router.test.js`, `storage.test.js`, `util.test.js`, `i18n.test.js`).
- `./test/pages/`: Pruebas unitarias y de integración para los scripts de carga e inicialización de cada página y subpágina (ej. `components.test.js`, `style.test.js`, `build.test.js`).

---

## Referencias Cruzadas e Integración

- **Configuración del Motor de Pruebas**: El motor de ejecución es gestionado por [./vitest.config.js](./vitest.config.js) en la raíz del proyecto.
- **Relación Espejo con Código Fuente**: Los tests en `./test/_components/` y `./test/_main/` validan directamente los archivos de desarrollo localizados en [./src/_components/](./src/_components/README.md) y [./src/_main/](./src/_main/README.md) respectivamente.
- **Pipeline de Automatización**: El archivo [./gulpfile.js](./gulpfile.js) y los comandos en [./package.json](./package.json) permiten ejecutar los tests (`npm run test`) y medir la cobertura de código (`npm run test:coverage`).
