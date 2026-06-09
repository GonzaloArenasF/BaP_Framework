/**
 * Tests para es-ES.js (Localización)
 * Grupo: 🟣 Prioridad Complementaria
 */
import { describe, it, expect } from 'vitest';
import { esES } from '../../src/_main/i18n/es-ES.js';

describe('es-ES.js', () => {
  it('LOC-01: Debe contener las secciones principales "component" y "page"', () => {
    expect(esES).toHaveProperty('component');
    expect(esES).toHaveProperty('page');
  });

  it('LOC-02: bapFooter debe contener las claves requeridas', () => {
    const footer = esES.component.bapFooter;
    expect(footer).toBeDefined();
    expect(footer).toHaveProperty('tc');
    expect(footer).toHaveProperty('brandDesc');
    expect(footer).toHaveProperty('versionLabel');
    expect(footer).toHaveProperty('resourcesLabel');
    expect(footer).toHaveProperty('btnExplore');
    expect(footer).toHaveProperty('contactLabel');
  });

  it('LOC-03: bapHeader debe contener las claves requeridas', () => {
    const header = esES.component.bapHeader;
    expect(header).toBeDefined();
    expect(header).toHaveProperty('lightMode');
    expect(header).toHaveProperty('darkMode');
  });

  it('LOC-04: cross.notification debe contener mensajes de error de sesión y query params', () => {
    const notification = esES.page.cross.notification;
    expect(notification).toBeDefined();
    expect(notification).toHaveProperty('loginFail');
    expect(notification).toHaveProperty('logoutFail');
    expect(notification).toHaveProperty('notAllowedEnteringPage');
    expect(notification).toHaveProperty('errorGettingQueryParams');
  });

  it('LOC-05: cross.notification.storage debe contener mensajes de error de base de datos', () => {
    const storage = esES.page.cross.notification.storage;
    expect(storage).toBeDefined();
    expect(storage).toHaveProperty('errorGetting');
    expect(storage).toHaveProperty('errorSaving');
    expect(storage).toHaveProperty('errorUpdating');
    expect(storage).toHaveProperty('errorRemoving');
  });

  it('LOC-06: page landing debe contener hero, core, docs, sidebar', () => {
    const landing = esES.page.landing;
    expect(landing).toBeDefined();
    expect(landing).toHaveProperty('head');
    expect(landing.body).toHaveProperty('hero');
    expect(landing.body).toHaveProperty('core');
    expect(landing.body).toHaveProperty('docs');
    expect(landing.body).toHaveProperty('sidebar');
  });

  it('LOC-07: page notFound debe contener message y backHome', () => {
    const notFound = esES.page.notFound;
    expect(notFound).toBeDefined();
    expect(notFound).toHaveProperty('head');
    expect(notFound.body).toHaveProperty('message');
    expect(notFound.body).toHaveProperty('backHome');
  });

  it('LOC-08: No debe contener strings vacíos, nulls o undefined', () => {
    const checkNoEmptyValues = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          checkNoEmptyValues(obj[key]);
        } else {
          expect(obj[key]).toBeDefined();
          expect(obj[key]).not.toBeNull();
          if (typeof obj[key] === 'string') {
            expect(obj[key].trim()).not.toBe('');
          }
        }
      }
    };

    checkNoEmptyValues(esES);
  });
});
