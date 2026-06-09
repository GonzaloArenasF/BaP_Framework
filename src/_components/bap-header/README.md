# Componente `<bap-header>` (Barra de Navegación y Temas)

El componente `<bap-header>` representa la barra de navegación superior de la aplicación. Integra el menú de navegación móvil colapsable, controles de sesión e inicio de sesión, y la lógica para alternar y persistir el tema de color (Modo Claro / Modo Oscuro) del sitio web.

---

## Ficha Técnica y Atributos

| Atributo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `hide-actions` | `Boolean` (Presencia) | Opcional | Si está presente, oculta las opciones y botones de la barra (ej. en la pantalla de Login o 404). |
| `show-admin-actions` | `Boolean` (Presencia) | Opcional | Si está presente, despliega las opciones exclusivas de la barra de navegación para administradores. |
| `is-admin-user` | `Boolean` (Presencia) | Opcional | Si está presente, marca visualmente el perfil de sesión activa como rol Administrador. |
| `color-mode` | `String` | Opcional | Modo inicial de color. Valores: `"light"` o `"dark"`. Por defecto: `"light"`. |

---

## Control de Temas (Modo Claro y Oscuro)

El componente orquesta la apariencia global de la aplicación a través de la función `applyColorMode(mode)`:
1. **Clases del Body**: Añade la clase `.light-mode` o `.dark-mode` al elemento `<body>` del documento.
2. **Propagación del Tema**: Modifica dinámicamente el atributo `color-mode` del componente anidado `<bap-logo>` para cambiar la variante del logotipo.
3. **Persistencia Local**: Guarda de forma persistente la selección del usuario en el navegador mediante `localStorage.setItem("bap-color-mode", mode)`. Al recargar, restaura automáticamente la preferencia almacenada.

---

## Ejemplos de Uso

### Ejemplo 1: Declaración en HTML para Usuario Administrador
```html
<bap-header 
  show-admin-actions 
  is-admin-user 
  color-mode="dark">
</bap-header>
```

### Ejemplo 2: Barra de Navegación Simplificada (Sin Acciones)
Utilizado para vistas de error o flujos de inicio de sesión:
```html
<bap-header hide-actions></bap-header>
```

### Ejemplo 3: Inyección Dinámica
```javascript
const navHeader = document.createElement("bap-header");
navHeader.setAttribute("color-mode", "light");
document.body.prepend(navHeader);
```

---

## Integraciones y Referencias Cruzadas

- **Estilos globales**: Al añadir las clases `.light-mode` / `.dark-mode` al `<body>`, activa las variables y colores definidos en [./src/style/colors.css](./src/style/colors.css).
- **Logotipo integrado**: Se conecta con el componente `<bap-logo>` ubicado en [./src/_components/bap-logo/](./src/_components/bap-logo/README.md).
- **Control de Acceso**: Interactúa con los estados de sesión gestionados por [./src/_main/auth.js](./src/_main/auth.js).
- **Pruebas unitarias**: El comportamiento del menú y el toggle de temas se validan en [./test/_components/simple-components.test.js](./test/_components/simple-components.test.js).
