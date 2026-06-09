# Sistema de Diseño y Hojas de Estilos (CSS)

Este directorio contiene las definiciones de estilo del framework, estructuradas de forma modular para establecer el lenguaje de diseño y la consistencia visual.

## Contexto de los Archivos

Los archivos CSS definen las reglas de visualización y maquetación de la aplicación:
- [./src/style/colors.css](./src/style/colors.css): Define las variables del sistema (Custom Properties) para las paletas de colores en modo claro (`.light-mode`) y oscuro (`.dark-mode`). Centraliza los colores primarios (Midnight Blue, Turquesa Eléctrico) y el estilo del viewport.
- [./src/style/main.css](./src/style/main.css): Establece la tipografía base (fuentes `Space Grotesk` y `Plus Jakarta Sans` desde Google Fonts), márgenes globales, transiciones fluidas y estructuras de scroll bar personalizadas.
- [./src/style/forms.css](./src/style/forms.css): Estandariza la estética y accesibilidad de elementos de formulario (cajas de texto, botones y placeholders).
- [./src/style/titles.css](./src/style/titles.css): Define la jerarquía y estética tipográfica de encabezados (`h1` a `h6`).

## Sinergia con el Directorio Padre

Las hojas de estilos son importadas colectivamente en [./src/index.css](./src/index.css), proporcionando la base estética requerida por todos los elementos de la interfaz de [./src/](./src/README.md).

## Reglas de Arquitectura CSS

Para mantener la coherencia y mantenibilidad del sistema visual, BaP Framework establece tres reglas fundamentales de obligatorio cumplimiento:

1. **Estilos Reutilizables**: Todos los estilos globales, de base, variables de diseño y utilidades generales del sistema deben ubicarse en este directorio (`./src/style/`).
2. **Estilos Específicos o Locales**: Solo si un estilo es 100% específico de un único componente o página web, se definirá dentro de su respectivo archivo CSS particular (ej. `src/pages/mi-pagina/index.css` o `src/_components/mi-componente/mi-componente.css`).
3. **Prohibición de Estilos Inline**: Nunca se deben utilizar estilos inline (`style="..."`) en las plantillas o archivos HTML del proyecto, garantizando la separación de responsabilidades y un código limpio.


## Referencias Cruzadas e Integración

- **Conmutación de Tema de Color**: El componente `<bap-header>` expuesto en [./src/_components/bap-header/](./src/_components/bap-header/README.md) interactúa directamente con `colors.css` al añadir o quitar la clase `.dark-mode` al elemento `<body>`, propagando los colores dinámicos por toda la UI.
- **Compilador Gulp**: La tarea de estilos en [./gulpfile.js](./gulpfile.js) concatena, añade prefijos del sistema y minifica estas hojas de estilo. En entornos productivos, deshabilita la generación de mapas de origen (Source Maps) para mayor seguridad y optimización de rendimiento.
