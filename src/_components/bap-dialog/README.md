# Componente `<bap-dialog>` (Modal Premium)

El componente `<bap-dialog>` implementa una ventana modal premium interactiva con diseño de difuminado de fondo (Glassmorphism), sanitización automática de seguridad contra ataques XSS y ofuscación en Base64 de enlaces de destino para evitar raspado de datos (scraping).

---

## Ficha Técnica y Atributos

| Atributo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Opcional | ID del elemento. Si se omite, se genera uno aleatorio `bapDialog-XXXXXX`. |
| `box-id` | `String` | Opcional | ID del contenedor interno de la tarjeta. |
| `image-header-left` | `String` | Opcional | URL de la imagen decorativa alineada a la izquierda del encabezado. |
| `image-header-right` | `String` | Opcional | URL de la imagen decorativa alineada a la derecha del encabezado. |
| `image-detail` | `String` | Opcional | URL de la imagen principal descriptiva dentro del cuerpo del diálogo. |
| `title-top` | `String` | Opcional | Título jerárquico de nivel superior (sobre-título). |
| `title-main` | `String` | Opcional | Título principal del modal (destacado en H2). |
| `title-sub` | `String` | Opcional | Subtítulo del modal. |
| `link-url-base64` | `String` | Opcional | URL de redirección del botón de acción principal, **ofuscada en Base64**. |
| `link-text-base64` | `String` | Opcional | Texto a mostrar en el botón de acción principal, **ofuscado en Base64**. |
| *(inner HTML)* | `String` | Opcional | Contenido enriquecido que se inyectará como el cuerpo del diálogo. |

---

## Medidas de Seguridad y Sanitización

1. **Prevención de XSS**: Todos los textos (`title-*`) y el cuerpo del modal (`bodyContent`) son sanitizados estrictamente mediante `sanitizeHTML()` definido en [./src/_main/i18n.js](./src/_main/i18n.js) antes de renderizarse en el DOM. Esto elimina etiquetas ejecutables (`<script>`, `<iframe>`, etc.) y manejadores de eventos en línea (`on*`).
2. **Protección de Enlaces (Protocolos Permitidos)**: Tras decodificar la URL Base64, se valida que comience con esquemas seguros (`https://`, `http://`, `mailto:`, enlaces relativos a la raíz o anclas `#`). Cualquier esquema peligroso (ej. `javascript:`) es interceptado y bloqueado en consola.

---

## Ejemplos de Uso

### Ejemplo 1: Declaración en HTML (Ofuscación de Enlace)
Para enlazar a `https://github.com` con el texto "Ver Código", primero codificamos en Base64:
- URL: `https://github.com` -> `aHR0cHM6Ly9naXRodWIuY29t`
- Texto: `Ver Código` -> `VmVyIEPDs2RpZ28=`

```html
<bap-dialog 
  id="modal-bienvenida"
  title-top="Novedad"
  title-main="¡BaP Framework v2.3!"
  title-sub="Diseño Glassmorphism"
  image-detail="./src/assets/bap-framework-logo.png"
  link-url-base64="aHR0cHM6Ly9naXRodWIuY29t"
  link-text-base64="VmVyIEPDs2RpZ28=">
  <p>Este es el <strong>contenido personalizado</strong> del cuerpo del diálogo.</p>
</bap-dialog>
```

### Ejemplo 2: Manipulación e Instanciación Dinámica
```javascript
const dialog = document.createElement("bap-dialog");
dialog.setAttribute("id", "modal-dinamico");
dialog.setAttribute("title-main", "Acción Importante");
dialog.innerHTML = "<p>¿Estás seguro de continuar con el proceso?</p>";
document.body.appendChild(dialog);
```

---

## Métodos de Control y Animación

- **Apertura**: El modal aplica automáticamente la clase `.show` después de 50ms de insertarse en el DOM, bloqueando el scroll del body (`document.body.style.overflow = "hidden"`).
- **Cierre**: Se cierra de forma limpia (destruyendo el elemento del DOM y restaurando el scroll) al hacer clic en el botón de cerrar (`X`) o al presionar fuera de la tarjeta sobre el difuminado del backdrop.

---

## Integraciones y Referencias Cruzadas

- **Constantes de Entorno**: Resuelve dependencias de ruta usando `ENV_URL` de [./src/_main/constants.js](./src/_main/constants.js).
- **Sanitización**: Depende de `sanitizeHTML` en [./src/_main/i18n.js](./src/_main/i18n.js).
- **Pruebas unitarias**: Evaluado en [./test/_components/bap-dialog.test.js](./test/_components/bap-dialog.test.js).
