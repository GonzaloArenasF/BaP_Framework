# Componente `<bap-svg-image>` (Iconoteca Vectorial)

El componente `<bap-svg-image>` sirve como inyector de vectores SVG y administrador de la biblioteca de iconos corporativos. Está diseñado para evitar peticiones HTTP concurrentes al cargar recursos de iconos individuales.

---

## Ficha Técnica y Atributos

| Atributo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `name` | `String` | **Requerido** | Identificador único del icono. Debe existir como clave en la biblioteca de [./src/_components/bap-svg-image/icons.js](./src/_components/bap-svg-image/icons.js). |
| `size` | `String` | Opcional | Tamaño predefinido del elemento. Valores: `"xs"`, `"s"`, `"m"`, `"l"`, `"xl"`. |
| `mobile-size` | `String` | Opcional | Tamaño opcional aplicado exclusivamente en viewports móviles (mismos valores que `size`). |
| `type` | `String` | Opcional | Categoría de la imagen. Por defecto: `"icon"`. |

---

## Biblioteca de Iconos y Funcionamiento

- **Almacenamiento Estático**: La biblioteca de vectores XML reside en [./src/_components/bap-svg-image/icons.js](./src/_components/bap-svg-image/icons.js) en un objeto de pares clave-valor indexados por el atributo `name`.
- **Carga Local**: Al conectarse al DOM, `./src/_components/bap-svg-image/bap-svg-image.js` lee la propiedad `name` del atributo, extrae el código XML del objeto de iconos e inyecta directamente el vector en el `innerHTML` del componente, aplicando clases CSS responsivas según las dimensiones pasadas en `size` y `mobile-size`.

---

## Ejemplos de Uso

### Ejemplo 1: Declaración en HTML de Iconos con Diferentes Tamaños
```html
<!-- Icono de perfil tamaño mediano -->
<bap-svg-image name="profile" size="m"></bap-svg-image>

<!-- Icono de cerrar adaptable (grande en desktop, pequeño en móvil) -->
<bap-svg-image name="close" size="l" mobile-size="s"></bap-svg-image>
```

### Ejemplo 2: Creación Dinámica con JavaScript
```javascript
const iconoAlerta = document.createElement("bap-svg-image");
iconoAlerta.setAttribute("name", "alert");
iconoAlerta.setAttribute("size", "s");
document.body.appendChild(iconoAlerta);
```

---

## Integraciones y Referencias Cruzadas

- **Consumidores**: Integrado dentro de las alertas del componente de notificación [./src/_components/bap-notification/](./src/_components/bap-notification/README.md) para pintar los gráficos decorativos.
- **Colección de Vectores**: La lista completa de iconos disponibles se puede revisar y extender editando la constante en [./src/_components/bap-svg-image/icons.js](./src/_components/bap-svg-image/icons.js).
- **Pruebas unitarias**: El mapeo de iconos y clases responsivas se testea en [./test/_components/bap-svg-image.test.js](./test/_components/bap-svg-image.test.js).
