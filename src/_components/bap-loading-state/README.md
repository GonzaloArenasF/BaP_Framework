# Componente `<bap-loading-state>` (Cargador de Pantalla Completa)

El componente `<bap-loading-state>` crea una capa opaca de bloqueo de pantalla completa (Loading Overlay) con un spinner central animado. Se utiliza para impedir que el usuario interactúe con la página durante transiciones, autenticaciones o consultas pesadas.

---

## Ficha Técnica y Atributos

| Atributo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `sub-message` | `String` | Opcional | Texto secundario o descriptivo que se muestra debajo del mensaje principal. |
| *(inner HTML)* | `String` | Opcional | El texto interno del nodo se utiliza como el mensaje principal de carga. |

---

## Funcionamiento Técnico

- **Bloqueo del Viewport**: Aplica estilos CSS de posición fija (`position: fixed`), ocupando el 100% de la anchura y altura de la pantalla, con un `z-index: 9999` para superponerse a cualquier elemento de la interfaz.
- **Anidación del Loader**: Inyecta automáticamente el elemento animado `<bap-spinner>` en el centro de su estructura.

---

## Ejemplos de Uso

### Ejemplo 1: Declaración en HTML
```html
<bap-loading-state sub-message="Por favor, no recargues la página">
  Cargando tu sesión...
</bap-loading-state>
```

### Ejemplo 2: Control Dinámico desde JavaScript (Mostrar y Ocultar)
```javascript
// 1. Mostrar el cargador
const loader = document.createElement("bap-loading-state");
loader.setAttribute("id", "cargador-global");
loader.setAttribute("sub-message", "Consultando la base de datos");
loader.innerHTML = "Guardando cambios...";
document.body.appendChild(loader);

// 2. Ocultar y remover tras completar el proceso asíncrono
setTimeout(() => {
  const activeLoader = document.getElementById("cargador-global");
  if (activeLoader) {
    activeLoader.remove();
  }
}, 3000);
```

---

## Integraciones y Referencias Cruzadas

- **Componente anidado**: Consume directamente al cargador circular de [./src/_components/bap-spinner/](./src/_components/bap-spinner/README.md).
- **Integración con el Enrutador**: Invocado por [./src/_main/router.js](./src/_main/router.js) mientras valida permisos y carga vistas asíncronas.
- **Pruebas unitarias**: Su estructura y mensajería se validan en [./test/_components/simple-components.test.js](./test/_components/simple-components.test.js).
