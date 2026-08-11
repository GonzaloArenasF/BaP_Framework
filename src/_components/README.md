# Componentes Web Reutilizables (Custom Elements)

Este directorio alberga la colección de componentes web nativos de la interfaz (Custom Elements) construidos bajo los estándares de W3C, aislados y modulares.

## Contexto del Directorio

El directorio centraliza el registro e instanciación de los componentes de la interfaz de usuario:
- [./src/_components/customComponentsRegistration.js](./src/_components/customComponentsRegistration.js): Orquestador central que define la función `setCustomComponents()` para declarar los componentes en el DOM de forma dinámica. Expone la función de soporte `createCustomComponent()` para inicializar, inyectar el Shadow DOM o cargar asíncronamente las plantillas HTML y hojas de estilo CSS locales.
- [./src/_components/index.html](./src/_components/index.html): Documento de mapeo que lista o previsualiza los Custom Elements declarados en el framework.

## Sinergia con el Directorio Padre

- Los componentes desarrollados aquí proveen la interactividad y la interfaz visual para las páginas y layouts contenidos en [./src/](./src/README.md).
- Su registro y carga asíncrona se configuran fuera de la lógica del núcleo, asegurando modularidad.

## Sinergia con Subdirectorios

Este directorio agrupa los 9 componentes de interfaz especializados, cada uno conteniendo su respectivo archivo JS, plantilla HTML y hoja de estilos CSS. Accede a la documentación técnica detallada de cada componente para conocer sus parámetros y ejemplos de código:
- [./src/_components/bap-chip/](./src/_components/bap-chip/README.md): Etiquetas de estado.
- [./src/_components/bap-dialog/](./src/_components/bap-dialog/README.md): Ventanas modales premium.
- [./src/_components/bap-footer/](./src/_components/bap-footer/README.md): Pie de página localizado.
- [./src/_components/bap-header/](./src/_components/bap-header/README.md): Barra de navegación y temas.
- [./src/_components/bap-loading-state/](./src/_components/bap-loading-state/README.md): Bloqueador de carga.
- [./src/_components/bap-logo/](./src/_components/bap-logo/README.md): Renderizador del logotipo de marca.
- [./src/_components/bap-notification/](./src/_components/bap-notification/README.md): Sistema Toast y errores.
- [./src/_components/bap-spinner/](./src/_components/bap-spinner/README.md): Loader circular animado.
- [./src/_components/bap-svg-image/](./src/_components/bap-svg-image/README.md): Biblioteca e inyector de vectores SVG.

## 🤖 Desarrollo de Componentes Asistido con IA (Skills)

El desarrollo y la integración de Web Components en BaP Framework están potenciados por dos habilidades de IA ejecutables ubicadas en `.agents/skills/`:

### `bap-component-creator` (Creación de Custom Components)
- **Propósito**: Crea un nuevo Web Component aislado respetando la regla estricta de prefijos (el prefijo `bap-` está **reservado exclusivamente para el core**; para componentes de aplicación sugiere o consulta prefijos personalizados como `app-` o `sys-`).
- **Publicación Automática**: Registra el nuevo componente en `src/_components/customComponentsRegistration.js` y en `bap.config.json`, genera sus pruebas unitarias iniciales en `test/components/` y actualiza la documentación interactiva en `src/pages/components/index.html`.
- **Ejemplo de Uso / Prompts**:
  > *"Crea un nuevo componente de tarjeta de usuario `<app-user-card>`"*  
  > *"Genera un Custom Element para un botón con contador e incluye sus tests unitarios"*

---

## Referencias Cruzadas e Integración

- **Configuración Centralizada**: Todos los Custom Elements de desarrollo se definen en el archivo [./bap.config.json](./bap.config.json) y se definen dinámicamente en [customComponentsRegistration.js](./customComponentsRegistration.js).
- **Suite de Pruebas**: La correcta instanciación en el árbol del DOM y ciclo de vida de los componentes se validan en el directorio de pruebas [./test/](./test/README.md).
- **Core lógico**: Los componentes consumen utilidades comunes (ej. sanitización de inputs y de traducciones) proporcionadas por el módulo [./src/_main/i18n.js](./src/_main/i18n.js) y constantes en [./src/_main/constants.js](./src/_main/constants.js).
