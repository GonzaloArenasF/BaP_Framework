# Vistas y Páginas de la Aplicación

Este directorio alberga los archivos HTML, CSS y JS de las vistas de usuario que estructuran la interfaz de la aplicación.

---

## Estructura de Carpetas para Páginas y Subpáginas

Para mantener el enrutamiento limpio y escalable, BaP Framework sigue una convención estricta:

1. **Cada Página es un Directorio Nuevo**: 
   Cada vista principal debe crearse dentro de su propia carpeta en `./src/pages/` (por ejemplo, `./src/pages/home/` o `./src/pages/login/`).
2. **Subpáginas Anidadas**: 
   Si deseas estructurar rutas anidadas o subpáginas (ej. `/admin/dashboard`), debes crearlas como **subdirectorios** dentro de la carpeta de la página padre (ej. `./src/pages/admin/dashboard/`).
3. **Mapeo de Rutas (`routes.appRoutes`)**: 
   La ruta física y su configuración de acceso deben registrarse bajo `routes.appRoutes` en el archivo maestro [./bap.config.json](./bap.config.json) para que el compilador Gulp la integre en el mapa de navegación (`routerPaths.js`).
4. **Registro de Analíticas (`analytics.customEvents`)**: 
   Cada página debe contar con un evento de entrada tipo `enter_page` registrado bajo `analytics.customEvents` en [./bap.config.json](./bap.config.json), el cual debe importarse y dispararse en el archivo `index.js` al cargarse la ventana (`window.onload`).
5. **Uso Obligatorio de i18n para Textos Estáticos**: 
   Todas las páginas y subpáginas que contengan textos estáticos deben configurarse utilizando el sistema de traducción e internacionalización (i18n). No se permiten textos crudos o hardcoded en el HTML. El contenido estático debe declararse en el archivo central [./src/_main/i18n/es-ES.js](./src/_main/i18n/es-ES.js) y vincularse con tokens `{page.nombre_pagina.cuerpo.item}`.
6. **Inclusión Obligatoria de Metadatos y SEO**: 
   Cada página debe incluir la sección completa de metadatos SEO en su cabecera `<head>` (descripción, palabras clave, canonical URL, favicons y las etiquetas para redes sociales Open Graph y Twitter Cards) utilizando tokens de i18n para sus textos.

---

## Recursos Disponibles en las Páginas y Cómo Incorporarlos

Al crear o modificar una página, tienes acceso al ecosistema completo del framework. Los recursos se incorporan mediante los siguientes métodos:

### 1. Custom Web Components (UI)
Cualquier Custom Element registrado en el core de BaP (ubicado en [./src/_components/](./src/_components/README.md)) puede declararse directamente como una etiqueta estándar en el archivo HTML de la página:
```html
<bap-header></bap-header>
<main>
  <bap-logo></bap-logo>
  <h1>Mi Nueva Vista</h1>
  <bap-spinner></bap-spinner>
</main>
<bap-footer></bap-footer>
```
* **Incorporación**: El motor de registro dinámico en [./src/_components/customComponentsRegistration.js](./src/_components/customComponentsRegistration.js) detecta la conexión de estas etiquetas al DOM y descarga asíncronamente sus respectivas plantillas HTML y hojas de estilo CSS.

### 2. Estilos Visuales del Sistema de Diseño (CSS)
Las páginas heredan automáticamente la tipografía y los estilos globales de [./src/style/](./src/style/README.md) mediante el archivo central [./src/index.css](./src/index.css):
- **Temas Claro/Oscuro**: Utiliza variables de color (`var(--bap-color-...)`) definidas en [./src/style/colors.css](./src/style/colors.css).
- **Formularios y Títulos**: Usa clases de formularios (`.bap-form`) y jerarquías tipográficas definidas en [./src/style/forms.css](./src/style/forms.css) y [./src/style/titles.css](./src/style/titles.css).

### 3. Lógica del Núcleo (APIs de JS)
Si la página requiere lógica avanzada (autenticación, analíticas, almacenamiento de datos, traducción), se pueden importar y consumir módulos directamente de [./src/_main/](./src/_main/README.md) en el archivo JS de la página:
- **Persistencia Segura (Criptografía)**: Importar funciones criptográficas de [./src/_main/storage.js](./src/_main/storage.js).
- **Acciones del Enrutador**: Importar transiciones controladas de [./src/_main/router.js](./src/_main/router.js).
- **Manejo de Sesión**: Validar roles utilizando [./src/_main/auth.js](./src/_main/auth.js).

---

## Compilación y Procesamiento (Build)

Durante el pipeline de construcción de Gulp ([./gulpfile.js](./gulpfile.js)):
- Los archivos HTML de las páginas se procesan para minificar el tamaño del bundle.
- Se inyectan tokens en tiempo de compilación (como `{APP_VERSION}`).
- El código JS se optimiza y ofusca en el directorio de salida `./public/` antes del despliegue en Firebase Hosting.
