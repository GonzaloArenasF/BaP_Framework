export const esES = {
  component: {
    bapFooter: {
      tc: "© 2026 <a href=\"http://gonzaloarenasf.cl\" target=\"_blank\" rel=\"noopener noreferrer\">Gonzalo A. Arenas Flores</a>. Licenciado bajo MIT. Libre de utilizar y distribuir. El software se proporciona 'tal cual', sin garantías y bajo responsabilidad exclusiva del usuario.",
    },
    bapHeader: {},
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
            constants: "Credenciales del entorno y URLs dinámicas de red.",
            router: "Motor de ruteo dinámico sin recarga física.",
            auth: "Gestión de sesión y doble factor por Whitelist.",
            storage: "Persistencia local y remota en Realtime Database.",
            i18n: "Soporte de traducción y localización dinámica.",
            analytics: "Telemetría y taxonomía unificada de eventos.",
            util: "Caja de herramientas estructurales y viewport móvil.",
          },
          firebase: {
            title: "🛡️ Firebase Integrado",
            description: "Integración nativa directa con los servicios en la nube de Google Firebase para dar soporte robusto a proyectos listos para producción:",
            hosting: "Alojamiento estático ultrarrápido y seguro.",
            auth: "Autenticación nativa utilizando el proveedor Google Identity.",
            realtimeDb: "Control de Whitelist de accesos y persistencia.",
            analytics: "Diccionario taxonómico unificado de telemetría.",
          },
          gulp: {
            title: "⚙️ Pipeline con Gulp",
            description: "Un potente compilador automatizado mediante scripts de consola. Asegura tu código de cliente y optimiza la velocidad antes de desplegar:",
            minify: "Compresión al extremo de HTML, CSS y JS.",
            obfuscation: "Protección intelectual de la lógica del cliente.",
            injection: "Reemplazo automático de variables de versión en HTML.",
            distribution: "Copiado y estructuración automática de assets y manifiestos.",
          },
        },
        // ── Playground ────────────────────────────────────────────────────
        playground: {
          sectionTitle: "🎮 Componentes Interactivos",
          logo: {
            title: "1. Componente &lt;bap-logo&gt;",
            description: "Muestra la identidad visual corporativa. Carga adaptativamente la constante de logo o utiliza un SVG premium vectorial.",
          },
          svgImage: {
            title: "2. Componente &lt;bap-svg-image&gt;",
            description: "Gestor estandarizado de vectores SVG para iconos responsivos sin llamadas HTTP individuales.",
          },
          notification: {
            title: "3. Componente &lt;bap-notification&gt;",
            description: "Notificaciones Toast y Snackbar con estilos inyectados directamente al Shadow Root para evitar fugas visuales.",
            btnToast: "Disparar Toast",
            btnAlert: "Disparar Alerta",
          },
          spinner: {
            title: "4. Componente &lt;bap-spinner&gt;",
            description: "Indicador de carga animado, modular y estilizado con la paleta de colores del framework.",
          },
          dialog: {
            title: "5. Componente &lt;bap-dialog&gt;",
            description: "Modal premium flotante con glassmorphism, difuminado de fondo y enlaces asíncronos Base64.",
            btnOpen: "Abrir Modal Diálogo",
          },
          loadingState: {
            title: "6. Componente &lt;bap-loading-state&gt;",
            description: "Bloqueador de pantalla completa para simular operaciones asíncronas largas y llamadas de red.",
            btnBlock: "Bloquear Pantalla (3s)",
          },
          chip: {
            title: "7. Componente &lt;bap-chip&gt;",
            description: "Etiquetas visuales de metadatos o tags estilizadas con bordes circulares y color de énfasis.",
          },
          header: {
            title: "8. Componente &lt;bap-header&gt;",
            description: "Cabecera modular integrada y responsiva. Administra automáticamente el menú hamburguesa móvil y control de sesión.",
            hint: "💡 Visualízalo fijo en la parte superior de esta página.",
          },
          footer: {
            title: "9. Componente &lt;bap-footer&gt;",
            description: "Pie de página unificado y responsivo. Se alinea de forma fluida adaptándose al viewport móvil y de escritorio.",
            hint: "💡 Visualízalo al pie de esta página.",
          },
        },
        // ── Terminal ──────────────────────────────────────────────────────
        terminal: {
          sectionTitle: "💻 Ciclo de Desarrollo en la Terminal",
          server: {
            title: "Servidor de Desarrollo",
            description: "Levanta el servidor HTTP local con Hot-Reload y recarga en tiempo real sobre el navegador.",
          },
          optimize: {
            title: "Optimizar para Producción",
            description: "Compila, comprime, aplica I18N y ofusca el código fuente moviéndolo a la carpeta <code>/public</code>.",
          },
          deploy: {
            title: "Desplegar a Firebase",
            description: "Sube y aloja instantáneamente tu aplicación optimizada en la infraestructura productiva de Firebase.",
          },
        },
      },
    },
  },
};
