export const esES = {
  component: {
    bapFooter: {
      tc: "© 2026 <a href=\"http://gonzaloarenasf.cl\" target=\"_blank\" rel=\"noopener noreferrer\">Gonzalo A. Arenas Flores</a>. Licenciado bajo MIT. Libre de utilizar y distribuir. El software se proporciona 'tal cual', sin garantías y bajo responsabilidad exclusiva del usuario.",
      brandDesc: "Estándar premium para desarrollo web ultra-ligero, modular y de alto rendimiento.",
      versionLabel: "Versión",
      resourcesLabel: "Recursos",
      btnExplore: "Explorar Componentes",
      contactLabel: "Contacto",
    },
    bapHeader: {
      lightMode: "Claro",
      darkMode: "Oscuro",
    },
  },
  page: {
    cross: {
      notification: {
        loginFail: "No se pudo iniciar sesión. Por favor, comprueba si tu navegador bloquea las ventanas emergentes e inténtalo de nuevo.",
        logoutFail: "No se pudo cerrar sesión. Por favor, recarga la página e inténtalo de nuevo.",
        notAllowedEnteringPage: "No tienes permisos para acceder a esta página.",
        errorGettingQueryParams: "No se pudo procesar la información de acceso.",
        storage: {
          errorGetting: "No se pudo obtener la información. Inténtalo de nuevo.",
          errorSaving: "No se pudo guardar la información. Inténtalo de nuevo.",
          errorUpdating: "No se pudo actualizar la información. Inténtalo de nuevo.",
          errorRemoving: "No se pudo eliminar la información. Inténtalo de nuevo.",
        },
      },
      sidebar: {
        title: "Documentación",
        back: "← Volver al Inicio",
        cdn: "Despliegue & CDN",
        core: "Core & Módulos",
        components: "Componentes Web",
        pages: "Páginas y Subpáginas",
        style: "Diseño & CSS",
        test: "Suite de Pruebas",
        build: "Ciclo de Desarrollo",
      },
    },
    notFound: {
      head: {
        title: "Página no encontrada - BaP Framework",
        meta: {
          title: "Página no encontrada - BaP Framework",
          description: "Página no encontrada",
          keywords: "Página no encontrada, error, 404",
        },
      },
      body: {
        message: "Mmm... creo que no incluí esto en el plano.",
        backHome: "Ir al inicio",
      },
    },
    landing: {
      head: {
        title: "BaP Framework — Desarrollo Guiado por Especificaciones",
        meta: {
          title: "BaP Framework — Desarrollo Guiado por Especificaciones",
          description: "Estándar premium para desarrollo web ultra-ligero, modular y de alto rendimiento.",
          keywords: "BaP, Framework, Web Components, Vanilla JS, CSS, Firebase, Modular",
        },
      },
      body: {
        // ── Hero ──────────────────────────────────────────────────────────
        hero: {
          title: "Desarrollo Web Ultra-Limpio y Modular",
          tagline: "La filosofía de BaP es simple: <strong>cero frameworks de cliente pesados, cero dependencias innecesarias</strong>. Construido exclusivamente sobre HTML5, CSS3 y JavaScript Vanilla puro para probar ideas rápidamente con máxima escalabilidad y rendimiento excepcional.",
          btnExplore: "Explorar Componentes",
          btnGithub: "Ver en GitHub",
        },
        // ── Core (Columna Vertebral) ───────────────────────────────────────
        core: {
          sectionTitle: "🧠 La Columna Vertebral del Framework",
          modules: {
            title: "🔌 Módulo del Sistema (_main/)",
            description: "Toda la inteligencia lógica está centralizada en módulos aislados en <code>src/_main/</code>:",
            constants: "Inyección segura de variables de entorno y URLs dinámicas.",
            firebaseInit: "Gateway de inicialización de los servicios Firebase.",
            routerPaths: "Diccionario estricto de rutas y guardias de seguridad.",
            router: "Motor de ruteo dinámico programático e inmune a XSS.",
            auth: "Control de sesión con doble factor lógico por Whitelist.",
            storage: "Persistencia cifrada (AES-GCM de 256 bits y PBKDF2) y base de datos.",
            i18n: "Traducción segura con TreeWalker y sanitización contra XSS.",
            analytics: "Telemetría centralizada y taxonomía unificada de eventos.",
            util: "Herramientas estructurales y UUIDs criptográficamente fuertes.",
          },
          config: {
            title: "⚙️ Configuración Centralizada",
            description: "Personaliza y escala tu aplicación a través del archivo <code>bap.config.json</code> sin alterar el código fuente del núcleo:",
            json: "Única fuente de verdad inyectada en memoria durante la compilación.",
            routes: "Definición dinámica de rutas seguras para la vista y la base de datos.",
            telemetry: "Extensión declarativa de la taxonomía de Firebase Analytics.",
            components: "Autodescubrimiento y prefijado seguro de componentes (el core está reservado bajo el prefijo <code>bap-</code>).",
          },
          firebase: {
            title: "🛡️ Firebase Integrado",
            description: "Integración nativa directa con los servicios en la nube de Google Firebase para dar soporte robusto a proyectos listos para producción:",
            hosting: "Alojamiento estático ultrarrápido y seguro.",
            auth: "Autenticación nativa utilizando el proveedor Google Identity.",
            realtimeDb: "Control de Whitelist de accesos y persistencia.",
            analytics: "Diccionario taxonómico unificado de telemetría.",
            appCheck: "Protección contra bots y abusos mediante App Check y reCAPTCHA.",
          },
          gulp: {
            title: "⚙️ Pipeline con Gulp",
            description: "Un potente compilador automatizado mediante scripts de consola. Asegura tu código de cliente y optimiza la velocidad antes de desplegar:",
            minify: "Compresión al extremo de HTML, CSS y JS.",
            obfuscation: "Protección intelectual de la lógica del cliente.",
            injection: "Reemplazo automático de variables de versión en HTML.",
            distribution: "Copiado y estructuración automática de assets y manifiestos.",
          },
          security: {
            title: "🔐 Seguridad y Criptografía",
            description: "Medidas avanzadas integradas nativamente en el core para protección de datos y defensa en profundidad de grado de producción:",
            xss: "Inmunidad a inyecciones XSS mediante creación programática del DOM y sanitización de HTML.",
            crypto: "Cifrado asíncrono AES-GCM de 256 bits y derivación de claves PBKDF2 en almacenamiento local.",
            uuids: "Generador de UUIDs no predecibles utilizando la Web Crypto API del navegador.",
            headers: "Cabeceras de servidor rígidas (CSP, X-Frame-Options, nosniff) configuradas en Firebase.",
          },
          testing: {
            title: "🧪 Pruebas Unitarias (Testing)",
            description: "Infraestructura de testing moderna y de alta velocidad incorporada en el ciclo de desarrollo:",
            vitest: "Ejecución ultrarrápida usando Vitest.",
            jsdom: "Emulación completa del DOM (JSDOM) para probar Custom Elements aislados.",
            mocks: "Mocks integrados para simular servicios de Firebase (Auth, RTDB, Analytics).",
            coverage: "Generación automática de reportes de cobertura (V8).",
          },
        },
        docs: {
          sectionTitle: "📚 Documentación del Framework",
          sectionDescription: "Explora la documentación interactiva y guías técnicas diseñadas para desarrolladores, construidas bajo la metodología y componentes de este framework:",
          cdn: {
            title: "Despliegue & CDN",
            description: "Configuración multisitio y distribución de recursos estáticos pesados en Firebase Hosting.",
            btn: "Ver Documentación de CDN",
          },
          core: {
            title: "Core & Módulos",
            description: "Detalle técnico del motor de enrutamiento, criptografía, autenticación, utilidades y traducción.",
            btn: "Ver Módulos del Core",
          },
          components: {
            title: "Componentes Web",
            description: "Especificaciones técnicas completas, configuraciones y ejemplos interactivos de los 9 Web Components core.",
            btn: "Ver Especificaciones de Componentes",
          },
          pages: {
            title: "Páginas y Subpáginas",
            description: "Estructura de ruteo estático, jerarquías de directorios, anidación y metodología de carga.",
            btn: "Ver Estructura de Páginas",
          },
          style: {
            title: "Diseño & CSS",
            description: "Variables CSS premium de color, tipografía de vanguardia, modo claro/oscuro y formularios.",
            btn: "Ver Documentación de Diseño",
          },
          test: {
            title: "Suite de Pruebas",
            description: "Arquitectura de tests unitarios y de integración sobre JSDOM con Vitest y simulaciones de red.",
            btn: "Ver Pruebas de Integración",
          },
          build: {
            title: "Ciclo de Desarrollo",
            description: "Scripts de terminal para pruebas unitarias, modo watch, servidor local y despliegue.",
            btn: "Ver Scripts de Terminal",
          },
        },
        sidebar: {
          navTitle: "Índice de Documentación",
          statusTitle: "Estado del Framework",
          statusVersion: "Versión",
          statusLicense: "Licencia",
          statusFirebase: "Firebase",
          statusActive: "Activo",
          statusInactive: "Inactivo",
        },
      },
    },
    cdn: {
      head: {
        title: "BaP Docs - CDN & Multisite Hosting",
        meta: {
          title: "BaP Docs - CDN & Multisite Hosting",
          description: "Configuración y despliegue de recursos estáticos en una red CDN multisitio con Firebase Hosting.",
          keywords: "Firebase, CDN, Multisite, Hosting, Cloud, Despliegue, Web",
        }
      },
      body: {
        title: "CDN (Content Delivery Network) - Canal de Distribución",
        desc: "Este directorio está destinado a la configuración, preparación y despliegue de recursos estáticos pesados en una instancia de distribución (CDN) desacoplada del sitio web principal de producción.",
        contextTitle: "Contexto del Directorio",
        contextDesc: "El directorio <code>./cdn/</code> funciona como un subproyecto de despliegue independiente:",
        packageJson: "Define el nombre del módulo (<code>cdn-bap-framework</code>), dependencias mínimas y el script <code>deploy-prod</code> que invoca el comando de Firebase CLI.",
        firebaseJson: "Configura las propiedades de hosting específicas para este canal, mapeando los recursos del directorio <code>./cdn/public/</code> (ignorado en Git) hacia la instancia del sitio de Firebase.",
        warnTitle: "⚠️ Nota sobre Carpetas Ignoradas:",
        warnDesc: "Las carpetas <code>./cdn/public/</code> y <code>./cdn/.firebase/</code> están excluidas del control de versiones en <code>.gitignore</code> dado que almacenan compilados y cachés dinámicos de despliegue.",
        multisiteTitle: "Configuración Multisitio en Firebase Hosting",
        multisiteDesc: "Para que la distribución CDN funcione de forma aislada bajo la misma configuración central de Firebase, es imperativo establecer un entorno <strong>Multisitio (Multisite)</strong> en tu proyecto. Sigue estos pasos para configurarlo:",
        step1Title: "1. Crear el Segundo Sitio en la Consola de Firebase",
        step1_1: "Ingresa a la <a href=\"https://console.firebase.google.com/\" target=\"_blank\">Consola de Firebase</a>.",
        step1_2: "Selecciona tu proyecto central de producción.",
        step1_3: "Ve a la sección <strong>Hosting</strong> en la barra lateral izquierda.",
        step1_4: "Desplázate hasta la parte inferior de la pestaña \"Tablero\" y haz clic en el botón <strong>Agregar otro sitio</strong>.",
        step1_5: "Ingresa el ID del sitio deseado (por ejemplo: <code>cdn-bap-framework</code>). Este ID debe coincidir exactamente con el valor definido en la propiedad <code>\"site\"</code> dentro de <code>./cdn/firebase.json</code>.",
        step2Title: "2. Configuración de Alias y Comando de Despliegue",
        step2Desc: "Una vez creado el segundo sitio en la consola, ejecuta el comando de despliegue desde el subdirectorio <code>./cdn/</code>:",
        step2Cmd: "# Script de despliegue definido en ./cdn/package.json\nfirebase deploy --only hosting:cdn-gonzaloarenasf --project gonzalo-arenas---web-site",
        step2CmdDesc: "Asegúrate de ajustar los identificadores del alias en tu script de despliegue para que coincidan con la cuenta y nombres de tu proyecto real.",
        refsTitle: "Referencias Cruzadas e Integración",
        ref1: "<strong>Configuración central de Firebase:</strong> Se coordina a nivel de despliegue con el archivo maestro <code>./firebase.json</code> en el root del repositorio.",
        ref2: "<strong>Flujo de optimización:</strong> Los recursos pesados (como imágenes y logotipos) se enlazan desde las vistas principales de <code>./src/</code> mediante las URLs absolutas provistas por tu nuevo dominio CDN secundario."
      }
    },
    core: {
      head: {
        title: "BaP Docs - Core Engine",
        meta: {
          title: "BaP Docs - Core Engine",
          description: "Especificaciones del motor lógico de BaP: enrutamiento, criptografía, internacionalización y sesión.",
          keywords: "Core, Javascript, Router, Cryptography, i18n, Analytics, Security",
        }
      },
      body: {
        title: "Núcleo del Framework (Core Engine)",
        desc: "Este directorio alberga los módulos lógicos principales de BaP Framework, actuando como el motor que orquesta el enrutamiento, la autenticación, la internacionalización, la persistencia criptográfica y la telemetría.",
        modulesTitle: "Módulos del Core (Directorio <code>./src/_main/</code>)",
        modulesDesc: "Cada archivo actúa como un módulo JS especializado para la orquestación e inyección del framework:",
        colModule: "Módulo",
        colDesc: "Descripción Técnica",
        colSynergy: "Sinergias Clave",
        constantsDesc: "Resuelve <code>ENV_URL</code> dinámicamente según el hostname (evita colisión de puertos en macOS). Almacena versiones y configuraciones.",
        constantsSynergy: "Alimenta a todos los módulos con variables inicializadas y credenciales de entorno inyectadas por Gulp.",
        firebaseInitDesc: "Gateway único de inicialización para Firebase App, Auth, Database y Analytics. Evita la múltiple instanciación.",
        firebaseInitSynergy: "Provee los recursos base requeridos por los adaptadores de seguridad y analíticas.",
        authDesc: "Gestiona el inicio/cierre de sesión (Google Provider) y realiza validación asíncrona contra la whitelist en Realtime Database.",
        authSynergy: "Proporciona el estado del usuario al enrutador para autorizar rutas privadas.",
        routerPathsDesc: "Diccionario de declaración de rutas válidas de la aplicación, asociando URLs con componentes de página.",
        routerPathsSynergy: "Estructura el mapa que procesará el motor del enrutador.",
        routerDesc: "Enrutador SPA que navega sin recarga de página. Crea componentes programáticamente (<code>document.createElement</code>) mitigando XSS reflejado de URLs.",
        routerSynergy: "Orquesta la UI evaluando la seguridad en combinación con <code>auth.js</code>.",
        storageDesc: "Capa de persistencia. Expone métodos asíncronos que cifran datos locales usando <strong>AES-GCM de 256 bits</strong> y derivación <strong>PBKDF2</strong> (100,000 iteraciones y salt) enlazados al <code>uid</code> del usuario.",
        storageSynergy: "Garantiza la persistencia segura de tokens y datos sensibles del cliente.",
        i18nDesc: "Motor de internacionalización. Recorre el DOM de forma segura con un <code>TreeWalker</code> nativo traduciendo solo nodos de texto. Incluye <code>sanitizeHTML()</code>.",
        i18nSynergy: "Traduce la UI en tiempo de ejecución leyendo diccionarios asíncronos.",
        analyticsDesc: "Módulo unificado de telemetría. Centraliza el log de navegación, aperturas de modales, clics y errores 404.",
        analyticsSynergy: "Envía datos de uso a Firebase Analytics.",
        utilDesc: "Caja de herramientas (generación de UUIDs criptográficos fuertes con la Web Crypto API, validaciones, etc.).",
        utilSynergy: "Provee utilidades comunes a componentes y páginas.",
        i18nTitle: "Internacionalización y Diccionarios",
        i18nDescText: "La carpeta <code>./src/_main/i18n/</code> contiene los archivos de traducción. Las subpáginas o componentes pueden obtener las claves asíncronas llamando a <code>getI18nContent()</code>. La estructura del diccionario base se puede consultar en <code>./src/_main/i18n/es-ES.js</code>.",
        bypassTitle: "🔒 Regla de Bypass Local (Bypass de Seguridad):",
        bypassDesc: "Si <code>CONSTANT.FIREBASE_AVAILABLE</code> es <code>false</code> en tu archivo de entorno local <code>.env</code>, el enrutador omitirá todas las validaciones de listas blancas e inicio de sesión para agilizar el desarrollo de vistas locales."
      }
    },
    components: {
      head: {
        title: "BaP Docs - Custom Components",
        meta: {
          title: "BaP Docs - Custom Components",
          description: "Especificaciones técnicas y catálogo de Custom Components reutilizables de BaP Framework.",
          keywords: "Web Components, Custom Elements, HTML5, Shadow DOM, CSS, UI",
        }
      },
      body: {
        title: "Componentes Web Reutilizables (Custom Elements)",
        desc: "BaP Framework utiliza componentes web nativos basados en el estándar del W3C (Custom Elements). Esto permite encapsular estilos y lógica sin la sobrecarga de frameworks externos.",
        btnToast: "Disparar Toast",
        btnAlert: "Disparar Alerta",
        btnOpen: "Abrir Diálogo de Prueba",
        btnBlock: "Bloquear Pantalla de Carga",
        headerHint: "Visualiza este componente en la parte superior de esta página de documentación.",
        footerHint: "Visualiza este componente en la parte inferior de esta página de documentación.",
        regTitle: "Registro e Instanciación",
        regDesc: "El orquestador central se encuentra en <code>./src/_components/customComponentsRegistration.js</code>, el cual expone la función <code>setCustomComponents()</code> para darlos de alta en el DOM de forma dinámica y asíncrona.",
        colAttr: "Atributo",
        colType: "Tipo",
        colReq: "Requerido",
        colDesc: "Descripción",
        innerHtml: "<em>(inner HTML)</em>",
        yes: "<strong>Sí</strong>",
        optional: "Opcional",
        
        chipDesc: "Etiqueta visual pequeña para representar categorías o palabras clave.",
        chipAttrDesc: "Contenido de la etiqueta.",
        chipIdDesc: "Identificador del elemento.",
        
        dialogDesc: "Modal premium con Glassmorphism, sanitización de datos y enlaces Base64 seguros.",
        dialogIdDesc: "ID único del modal (autogenerado si se omite).",
        dialogTopDesc: "Sobre-título de cabecera.",
        dialogMainDesc: "Título destacado en H2.",
        dialogSubDesc: "Subtítulo en H3.",
        dialogImgDesc: "URL de la imagen del cuerpo.",
        dialogUrlDesc: "URL de acción principal codificada en Base64.",
        dialogTextDesc: "Texto del botón codificado en Base64.",
        
        footerDesc: "Pie de página adaptativo que incluye los metadatos y traducción asíncrona.",
        footerNoAttrs: "<em>No recibe atributos HTML. Carga su lógica y traducciones directamente desde constantes.</em>",
        
        headerDesc: "Barra de navegación responsiva que controla el inicio de sesión y la conmutación de temas (Modo Claro / Modo Oscuro).",
        headerHideDesc: "Oculta las acciones y botones.",
        headerAdminDesc: "Habilita opciones de administración.",
        headerIsAdminDesc: "Marca visual de rol administrador.",
        
        loadingDesc: "Capa opaca de bloqueo de pantalla completa con spinner animado.",
        loadingSubDesc: "Texto explicativo secundario.",
        loadingInnerDesc: "Mensaje principal del overlay.",
        
        logoDesc: "Renderiza el logotipo principal de la marca o un fallback vectorial SVG adaptable.",
        logoColorDesc: "Tono cromático del SVG (<code>\"light\"</code> o <code>\"dark\"</code>).",
        
        notifDesc: "Alertas visuales tipo Toast o Banner aisladas en su Shadow DOM.",
        notifTypeDesc: "Tipo de caja: <code>\"toast\"</code> o <code>\"alert\"</code>.",
        notifSeverityDesc: "Gravedad: <code>\"info\"</code>, <code>\"warning\"</code>, <code>\"error\"</code>.",
        notifShowDesc: "Aplica animación para mostrar la alerta en pantalla.",
        
        spinnerDesc: "Loader circular animado puramente en CSS.",
        spinnerNoAttrs: "<em>No recibe atributos HTML.</em>",
        
        svgDesc: "Renderiza vectores desde una iconoteca estática.",
        svgNameDesc: "Identificador único del icono en <code>icons.js</code>.",
        svgSizeDesc: "Tamaños: <code>\"xs\"</code>, <code>\"s\"</code>, <code>\"m\"</code>, <code>\"l\"</code>, <code>\"xl\"</code>.",
        svgMobileDesc: "Tamaño en dispositivos móviles."
      }
    },
    pages: {
      head: {
        title: "BaP Docs - Pages & Subpages",
        meta: {
          title: "BaP Docs - Pages & Subpages",
          description: "Metodología de estructuración de directorios, registro de rutas e internacionalización en BaP Framework.",
          keywords: "Pages, Subpages, Routing, i18n, Gulp, Compilation, Telemetry",
        }
      },
      body: {
        title: "Creación de Páginas y Subpáginas",
        desc: "BaP Framework simplifica la creación de páginas y subpáginas sin requerir código complejo de componentes. Al estructurar carpetas estáticas bajo el directorio de páginas, el servidor web y Gulp se encargan de servirlas y optimizarlas de forma automática.",
        ruleTitle: "Regla de Estructura de Directorios",
        ruleDesc: "Para crear una nueva ruta navegable en la aplicación, sigue esta regla:",
        pageFolder: "<strong>Cada Página es un Directorio:</strong> Crea un nuevo directorio bajo <code>./src/pages/</code>. El nombre de la carpeta definirá la URL de acceso (por ejemplo, <code>./src/pages/perfil/</code> será accesible desde <code>{dominio}/pages/perfil/</code>).",
        subpageFolder: "<strong>Subpáginas Anidadas:</strong> Si deseas estructurar páginas internas (ej. <code>/pages/perfil/ajustes</code>), crea subdirectorios bajo el directorio de la página padre (ej. <code>./src/pages/perfil/ajustes/</code>).",
        
        i18nRuleTitle: "⚠️ Regla Mandatoria sobre Textos Estáticos e i18n:",
        i18nRuleDesc: "Todas las páginas o subpáginas que contengan textos estáticos <strong>deben quedar configuradas obligatoriamente mediante el motor de internacionalización (i18n)</strong>. No se permiten textos crudos codificados directamente en los archivos HTML. Todo el contenido descriptivo y metadatos deben definirse en el diccionario central <a href=\"file:///Users/gonzaloarenasf/Documents/Github/BaP_Framework/src/_main/i18n/es-ES.js\">es-ES.js</a> y enlazarse en el HTML usando tokens formativos (ej. <code>{page.pages.body.title}</code>).",
        
        structureTitle: "Estructura Espejo Obligatoria por Página",
        structureDesc: "Siguiendo la metodología de la Landing Page principal, cada carpeta de página debe contener tres archivos mínimos:",
        configTitle: "Registro de Rutas y Telemetría (<code>bap.config.json</code>)",
        configDesc: "Cada nueva página que se cree en la aplicación debe registrarse en el archivo maestro de configuración <code>bap.config.json</code> para que el enrutador y el motor de analíticas la reconozcan:",
        routesLi: "<strong>Ruta (<code>routes.appRoutes</code>):</strong> Agrega un nuevo nodo con la clave de tu página, definiendo su <code>pathname</code> (ej. <code>/pages/mi-nueva-pagina/</code>):",
        analyticsLi: "<strong>Analíticas (<code>analytics.customEvents</code>):</strong> Agrega el evento de tipo <code>enter_page</code> para registrar la telemetría de entrada:",
        resourcesTitle: "Cómo Incorporar los Recursos del Framework",
        resourcesDesc: "Los archivos locales de cada página llaman a los recursos globales de la siguiente manera:",
        cssTitle: "1. En el archivo CSS (<code>index.css</code>)",
        cssDesc: "Importa los estilos y variables centrales usando la directiva de importación de CSS en la primera línea:",
        jsTitle: "2. En el archivo JS (<code>index.js</code>)",
        jsDesc: "Importa el orquestador de componentes, la analítica y el core para inicializar la vista de forma controlada:",
        htmlTitle: "3. En el archivo HTML (<code>index.html</code>)",
        htmlDesc: "Vincula tu CSS y JS locales, e incorpora las etiquetas de Custom Components nativos directamente en tu maquetación e internacionaliza usando tokens:",
        buildTitle: "Compilación Automática",
        buildDesc: "Al compilar la aplicación con <code>npm run optimize</code> o <code>npm run optimize:prod</code>, Gulp lee la carpeta <code>./src/pages/</code>, minifica y optimiza los HTML, concatena el CSS y obfuscación/minificación del JS depositando el bundle final en <code>./public/pages/{subpage}/</code>."
      }
    },
    style: {
      head: {
        title: "BaP Docs - Design System",
        meta: {
          title: "BaP Docs - Design System",
          description: "Especificaciones del sistema de diseño, guía tipográfica y reglas de arquitectura CSS en BaP Framework.",
          keywords: "Design, CSS, Colors, Typography, Forms, Stylesheet, Architecture",
        }
      },
      body: {
        title: "Sistema de Diseño y Hojas de Estilos (CSS)",
        desc: "Este directorio centraliza las directivas y variables del lenguaje de diseño visual de BaP Framework, permitiendo modularidad y adaptabilidad de temas de color nativamente.",
        filesTitle: "Archivos de Estilos (Directorio <code>./src/style/</code>)",
        colorsTitle: "1. Colores y Temas (<code>./src/style/colors.css</code>)",
        colorsDesc: "Define las variables CSS (Custom Properties) para el control del viewport y la interfaz gráfica. Los colores se dividen mediante clases aplicadas en la etiqueta <code>body</code>:",
        lightModeLi: "<strong>Modo Claro (<code>.light-mode</code>):</strong> Fondo claro con tipografía Midnight Blue y sombras suaves.",
        darkModeLi: "<strong>Modo Oscuro (<code>.dark-mode</code>):</strong> Fondo Midnight Blue oscuro con tipografía de alto contraste en cian eléctrico.",
        varsP: "Variables clave expuestas para desarrollo:",
        typographyTitle: "2. Tipografía y Estilos Base (<code>./src/style/main.css</code>)",
        typographyDesc: "Carga los recursos tipográficos desde Google Fonts e inicializa márgenes globales y transiciones:",
        spaceGroteskLi: "<strong><code>Space Grotesk</code>:</strong> Fuente sans-serif de estilo tecnológico utilizada para títulos principales (<code>h1</code>-<code>h6</code>), menús y marcas.",
        plusJakartaLi: "<strong><code>Plus Jakarta Sans</code>:</strong> Fuente legible y optimizada para lectura de párrafos de texto y elementos de formulario.",
        formsTitle: "3. Formularios y Botones (<code>./src/style/forms.css</code>)",
        formsDesc: "Estandariza los controles interactivos de inputs, checkboxes y botones. Ofrece clases comunes:",
        asBtnLi: "<code>.as-btn</code>: Estilo base para elementos que deben lucir como botones.",
        primaryLi: "<code>.primary</code> / <code>.btn-secondary</code>: Variaciones de énfasis y color de fondo.",
        titlesTitle: "4. Encabezados (<code>./src/style/titles.css</code>)",
        titlesDesc: "Establece la escala y el peso tipográfico de los títulos para mantener la jerarquía de lectura.",
        calloutTitle: "5. Cuadros de Alerta (Callout)",
        calloutDesc: "Mensajes destacados para guiar al usuario. Soporta el estilo por defecto (<code>.bap-callout</code>) y variaciones de sistema (<code>.docs-callout</code>):",
        tableTitle: "6. Tablas Estilizadas",
        tableDesc: "Tablas de datos y especificaciones limpias con cabeceras contrastadas y líneas divisorias:",
        breadcrumbsTitle: "7. Ruta de Navegación (Breadcrumbs)",
        breadcrumbsDesc: "Componente de ubicación que genera barras diagonales de separación dinámicamente usando selectores CSS nativos:",
        
        rulesTitle: "Tres Reglas de Arquitectura CSS",
        rulesDesc: "Para asegurar un desarrollo escalable, unificado y un código HTML limpio, todo desarrollo en BaP debe apegarse estrictamente a estas tres directivas:",
        rule1Title: "1. Estilos Reutilizables en ./src/style",
        rule1Desc: "Cualquier regla de estilo, fuente, color o utilidad de diseño que pueda ser compartida por más de una página o componente debe ubicarse centralizada en la guía de estilos global (<code>./src/style/</code>).",
        rule2Title: "2. Estilos Propios de la Página o Componente",
        rule2Desc: "Solo si un estilo es 100% particular y exclusivo de un módulo o página específica, se declarará en su hoja de estilos correspondiente (ej. <code>index.css</code> local de la carpeta de la página, o el <code>.css</code> del Web Component).",
        rule3Title: "3. Prohibición Absoluta de Estilos Inline",
        rule3Desc: "Nunca deben utilizarse atributos <code>style=\"...\"</code> inline directamente sobre etiquetas HTML. Todo el formato visual debe delegarse a clases o selectores de CSS externos.",
        
        integrationTitle: "Referencias Cruzadas e Integración",
        integrationDesc: "Referencias y acoplamientos del sistema de diseño:",
        headerLi: "<strong>Carga en el Componente de Cabecera:</strong> El componente <code>&lt;bap-header&gt;</code> expuesto en <a href=\"/pages/components/#bap-header\">/pages/components/</a> escucha los clics del selector de temas y alterna la clase en el <code>body</code> para propagar los colores del viewport definidos en <code>colors.css</code>.",
        gulpLi: "<strong>Compilación Gulp:</strong> La tarea de optimización en <code>./gulpfile.js</code> unifica, autodefíne prefijos de navegadores y minifica estas hojas de estilo. En producción, omite la generación de Source Maps."
      }
    },
    test: {
      head: {
        title: "BaP Docs - Testing Suite",
        meta: {
          title: "BaP Docs - Testing Suite",
          description: "Configuración de Vitest, emulación de JSDOM y guías de pruebas unitarias y de integración.",
          keywords: "Vitest, Testing, Unit testing, JSDOM, Coverage, Mocking, Firebase",
        }
      },
      body: {
        title: "Pruebas Unitarias y de Integración (Testing Suite)",
        desc: "Este directorio contiene la suite completa de pruebas unitarias y de integración del framework, estructurada como un espejo de la carpeta de código fuente de desarrollo.",
        infraTitle: "Entorno de Pruebas e Infraestructura",
        infraDesc: "La suite de pruebas de BaP Framework utiliza las siguientes herramientas técnicas:",
        vitestLi: "<strong>Vitest:</strong> Motor de ejecución de pruebas de última generación y alto rendimiento en JavaScript.",
        jsdomLi: "<strong>JSDOM:</strong> Emulador del navegador basado en software para Node.js, indispensable para instanciar, modificar y asertar el comportamiento del DOM en Custom Elements sin necesidad de abrir un navegador real.",
        setupLi: "<strong>Configuración Inicial (<code>./test/setup.js</code>):</strong> Prepara el entorno global, emula <code>window.location</code>, APIs de red y el cifrado local criptográfico (PBKDF2/AES-GCM de la Web Crypto API) para que los tests pasen exitosamente.",
        structureTitle: "Estructura Espejo del Directorio de Pruebas (<code>./test/</code>)",
        structureDesc: "Los archivos de pruebas emulan la misma disposición física del directorio de desarrollo:",
        mocksLi: "<strong><code>./test/mocks/</code>:</strong> Almacena simulaciones controladas del SDK de Google Firebase (Auth, Analytics, Realtime Database) para aislar las pruebas de llamadas a la red.",
        componentsLi: "<strong><code>./test/_components/</code>:</strong> Pruebas de integración para validar atributos, templates y eventos del DOM de Custom Elements (ej. <code>bap-dialog.test.js</code>).",
        mainLi: "<strong><code>./test/_main/</code>:</strong> Pruebas unitarias de cobertura lógica para enrutamiento, criptografía de almacenamiento, internacionalización y utilidades.",
        cmdsTitle: "Comandos del Desarrollador para Pruebas",
        coverageTitle: "📊 Reporte de Cobertura (Coverage):",
        coverageDesc: "El reporte de cobertura utiliza la herramienta <code>@vitest/coverage-v8</code> y escribe un reporte HTML navegable dentro del directorio <code>./coverage/</code> (el cual está ignorado en Git).",
        integrationTitle: "Referencias Cruzadas e Integración",
        integrationDesc: "Sinergias y configuración de testing:",
        vitestConfigLi: "<strong>Configuración de Vitest:</strong> Se configura globalmente desde el archivo maestro <code>./vitest.config.js</code> en el root del repositorio.",
        validatedCodeLi: "<strong>Código Validado:</strong> Los tests de esta suite apuntan de manera unificada a verificar la lógica contenida en <a href=\"/pages/core/\">/pages/core/</a> y componentes visuales en <a href=\"/pages/components/\">/pages/components/</a>."
      }
    },
    build: {
      head: {
        title: "BaP Docs - Ciclo de Desarrollo",
        meta: {
          title: "BaP Docs - Ciclo de Desarrollo",
          description: "Ciclo de desarrollo, pruebas unitarias y despliegue automatizado en BaP Framework.",
          keywords: "Desarrollo, Build, Vitest, Gulp, Servidor, Despliegue, Terminal",
        }
      },
      body: {
        title: "Ciclo de Desarrollo en la Terminal",
        desc: "BaP Framework expone una serie de scripts en NPM para simplificar el flujo de desarrollo, testing unitario y compilación de producción.",
        testTitle: "Pruebas Unitarias (Vitest)",
        testDesc: "Ejecuta los tests unitarios en un entorno DOM emulado mediante JSDOM para validar la integridad del core.",
        testWatchTitle: "Modo Observador (Watch)",
        testWatchDesc: "Mantiene Vitest en ejecución constante respondiendo a los cambios de código fuente en caliente.",
        testCoverageTitle: "Reportes de Cobertura (Coverage)",
        testCoverageDesc: "Genera estadísticas detalladas de cobertura de código por línea, funciones y archivos.",
        serverTitle: "Servidor de Desarrollo Local",
        serverDesc: "Levanta el servidor HTTP local con Hot-Reload y recarga en tiempo real sobre el navegador.",
        optimizeTitle: "Optimizar (Desarrollo)",
        optimizeDesc: "Compila, comprime y ofusca el código usando el entorno de desarrollo local para pruebas rápidas.",
        optimizeProdTitle: "Optimizar (Producción)",
        optimizeProdDesc: "Compila, comprime y ofusca el código usando el entorno de producción preparando para el despliegue.",
        deployProdTitle: "Desplegar a Producción",
        deployProdDesc: "Corre los tests, compila con el entorno de producción y sube los estáticos a Firebase Hosting.",
      }
    }
  },
};
