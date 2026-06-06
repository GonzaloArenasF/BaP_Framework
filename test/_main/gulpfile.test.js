/**
 * Tests para gulpfile.js
 * Grupo: 🟢 Prioridad Baja
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Vinyl from 'vinyl'; // Asegúrate de que vinyl o through2 esté disponible en los tests, pero vinyl es estándar para archivos Gulp.

// Mock de gulp-imports.js
vi.mock('../../gulp-imports.js', () => {
  return {
    default: {
      firebaseEnv: {
        FIREBASE_AVAILABLE: "true",
        apiKey: "test-api-key",
        authDomain: "test-auth-domain",
        databaseURL: "test-database-url",
        projectId: "test-project-id",
        storageBucket: "test-storage-bucket",
        messagingSenderId: "test-messaging-sender",
        appId: "test-app-id",
        measurementId: "test-measurement-id",
        RECAPTCHA_ID: "test-recaptcha-id",
        RECAPTCHA_NAME: "test-recaptcha-name",
        ENV_PROD: "prod-env",
        ENV_CDN: "cdn-env",
        CURRENT_ENV: "dev-env",
      },
      bapConfig: {
        app: {
          name: "BaP Framework Test",
          version: "v2.3.4",
          socialMedia: { email: "test@test.com" }
        }
      }
    }
  };
});

describe('gulpfile.js', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.resetModules();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const getStreamOutput = (stream, file) => {
    return new Promise((resolve, reject) => {
      stream.on('data', (newFile) => resolve(newFile));
      stream.on('error', (err) => reject(err));
      stream.write(file);
      stream.end();
    });
  };

  it('GLF-01: replaceEnvTokens reemplaza todos los tokens %%TOKEN%%', async () => {
    const { _test_replaceEnvTokens } = await import('../../gulpfile.js');
    
    const stream = _test_replaceEnvTokens();
    
    // Crear un archivo falso en memoria
    const fakeFile = new Vinyl({
      cwd: '/',
      base: '/test/',
      path: '/test/constants.js',
      contents: Buffer.from('const AP = "%%FIREBASE_AP%%"; const AD = "%%FIREBASE_AD%%"; const PROD = "%%ENV_PROD%%";')
    });

    const newFile = await getStreamOutput(stream, fakeFile);
    const content = newFile.contents.toString();

    expect(content).toContain('const AP = "test-api-key";');
    expect(content).toContain('const AD = "test-auth-domain";');
    expect(content).toContain('const PROD = "prod-env";');
    expect(content).not.toContain('%%FIREBASE_AP%%');
  });

  it('GLF-02: VUL-04 Producción + Firebase config + FIREBASE_AVAILABLE=false -> Error', async () => {
    const appImports = await import('../../gulp-imports.js');
    appImports.default.firebaseEnv.CURRENT_ENV = "prod-env";
    appImports.default.firebaseEnv.FIREBASE_AVAILABLE = "false";
    appImports.default.firebaseEnv.apiKey = "some-key";

    const { _test_replaceEnvTokens } = await import('../../gulpfile.js');
    const stream = _test_replaceEnvTokens();
    
    const fakeFile = new Vinyl({
      path: 'constants.js',
      contents: Buffer.from('test')
    });

    await expect(getStreamOutput(stream, fakeFile)).rejects.toThrow(/VUL-04/);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('VUL-04'));
  });

  it('GLF-03: VUL-04 Producción + Firebase config + FIREBASE_AVAILABLE=true -> OK', async () => {
    const appImports = await import('../../gulp-imports.js');
    appImports.default.firebaseEnv.CURRENT_ENV = "prod-env";
    appImports.default.firebaseEnv.FIREBASE_AVAILABLE = "true";
    appImports.default.firebaseEnv.apiKey = "some-key";

    const { _test_replaceEnvTokens } = await import('../../gulpfile.js');
    const stream = _test_replaceEnvTokens();
    
    const fakeFile = new Vinyl({
      path: 'constants.js',
      contents: Buffer.from('test')
    });

    const newFile = await getStreamOutput(stream, fakeFile);
    expect(newFile.contents.toString()).toBe('test');
  });

  it('GLF-04: VUL-04 No producción -> no valida', async () => {
    const appImports = await import('../../gulp-imports.js');
    appImports.default.firebaseEnv.CURRENT_ENV = "dev-env";
    appImports.default.firebaseEnv.FIREBASE_AVAILABLE = "false";
    appImports.default.firebaseEnv.apiKey = "some-key";

    const { _test_replaceEnvTokens } = await import('../../gulpfile.js');
    const stream = _test_replaceEnvTokens();
    
    const fakeFile = new Vinyl({
      path: 'constants.js',
      contents: Buffer.from('test')
    });

    // Como no es producción, aunque FIREBASE_AVAILABLE sea false, no lanza error
    const newFile = await getStreamOutput(stream, fakeFile);
    expect(newFile.contents.toString()).toBe('test');
  });
});
