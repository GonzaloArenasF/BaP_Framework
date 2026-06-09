# CDN (Content Delivery Network) - Canal de Distribución

Este directorio está destinado a la configuración, preparación y despliegue de recursos estáticos pesados en una instancia de distribución (CDN) desacoplada del sitio web principal de producción.

## Contexto del Directorio

El directorio `./cdn/` funciona como un subproyecto de despliegue independiente:
- [./cdn/package.json](./cdn/package.json): Define el nombre del módulo (`cdn-bap-framework`), dependencias mínimas y el script `deploy-prod` que invoca el comando de Firebase CLI.
- [./cdn/firebase.json](./cdn/firebase.json): Configura las propiedades de hosting específicas para este canal, mapeando los recursos del directorio `./cdn/public/` (ignorado en Git) hacia la instancia del sitio de Firebase.

---

## Configuración Multisitio en Firebase Hosting

Para que la distribución CDN funcione de forma aislada bajo la misma configuración central de Firebase, es imperativo establecer un entorno **Multisitio (Multisite)**. Sigue estos pasos para configurarlo:

### 1. Crear el Segundo Sitio en la Consola de Firebase
1. Ingresa a la [Consola de Firebase](https://console.firebase.google.com/).
2. Selecciona tu proyecto.
3. Ve a la sección **Hosting** en la barra lateral izquierda.
4. Desplázate hasta la parte inferior de la pestaña "Tablero" y haz clic en **Agregar otro sitio**.
5. Ingresa el ID del sitio deseado (por ejemplo: `cdn-bap-framework` o el ID configurado en tu proyecto). Este ID debe coincidir exactamente con el valor definido en la propiedad `"site"` dentro de [./cdn/firebase.json](./cdn/firebase.json).

### 2. Configuración y Despliegue
Una vez que el segundo sitio ha sido creado en la consola de Firebase:
- El script de despliegue `deploy-prod` en [./cdn/package.json](./cdn/package.json) ejecutará:
  ```bash
  firebase deploy --only hosting:cdn-gonzaloarenasf --project gonzalo-arenas---web-site
  ```
  *(Nota: Ajusta los parámetros del comando en `./cdn/package.json` para que coincidan con tu ID de sitio y proyecto de Firebase central).*
- Al realizar el despliegue, Firebase Hosting enrutará las peticiones del dominio CDN al contenido compilado en `./cdn/public/` sin afectar la aplicación web principal.

---

## Referencias Cruzadas e Integración

- **Configuración central de Firebase**: Se coordina a nivel de despliegue y variables de proyecto con el archivo maestro [./firebase.json](./firebase.json) de la raíz.
- **Flujo de optimización**: Los recursos pesados optimizados se enlazan desde las vistas principales de `./src/` usando URLs absolutas generadas tras el despliegue del CDN.
