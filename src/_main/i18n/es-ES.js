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
        // ── Playground ────────────────────────────────────────────────────
        playground: {
          sectionTitle: "🎮 Componentes Interactivos",
          logo: {
            title: "1. Componente ‹bap-logo›",
            description: "Muestra la identidad visual corporativa. Carga adaptativamente la constante de logo o utiliza un SVG premium vectorial.",
          },
          svgImage: {
            title: "2. Componente ‹bap-svg-image›",
            description: "Gestor estandarizado de vectores SVG para iconos responsivos sin llamadas HTTP individuales.",
          },
          notification: {
            title: "3. Componente ‹bap-notification›",
            description: "Notificaciones Toast y Snackbar con estilos inyectados directamente al Shadow Root para evitar fugas visuales.",
            btnToast: "Disparar Toast",
            btnAlert: "Disparar Alerta",
          },
          spinner: {
            title: "4. Componente ‹bap-spinner›",
            description: "Indicador de carga animado, modular y estilizado con la paleta de colores del framework.",
          },
          dialog: {
            title: "5. Componente ‹bap-dialog›",
            description: "Modal premium flotante con glassmorphism, difuminado de fondo, sanitización de HTML y enlaces seguros decodificados en Base64.",
            btnOpen: "Abrir Modal Diálogo",
          },
          loadingState: {
            title: "6. Componente ‹bap-loading-state›",
            description: "Bloqueador de pantalla completa para simular operaciones asíncronas largas y llamadas de red.",
            btnBlock: "Bloquear Pantalla (3s)",
          },
          chip: {
            title: "7. Componente ‹bap-chip›",
            description: "Etiquetas visuales de metadatos o tags estilizadas con bordes circulares y color de énfasis.",
          },
          header: {
            title: "8. Componente ‹bap-header›",
            description: "Cabecera modular integrada y responsiva. Administra automáticamente el menú hamburguesa móvil y control de sesión.",
            hint: "💡 Visualízalo fijo en la parte superior de esta página.",
          },
          footer: {
            title: "9. Componente ‹bap-footer›",
            description: "Pie de página unificado y responsivo. Se alinea de forma fluida adaptándose al viewport móvil y de escritorio.",
            hint: "💡 Visualízalo al pie de esta página.",
          },
        },
        // ── Terminal ──────────────────────────────────────────────────────
        terminal: {
          sectionTitle: "💻 Ciclo de Desarrollo en la Terminal",
          test: {
            title: "Pruebas Unitarias",
            description: "Ejecuta la suite completa de pruebas usando Vitest.",
          },
          testWatch: {
            title: "Pruebas (Watch Mode)",
            description: "Mantiene Vitest corriendo y reejecuta las pruebas al modificar archivos.",
          },
          testCoverage: {
            title: "Reporte de Cobertura",
            description: "Genera el reporte de cobertura de código (coverage) con Vitest.",
          },
          server: {
            title: "Servidor de Desarrollo",
            description: "Levanta el servidor HTTP local con Hot-Reload y recarga en tiempo real sobre el navegador.",
          },
          optimize: {
            title: "Optimizar (Desarrollo)",
            description: "Compila, comprime y ofusca el código usando <code>.env.development</code> para pruebas locales.",
          },
          optimizeProd: {
            title: "Optimizar (Producción)",
            description: "Compila, comprime y ofusca el código usando <code>.env.production</code> preparando para el despliegue.",
          },
          deployProd: {
            title: "Desplegar a Producción",
            description: "Corre los tests, compila con el entorno de producción y sube los estáticos a Firebase Hosting.",
          },
        },
      },
    },
  },
};
