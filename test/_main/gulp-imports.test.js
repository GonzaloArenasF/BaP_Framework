/**
 * Tests para gulp-imports.js
 * Grupo: 🟢 Prioridad Baja
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

describe('gulp-imports.js', () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let readFileSyncSpy;

  beforeEach(() => {
    vi.resetModules();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    readFileSyncSpy = vi.spyOn(fs, 'readFileSync').mockImplementation(() => '');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Pruebas para loadEnv() a través de firebaseEnv
  describe('loadEnv()', () => {
    it('GLP-01: loadEnv con .env válido', async () => {
      readFileSyncSpy.mockReturnValue('KEY1=VALUE1\nKEY2=VALUE2');
      const { firebaseEnv } = await import('../../gulp-imports.js');
      
      expect(firebaseEnv).toHaveProperty('KEY1', 'VALUE1');
      expect(firebaseEnv).toHaveProperty('KEY2', 'VALUE2');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✅ .env cargado correctamente'));
    });

    it('GLP-02: loadEnv sin archivo .env', async () => {
      readFileSyncSpy.mockImplementation(() => { throw new Error('File not found'); });
      const { firebaseEnv } = await import('../../gulp-imports.js');
      
      expect(firebaseEnv).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️  No se encontró el archivo .env'));
    });

    it('GLP-03: loadEnv ignora comentarios', async () => {
      readFileSyncSpy.mockReturnValue('KEY1=VALUE1\n# Comentario\nKEY2=VALUE2');
      const { firebaseEnv } = await import('../../gulp-imports.js');
      
      expect(firebaseEnv).toHaveProperty('KEY1', 'VALUE1');
      expect(firebaseEnv).toHaveProperty('KEY2', 'VALUE2');
      expect(Object.keys(firebaseEnv)).not.toContain('# Comentario');
    });

    it('GLP-04: loadEnv ignora líneas vacías', async () => {
      readFileSyncSpy.mockReturnValue('KEY1=VALUE1\n\n\nKEY2=VALUE2\n');
      const { firebaseEnv } = await import('../../gulp-imports.js');
      
      expect(Object.keys(firebaseEnv).length).toBe(2);
      expect(firebaseEnv).toHaveProperty('KEY1', 'VALUE1');
      expect(firebaseEnv).toHaveProperty('KEY2', 'VALUE2');
    });

    it('GLP-05: loadEnv maneja valores con comillas', async () => {
      readFileSyncSpy.mockReturnValue('KEY1="VALUE1"\nKEY2=\'VALUE2\'\nKEY3=VALUE3');
      const { firebaseEnv } = await import('../../gulp-imports.js');
      
      expect(firebaseEnv.KEY1).toBe('VALUE1');
      expect(firebaseEnv.KEY2).toBe('VALUE2');
      expect(firebaseEnv.KEY3).toBe('VALUE3');
    });
  });

  // Pruebas para applyI18n
  describe('applyI18n', () => {
    beforeEach(() => {
      // Setup para estas pruebas
      readFileSyncSpy.mockReturnValue('');
    });

    it('GLP-06: applyI18n.common reemplaza tokens', async () => {
      const { default: gulpImports } = await import('../../gulp-imports.js');
      const { applyI18n, CONSTANT } = gulpImports;
      
      const input = '{lang} {ENV_URL} {CDN_URL} {head-app-name} {APP_VERSION}';
      const result = applyI18n.common(input);
      
      expect(result).toContain('es');
      expect(result).not.toContain('{lang}');
      expect(result).toContain(CONSTANT.APP_VERSION);
      expect(result).not.toContain('{APP_VERSION}');
    });

    it('GLP-07: applyI18n por página (pageIndex, page404)', async () => {
      const { default: gulpImports } = await import('../../gulp-imports.js');
      const { applyI18n, i18n } = gulpImports;
      
      // Index
      const inputIndex = '{head.meta.description} {head.title}';
      const resultIndex = applyI18n.pageIndex(inputIndex);
      expect(resultIndex).toContain(i18n.page.landing.head.title);
      expect(resultIndex).not.toContain('{head.title}');
      
      // 404
      const input404 = '{body.message} {body.backHome}';
      const result404 = applyI18n.page404(input404);
      expect(result404).toContain(i18n.page.notFound.body.message);
      expect(result404).toContain(i18n.page.notFound.body.backHome);
      expect(result404).not.toContain('{body.message}');
    });

    it('GLP-08: applyI18n componentes (bapFooter, bapHeader)', async () => {
      const { default: gulpImports } = await import('../../gulp-imports.js');
      const { applyI18n, i18n } = gulpImports;
      
      // Footer
      const inputFooter = '{versionLabel} {btnExplore}';
      const resultFooter = applyI18n.componentBapFooter(inputFooter);
      expect(resultFooter).toContain(i18n.component.bapFooter.versionLabel);
      expect(resultFooter).toContain(i18n.component.bapFooter.btnExplore);
      
      // Header
      const inputHeader = '{lightMode} {darkMode}';
      const resultHeader = applyI18n.componentBapHeader(inputHeader);
      expect(resultHeader).toContain(i18n.component.bapHeader.lightMode);
      expect(resultHeader).toContain(i18n.component.bapHeader.darkMode);
    });
  });
});
