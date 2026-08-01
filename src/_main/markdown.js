/**
 * BaP Custom Markdown Parser
 * Un parseador ligero de Markdown a HTML nativo para el framework BaP.
 */
export function parseMarkdown(md) {
  if (!md) return "";

  // Normalizar retornos de carro
  let text = md.replace(/\r\n/g, '\n');

  // Bloques de código
  text = text.replace(/```([\s\S]*?)```/g, function (match, code) {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Código en línea
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Negrita
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Cursiva
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');

  // Encabezados
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  text = text.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Listas desordenadas
  text = text.replace(/^\s*[\-\*] (.*)/gim, '<ul><li>$1</li></ul>');
  // Juntar listas consecutivas
  text = text.replace(/<\/ul>\n<ul>/g, '\n');

  // Listas ordenadas
  text = text.replace(/^\s*\d+\. (.*)/gim, '<ol><li>$1</li></ol>');
  text = text.replace(/<\/ol>\n<ol>/g, '\n');

  // Párrafos (separa por dobles saltos de línea y envuelve en <p> lo que no sea tag de bloque)
  let paragraphs = text.split(/\n\n+/);
  paragraphs = paragraphs.map(p => {
    // Si empieza con un tag HTML de bloque, no lo envolvemos
    if (/^<(h[1-6]|ul|ol|li|blockquote|pre|p)>/i.test(p)) {
      return p;
    }
    // Convertir saltos de línea simples en <br>
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  });
  text = paragraphs.join('\n');

  return text;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
