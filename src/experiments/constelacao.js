import p5 from "p5";
import { createAbout } from "../about.js";

// CONSTELAÇÃO — campo gravitacional de palavras
// As palavras aparecem como nós legíveis.
// Conexões surgem entre palavras próximas.
// O mouse puxa o campo, mas cada nó resiste e retorna ao lugar.
// Click reorganiza a constelação.

const LINES = [
  "Existe quase um anseio sensual pela comunhão com outros",
  "que compartilham uma visão ampla.",
  "Mas quão raros eles são!",
  "A maioria das pessoas me deixa com uma sensação de vazio",
  "não porque lhes falte bondade,",
  "mas porque são incapazes de ver além",
  "dos limites estreitos de suas pequenas vidas cotidianas.",
  "— Pierre Teilhard de Chardin",
];

const PARAMS = {
  fontSizeMin: 14,
  fontSizeMax: 22,
  lineHeight: 1.9,

  connectionRadius: 170,
  maxConnections: 3,

  mouseRadius: 210,
  mouseGravity: 0.12,
  returnForce: 0.035,
  friction: 0.84,

  drift: 0.12,
  revealSpeed: 0.025,
};

let font;
let nodes = [];
let grid = {};
const CELL = 190;

function gridKey(x, y) {
  return `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;
}

function buildGrid(points) {
  grid = {};
  points.forEach((pt, i) => {
    const key = gridKey(pt.x, pt.y);
    if (!grid[key]) grid[key] = [];
    grid[key].push(i);
  });
}

function neighbors(px, py, radius) {
  const result = [];
  const cr = Math.ceil(radius / CELL);
  const cx = Math.floor(px / CELL);
  const cy = Math.floor(py / CELL);

  for (let dx = -cr; dx <= cr; dx++) {
    for (let dy = -cr; dy <= cr; dy++) {
      const key = `${cx + dx},${cy + dy}`;
      if (grid[key]) result.push(...grid[key]);
    }
  }

  return result;
}

class WordNode {
  constructor(p, word, x, y, lineIndex, wordIndex, revealDelay) {
    this.word = word;
    this.baseX = x;
    this.baseY = y;
    this.x = x + p.random(-24, 24);
    this.y = y + p.random(-18, 18);
    this.vx = 0;
    this.vy = 0;

    this.lineIndex = lineIndex;
    this.wordIndex = wordIndex;
    this.phase = p.random(1000);

    this.reveal = 0;
    this.revealDelay = revealDelay;

    this.mass = p.map(word.length, 1, 14, 0.85, 1.8, true);
    this.size = p.map(word.length, 1, 14, PARAMS.fontSizeMax, PARAMS.fontSizeMin, true);
  }

  update(p) {
    if (p.frameCount > this.revealDelay) {
      this.reveal = p.lerp(this.reveal, 1, PARAMS.revealSpeed);
    }

    let fx = (this.baseX - this.x) * PARAMS.returnForce;
    let fy = (this.baseY - this.y) * PARAMS.returnForce;

    // campo vivo mínimo
    const driftX = p.noise(this.phase, p.frameCount * 0.004) - 0.5;
    const driftY = p.noise(this.phase + 500, p.frameCount * 0.004) - 0.5;

    fx += driftX * PARAMS.drift;
    fy += driftY * PARAMS.drift;

    // mouse como corpo gravitacional: puxa, mas não destrói
    const dx = p.mouseX - this.x;
    const dy = p.mouseY - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < PARAMS.mouseRadius && d > 0.001) {
      const t = 1 - d / PARAMS.mouseRadius;
      const force = PARAMS.mouseGravity * t * t;

      fx += (dx / d) * force * 16;
      fy += (dy / d) * force * 16;
    }

    this.vx = (this.vx + fx / this.mass) * PARAMS.friction;
    this.vy = (this.vy + fy / this.mass) * PARAMS.friction;

    this.x += this.vx * this.reveal;
    this.y += this.vy * this.reveal;
  }

  draw(p) {
    p.textFont(font);
    p.textSize(this.size);
    p.textAlign(p.CENTER, p.CENTER);

    const alpha = p.map(this.reveal, 0, 1, 0, 225, true);

    p.noStroke();
    p.fill(15, 15, 15, alpha);
    p.text(this.word, this.x, this.y);
  }
}

function createWordConstellation(p) {
  nodes = [];

  const marginX = p.width * 0.09;
  const maxTextWidth = p.width - marginX * 2;

  const fontSize = Math.min(p.width * 0.018, 22);
  const lineHeight = fontSize * PARAMS.lineHeight;

  const totalHeight = (LINES.length - 1) * lineHeight;
  const startY = p.height / 2 - totalHeight / 2;

  p.textFont(font);
  p.textSize(fontSize);

  LINES.forEach((line, lineIndex) => {
    const words = line.split(" ");
    const widths = words.map((w) => p.textWidth(w));
    const gap = fontSize * 0.75;

    let totalWidth =
      widths.reduce((sum, w) => sum + w, 0) + gap * (words.length - 1);

    let scale = 1;

    if (totalWidth > maxTextWidth) {
      scale = maxTextWidth / totalWidth;
    }

    const effectiveFontSize = fontSize * scale;
    p.textSize(effectiveFontSize);

    const scaledWidths = words.map((w) => p.textWidth(w));
    const scaledGap = effectiveFontSize * 0.75;

    totalWidth =
      scaledWidths.reduce((sum, w) => sum + w, 0) +
      scaledGap * (words.length - 1);

    let x = p.width / 2 - totalWidth / 2;
    const y = startY + lineIndex * lineHeight;

    words.forEach((word, wordIndex) => {
      const w = scaledWidths[wordIndex];

      const jitterX = p.random(-8, 8);
      const jitterY = p.random(-6, 6);

      const revealDelay = lineIndex * 18 + wordIndex * 5;

      nodes.push(
        new WordNode(
          p,
          word,
          x + w / 2 + jitterX,
          y + jitterY,
          lineIndex,
          wordIndex,
          revealDelay
        )
      );

      x += w + scaledGap;
    });
  });

  buildGrid(nodes);
}

function drawConnections(p) {
  buildGrid(nodes);

  p.noFill();

  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    if (a.reveal < 0.12) continue;

    const possible = neighbors(a.x, a.y, PARAMS.connectionRadius);
    const connections = [];

    for (const j of possible) {
      if (j <= i) continue;

      const b = nodes[j];
      if (b.reveal < 0.12) continue;

      const d = p.dist(a.x, a.y, b.x, b.y);

      // evita excesso de linha horizontal óbvia
      const sameLinePenalty = a.lineIndex === b.lineIndex ? 0.78 : 1;

      if (d < PARAMS.connectionRadius * sameLinePenalty && d > 36) {
        connections.push({ j, d });
      }
    }

    connections
      .sort((a, b) => a.d - b.d)
      .slice(0, PARAMS.maxConnections)
      .forEach(({ j, d }) => {
        const b = nodes[j];

        const alpha =
          p.map(d, 36, PARAMS.connectionRadius, 74, 8, true) *
          Math.min(a.reveal, b.reveal);

        p.stroke(15, 15, 15, alpha);
        p.strokeWeight(0.6);
        p.line(a.x, a.y, b.x, b.y);
      });
  }
}

function drawGravityField(p) {
  p.noFill();

  p.stroke(15, 15, 15, 30);
  p.strokeWeight(1);
  p.circle(p.mouseX, p.mouseY, PARAMS.mouseRadius * 2);

  p.stroke(15, 15, 15, 55);
  p.strokeWeight(0.7);
  p.line(p.mouseX - 12, p.mouseY, p.mouseX + 12, p.mouseY);
  p.line(p.mouseX, p.mouseY - 12, p.mouseX, p.mouseY + 12);
}

function resetField(p) {
  nodes.forEach((n) => {
    n.x = n.baseX + p.random(-24, 24);
    n.y = n.baseY + p.random(-18, 18);
    n.vx = 0;
    n.vy = 0;
    n.reveal = 0;
  });
}

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");

    createWordConstellation(p);
  };

  p.draw = () => {
    p.background(247, 245, 240);

    for (const node of nodes) {
      node.update(p);
    }

    drawConnections(p);

    for (const node of nodes) {
      node.draw(p);
    }

    drawGravityField(p);
    drawTechnicalLabel(p);
  };

  p.mousePressed = () => {
    resetField(p);
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    createWordConstellation(p);
  };
});

function drawTechnicalLabel(p) {
  p.noStroke();
  p.fill(20, 20, 20, 100);
  p.textFont(font);
  p.textSize(12);
  p.textAlign(p.LEFT, p.BOTTOM);

  p.text(
    "CONSTELAÇÃO · palavras como nós · campo gravitacional · click reinicia",
    24,
    p.height - 24
  );
}

createAbout({
  title: "CONSTELAÇÃO",
  behavior:
    "As palavras aparecem gradualmente como nós de um campo textual. Conexões surgem por proximidade, formando uma constelação sem destruir a leitura. O mouse atua como um corpo gravitacional: puxa o campo, mas cada palavra resiste e retorna ao seu lugar.",
  concept:
    "grafo · palavra como nó · campo gravitacional · resistência elástica · proximidade",
  quote:
    "Existe quase um anseio sensual pela comunhão com outros que compartilham uma visão ampla.<br>— Pierre Teilhard de Chardin",
});