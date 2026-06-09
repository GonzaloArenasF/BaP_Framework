# Componente `<bap-chip>` (Etiqueta o Tag)

El componente `<bap-chip>` se utiliza para representar etiquetas de estado, categorías o palabras clave en la interfaz de usuario. Renderiza un bloque de texto estilizado de esquinas redondeadas.

---

## Ficha Técnica y Atributos

| Atributo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Opcional | Identificador único para referenciar el elemento desde el DOM. |
| *(inner HTML)* | `String` | **Requerido** | El texto interno de la etiqueta actúa como el contenido (`label`) a renderizar en la plantilla. |

---

## Funcionamiento Interno

- **Pre-renderizado**: En `./src/_components/bap-chip/bap-chip.js` se lee el `innerHTML` de la etiqueta al conectarse al DOM, se remueven los espacios con `.trim()` y se asigna al placeholder `{label}` de la plantilla `./src/_components/bap-chip/bap-chip.html`.
- **Carga de recursos**: Utiliza `./src/_components/customComponentsRegistration.js` para registrar la clase `BapChip` asociada al tag `<bap-chip>` e inyectar de forma aislada `./src/_components/bap-chip/bap-chip.css`.

---

## Ejemplos de Uso

### Ejemplo 1: Declaración en HTML
Declaración directa en tu vista HTML:
```html
<bap-chip id="chip-activo">Activo</bap-chip>
<bap-chip>Versión v2.3.5</bap-chip>
```

### Ejemplo 2: Creación Dinámica con JavaScript
Puedes instanciar y agregar chips de forma programática:
```javascript
const nuevoChip = document.createElement("bap-chip");
nuevoChip.setAttribute("id", "chip-pendiente");
nuevoChip.innerHTML = "Pendiente";
document.body.appendChild(nuevoChip);
```

---

## Integraciones y Referencias Cruzadas

- **Estilos globales**: Adopta el lenguaje visual definido en [./src/style/main.css](./src/style/main.css).
- **Orquestador de componentes**: Registrado mediante `setCustomComponents()` en [./src/_components/customComponentsRegistration.js](./src/_components/customComponentsRegistration.js).
- **Pruebas unitarias**: Su instanciación y parseo de texto se validan en [./test/_components/simple-components.test.js](./test/_components/simple-components.test.js).
