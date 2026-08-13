import { describe, it, expect, vi } from 'vitest';
import { generateContent, generateContentWithRetryAndFallback } from '../../src/_main/ai.js';
import { CONSTANT } from '../../src/_main/constants.js';

describe('ai.js — Módulo de Cliente Google Gemini', () => {
  it('AI-01: CONSTANT.AI debe existir y tener la estructura esperada', () => {
    expect(CONSTANT.AI).toBeDefined();
    expect(Array.isArray(CONSTANT.AI.MODELS)).toBe(true);
    expect(CONSTANT.AI.MODELS.length).toBeGreaterThan(0);
    expect(typeof CONSTANT.AI.TEMPERATURE).toBe('number');
  });

  it('AI-02: generateContent lanza error si no hay API Key configurada', async () => {
    await expect(generateContent('Hola')).rejects.toThrow('No se ha configurado la API Key');
  });

  it('AI-03: generateContent lanza error si no se pasa ni prompt, ni archivo, ni historial', async () => {
    // Si sobreescribimos temporalmente API_KEY para esta prueba de validación
    const origKey = CONSTANT.AI.API_KEY;
    CONSTANT.AI.API_KEY = 'test_key';
    try {
      await expect(generateContent('', { history: [] })).rejects.toThrow('Debe proporcionar al menos un texto');
    } finally {
      CONSTANT.AI.API_KEY = origKey;
    }
  });

  it('AI-04: generateContentWithRetryAndFallback lanza error si la lista de modelos está vacía', async () => {
    const fakeGenAI = {};
    await expect(
      generateContentWithRetryAndFallback(fakeGenAI, { systemInstruction: '' }, 'prompt', [])
    ).rejects.toThrow();
  });
});
