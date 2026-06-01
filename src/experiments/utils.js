/**
 * Coleta pontos de múltiplas linhas de texto, centralizando verticalmente.
 * @param {p5} p
 * @param {opentype.Font} font
 * @param {string[]} lines  - array de strings, uma por linha
 * @param {number} fontSize
 * @param {number} sampleFactor
 * @returns {{ x: number, y: number, pathIndex: number }[]}
 */
export function collectTextPoints(p, font, lines, fontSize, sampleFactor = 0.25) {
  const lineHeight = fontSize * 1.45;
  const totalHeight = (lines.length - 1) * lineHeight;
  const baseY = p.height / 2 + fontSize * 0.35 - totalHeight / 2;

  let all = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const bounds = font.textBounds(line, 0, 0, fontSize);
    const x = (p.width - bounds.w) / 2;
    const y = baseY + i * lineHeight;
    const pts = font.textToPoints(line, x, y, fontSize, { sampleFactor });
    all = all.concat(pts);
  }
  return all;
}
