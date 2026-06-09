# Componente `<bap-logo>` (Logotipo Adaptativo)

El componente `<bap-logo>` se encarga de renderizar la identidad visual (logotipo) del framework o del proyecto de forma adaptativa. Soporta imágenes de logo personalizadas y provee un fallback vectorial SVG que responde cromáticamente al modo de color activo.

---

## Ficha Técnica y Atributos

| Atributo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `color-mode` | `String` | Opcional | Controla la paleta cromática del vector SVG de fallback. Valores: `"light"` o `"dark"`. Por defecto: `"light"`. |

---

## Comportamiento y Fallback

1. **Logotipo Personalizado**: El componente comprueba si existe una URL de imagen definida en `CONSTANT.LOGO_URL` (en [./src/_main/constants.js](./src/_main/constants.js)). Si está presente, renderiza una etiqueta `<img src="..." />`.
2. **Logotipo Vectorial de Fallback**: Si no hay imagen configurada, renderiza una estructura de vectores SVG embebidos. El color de relleno (fill) de las figuras SVG se adapta mediante reglas CSS internas en función de si el atributo `color-mode` es `"light"` o `"dark"`.

---

## Ejemplos de Uso

### Ejemplo 1: Logotipo en Modo Oscuro (HTML)
```html
<bap-logo color-mode="dark"></bap-logo>
```

### Ejemplo 2: Actualización Dinámica desde JavaScript
```javascript
const logo = document.querySelector("bap-logo");
if (logo) {
  // Cambiar el tono del logo a modo claro
  logo.setAttribute("color-mode", "light");
}
```

---

## Integraciones y Referencias Cruzadas

- **Cabecera de Navegación**: Es embebido y actualizado de forma automática por el componente de cabecera [./src/_components/bap-header/](./src/_components/bap-header/README.md) cada vez que el usuario cambia la preferencia de tema.
- **Constantes**: Lee la ruta de imagen del logo personalizada desde [./src/_main/constants.js](./src/_main/constants.js).
- **Pruebas unitarias**: El fallback y los cambios de atributo de color se validan en [./test/_components/bap-logo.test.js](./test/_components/bap-logo.test.js).
