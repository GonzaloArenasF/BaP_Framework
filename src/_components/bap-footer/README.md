# Componente `<bap-footer>` (Pie de Página)

El componente `<bap-footer>` renderiza un pie de página corporativo estandarizado y localizado en base a los diccionarios de internacionalización e inyección de versión de sistema.

---

## Ficha Técnica y Atributos

Este componente **no recibe atributos HTML** directos. En su lugar, lee las propiedades globales e internas del core de forma dinámica:

- **Versión de la App**: Se obtiene de `CONSTANT.APP_VERSION` en tiempo de ejecución.
- **Enlace de Contacto**: Se resuelve usando `CONSTANT.SOCIAL_MEDIA.EMAIL.URL`.
- **Traducciones**: Consume de forma síncrona el diccionario de componentes `bapFooter`.

---

## Optimización de Compilación (Desarrollo vs Producción)

- **Entorno de Desarrollo (`CONSTANT.IS_PROD: false`)**: El componente lee de forma asíncrona la plantilla HTML y realiza los reemplazos de placeholders (`{APP_VERSION}`, `{brandDesc}`, etc.) dinámicamente en el cliente.
- **Entorno de Producción (`CONSTANT.IS_PROD: true`)**: Para optimizar el rendimiento y evitar cálculos redundantes en el navegador, el pipeline de Gulp en [./gulpfile.js](./gulpfile.js) realiza los reemplazos de tokens en tiempo de compilación y empaqueta el componente estáticamente. En este entorno, `preRender` se anula a nivel de cliente.

---

## Ejemplos de Uso

### Ejemplo 1: Declaración en HTML
Agrega el pie de página de manera simple al final de tus layouts:
```html
<body>
  <!-- Contenido de la página -->
  <bap-footer></bap-footer>
</body>
```

### Ejemplo 2: Inyección Dinámica
```javascript
const footer = document.createElement("bap-footer");
document.body.appendChild(footer);
```

---

## Integraciones y Referencias Cruzadas

- **Diccionarios de Idiomas**: Consume los textos traducidos desde el archivo de traducción activa (por ejemplo, [./src/_main/i18n/es-ES.js](./src/_main/i18n/es-ES.js)).
- **Orquestador Gulp**: Compilado y pre-procesado usando las configuraciones en [./bap.config.json](./bap.config.json) y [./gulpfile.js](./gulpfile.js).
- **Pruebas unitarias**: Su carga en el DOM se verifica en [./test/_components/simple-components.test.js](./test/_components/simple-components.test.js).
