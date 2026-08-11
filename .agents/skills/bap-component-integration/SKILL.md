---
name: bap-component-integration
description: >-
  Guía la integración y personalización de componentes nativos del framework (bap-header, bap-footer, bap-dialog, bap-toast, etc.).
  Solicita al usuario la ubicación de destino en la página y la personalización permitida por el componente.
  Usar cuando el usuario desee incluir, modificar o configurar un componente nativo existente en una página.
---

# Integración de Componentes Nativos (`bap-component-integration`)

Esta skill orienta la inclusión y configuración de componentes nativos del catálogo `bap-*`.

---

## 🙋‍♂️ Paso 1: Consulta de Destino y Personalización

Antes de inyectar el código, pregunta al desarrollador:
1. **Destino**: "¿En qué página y contenedor HTML deseas ubicar el componente?"
2. **Personalización Permitida**: Consultar qué atributos o variantes necesita configurar segun la API del componente objetivo:
   - **`bap-header`**: Opciones de navegación, enlaces de menú, estado de usuario.
   - **`bap-footer`**: Texto de copyright, enlaces a políticas y redes sociales.
   - **`bap-dialog`**: Título del modal, botones de confirmación/cancelación, callback al cerrar.
   - **`bap-toast`**: Tipo de alerta (éxito, advertencia, error), mensaje y duración.

---

## 🛠️ Paso 2: Inyección de Marcado e Inicialización

1. Insertar la etiqueta del componente en la ubicación acordada del HTML de la página.
2. Configurar las propiedades o escuchadores de eventos en el archivo `index.js` correspondiente.
3. Verificar que los textos del componente se vinculen a tokens del diccionario i18n (`src/_main/i18n/es-ES.js`).

---

## 🧪 Paso 3: Validación con Pruebas Unitarias

1. Ejecutar las pruebas unitarias de la página o componente modificado:
   ```bash
   npm run test
   ```
