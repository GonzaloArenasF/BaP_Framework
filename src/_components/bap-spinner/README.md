# Componente `<bap-spinner>` (Indicador de Carga)

El componente `<bap-spinner>` provee un indicador circular de espera (Loader) animado mediante CSS Keyframes. Al estar basado 100% en CSS Vanilla puro, ofrece un alto rendimiento y nulo consumo de procesamiento de JS.

---

## Ficha Técnica y Atributos

Este componente **no recibe atributos de configuración**.

---

## Funcionamiento Técnico y Animación

- **Estructura HTML**: Renderiza un contenedor div simple definido en `./src/_components/bap-spinner/bap-spinner.html`.
- **Efectos CSS**: Utiliza bordes transparentes y de color sólido combinados con la propiedad CSS `animation` y `@keyframes` para generar una rotación suave de 360 grados constante, heredando el color de acento turquesa eléctrico.

---

## Ejemplos de Uso

### Ejemplo 1: Declaración directa en HTML
Puedes añadir el spinner dentro de cualquier contenedor de la UI que esté realizando una llamada de datos:
```html
<div class="caja-de-contenido">
  <bap-spinner></bap-spinner>
  <p>Cargando información del servidor...</p>
</div>
```

### Ejemplo 2: Creación Dinámica con JavaScript
```javascript
const spinner = document.createElement("bap-spinner");
document.getElementById("mi-contenedor").appendChild(spinner);
```

---

## Integraciones y Referencias Cruzadas

- **Componente contenedor**: Es anidado y utilizado automáticamente por el overlay de pantalla completa [./src/_components/bap-loading-state/](./src/_components/bap-loading-state/README.md) en su plantilla.
- **Sistema de diseño**: Adopta el color de énfasis turquesa eléctrico definido en el sistema de diseño centralizado de [./src/style/colors.css](./src/style/colors.css).
- **Pruebas unitarias**: Su instanciación y conexión al DOM se verifican en [./test/_components/simple-components.test.js](./test/_components/simple-components.test.js).
