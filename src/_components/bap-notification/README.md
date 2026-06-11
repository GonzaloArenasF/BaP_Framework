# Componente `<bap-notification>` (Alertas y Toasts)

El componente `<bap-notification>` maneja alertas dinámicas e informativas en pantalla de tipo Toast o Alert. Su interfaz y estilos se encapsulan mediante **Shadow DOM** para evitar colisiones con hojas de estilos globales de la aplicación.

---

## Ficha Técnica y Atributos

| Atributo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `type` | `String` | Opcional | Clasificación visual de la alerta. Valores: `"toast"` (esquina inferior) o `"alert"` (barra de ancho completo). Por defecto: `"toast"`. |
| `severity` | `String` | Opcional | Nivel de gravedad que modifica la paleta de colores. Valores: `"info"`, `"warning"`, `"error"`. Por defecto: `"error"`. |
| `show` | `Boolean` (Presencia) | Opcional | Si está presente, aplica la animación para deslizar y mostrar la notificación en pantalla. |
| *(inner HTML)* | `String` | **Requerido** | El contenido de texto interno de la etiqueta actúa como el cuerpo del mensaje de la notificación. |

---

## Comportamiento Técnico y Shadow DOM

- **Aislamiento de Estilos**: Al instanciarse, crea un Shadow Root en modo abierto (`mode: "open"`) e inyecta directamente un nodo `<link rel="stylesheet">` enlazando a `./src/_components/bap-notification/bap-notification.css`. Esto garantiza inmunidad total ante colisiones de CSS.
- **Auto-Eliminación (Auto-Remove)**: Si la notificación posee una severidad de tipo `"info"`, el componente activa un temporizador para destruirse y removerse a sí mismo del DOM tras transcurrir el tiempo en milisegundos indicado por la constante `CONSTANT.NOTIFICATION.AUTO_REMOVE_AFTER.INFO` (definida en [./src/_main/constants.js](./src/_main/constants.js)).
- **Cierre Manual**: Añade un Event Listener al botón de cerrado de la plantilla para ocultar la alerta al hacer clic en él.

---

## Medidas de Seguridad y Sanitización

1. **Prevención de XSS**: El contenido interno de la etiqueta (cuerpo del mensaje) es sanitizado estrictamente mediante `sanitizeHTML()` definido en [./src/_main/i18n.js](./src/_main/i18n.js) antes de inyectarse en el Shadow DOM. Esto asegura que la renderización dinámica de errores o notificaciones de API no pueda ejecutar scripts maliciosos.

---
## Ejemplos de Uso

### Ejemplo 1: Alerta de Error Fija (HTML)
```html
<bap-notification type="alert" severity="error" show>
  Error de autenticación: El correo no pertenece a la whitelist de usuarios permitidos.
</bap-notification>
```

### Ejemplo 2: Toast Informativo de Auto-Eliminación (JS)
```javascript
const toast = document.createElement("bap-notification");
toast.setAttribute("type", "toast");
toast.setAttribute("severity", "info");
toast.setAttribute("show", "");
toast.innerHTML = "Se han sincronizado tus preferencias locales correctamente.";
document.body.appendChild(toast);
```

---

## Integraciones y Referencias Cruzadas

- **Gestor de Configuración**: Lee la duración del temporizador de auto-remoción desde [./src/_main/constants.js](./src/_main/constants.js).
- **Mapeo de iconos**: Utiliza el componente `<bap-svg-image>` de [./src/_components/bap-svg-image/](./src/_components/bap-svg-image/README.md) en su plantilla interna para renderizar los vectores de advertencia o éxito correspondientes.
- **Pruebas unitarias**: Su flujo de renderizado en el Shadow DOM y el click listener de cierre se verifican en [./test/_components/bap-notification.test.js](./test/_components/bap-notification.test.js).
