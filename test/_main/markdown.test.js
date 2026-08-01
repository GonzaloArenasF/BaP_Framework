import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../../src/_main/markdown.js';

describe('markdown.js — parseMarkdown', () => {
  it('MD-01: retorna string vacía ante entradas falsy', () => {
    expect(parseMarkdown(null)).toBe('');
    expect(parseMarkdown(undefined)).toBe('');
    expect(parseMarkdown('')).toBe('');
  });

  it('MD-02: procesa formateo básico de texto (negrita y cursiva)', () => {
    const input = 'Texto **negrita** y __negrita2__ con *cursiva* y _cursiva2_.';
    const result = parseMarkdown(input);
    expect(result).toContain('<strong>negrita</strong>');
    expect(result).toContain('<strong>negrita2</strong>');
    expect(result).toContain('<em>cursiva</em>');
    expect(result).toContain('<em>cursiva2</em>');
  });

  it('MD-03: procesa encabezados de niveles 1, 2 y 3', () => {
    expect(parseMarkdown('# Título 1')).toContain('<h1>Título 1</h1>');
    expect(parseMarkdown('## Título 2')).toContain('<h2>Título 2</h2>');
    expect(parseMarkdown('### Título 3')).toContain('<h3>Título 3</h3>');
  });

  it('MD-04: procesa citas y blockquotes', () => {
    const result = parseMarkdown('> Esta es una cita');
    expect(result).toContain('<blockquote>Esta es una cita</blockquote>');
  });

  it('MD-05: procesa bloques de código y código en línea con escape HTML', () => {
    const inline = 'Usa `const x = <div />` aquí.';
    expect(parseMarkdown(inline)).toContain('<code>const x = <div /></code>');

    const block = "```javascript\nconst a = 1 & 2;\nconst b = '<test>';\n```";
    const result = parseMarkdown(block);
    expect(result).toContain('<pre><code>javascript\nconst a = 1 &amp; 2;\nconst b = &#039;&lt;test&gt;&#039;;</code></pre>');
  });

  it('MD-06: procesa y une listas desordenadas y ordenadas', () => {
    const unordered = "- Item 1\n- Item 2\n* Item 3";
    const resultUnordered = parseMarkdown(unordered);
    expect(resultUnordered).toContain('<ul><li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li></ul>');

    const ordered = "1. Primero\n2. Segundo";
    const resultOrdered = parseMarkdown(ordered);
    expect(resultOrdered).toContain('<ol><li>Primero</li>\n<li>Segundo</li></ol>');
  });

  it('MD-07: envuelve en párrafos y convierte saltos de línea simples en <br>', () => {
    const input = "Línea 1\nLínea 2\n\nLínea 3 en párrafo 2";
    const result = parseMarkdown(input);
    expect(result).toContain('<p>Línea 1<br>Línea 2</p>');
    expect(result).toContain('<p>Línea 3 en párrafo 2</p>');
  });
});
