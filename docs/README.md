# Documentación Técnica del Sistema

Este directorio centraliza las especificaciones arquitectónicas, guías de actualización, informes de auditorías de seguridad y especificaciones de pruebas del framework.

## Contexto de los Archivos y Directorios

El directorio `./docs/` organiza los recursos documentales para desarrolladores y agentes de IA:

### 📁 `./docs/security-audits/`
Contiene los informes de seguridad y las correcciones de vulnerabilidades:
- [./docs/security-audits/security-audit-v2.0.1.md](./docs/security-audits/security-audit-v2.0.1.md): Reporte de auditoría detallando vulnerabilidades (de VUL-01 a VUL-15) identificadas en dependencias, almacenamiento y sanitización.
- [./docs/security-audits/security-fixes-v2.0.1.md](./docs/security-audits/security-fixes-v2.0.1.md): Bitácora de correcciones técnicas y mitigaciones implementadas en el core.

### 📁 `./docs/upgrades/`
Contiene las especificaciones técnicas de migración y planes de prueba:
- [./docs/upgrades/upgrade-v2.md](./docs/upgrades/upgrade-v2.md): Spec Book que detalla los breaking changes, rediseño de módulos y el plan para actualizar proyectos heredados a la versión 2.x.
- [./docs/upgrades/plan-de-pruebas-unitarias.md](./docs/upgrades/plan-de-pruebas-unitarias.md): Describe la estrategia, cobertura y directrices de pruebas de la suite de testing.

---

## Referencias Cruzadas e Integración

- **Suite de Pruebas**: El plan detallado en [./docs/upgrades/plan-de-pruebas-unitarias.md](./docs/upgrades/plan-de-pruebas-unitarias.md) se ejecuta físicamente a través de la suite ubicada en el directorio [./test/](./test/README.md).
- **Seguridad**: Las mitigaciones de seguridad descritas en `./docs/security-audits/` corresponden a la lógica de desinfección XSS de [./src/_main/i18n.js](./src/_main/i18n.js) y cifrado local AES-GCM en [./src/_main/storage.js](./src/_main/storage.js).
- **Control de Versiones y Rutas**: Las decisiones tomadas en `./docs/upgrades/` rigen el funcionamiento del enrutador dinámico en [./src/_main/router.js](./src/_main/router.js) y los esquemas en [./bap.config.json](./bap.config.json).
