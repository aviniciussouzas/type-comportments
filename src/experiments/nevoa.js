import p5 from "p5";
import { createAbout } from "../about.js";

// NÉVOA — letras-fantasma / clareira de leitura
// Uma frase escura fica no fundo.
// Letras transparentes flutuam na frente como névoa.
// O mouse dispersa essas letras, revelando a frase com mais clareza.

let font;
let ghosts = [];

const LINES = [
  "There is no inside except as",
  "a folding of the outside;",
  "the mirror cracks,",
  "I am an other, and I always was.",
  "— Mark Fisher",
];

const PARAMS = {
  ghostCount: 200,
  ghostAlpha: 198,
  ghostSizeMin: 127,
  ghostSizeMax: 132,
  fogAreaWidth: 0.92,
  fogAreaHeight: 0.42,
  mouseRadius: 110,
  dispersionForce: 58,
  returnForce: 0.015,
  friction: 0.86,
  textAlpha: 190,
};

class GhostLetter {
  constructor(p, char, x, y) {
    this.char = char;
    this.home = { x, y };
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.size = p.random(PARAMS.ghostSizeMin, PARAMS.ghostSizeMax);
    this.alpha = p.random(8, PARAMS.ghostAlpha);
    this.phase = p.random(1000);
  }

  update(p) {
    let fx = (this.home.x - this.x) * PARAMS.returnForce;
    let fy = (this.home.y - this.y) * PARAMS.returnForce;

    // Drift mínimo para a névoa parecer viva
    const driftX = p.noise(this.phase, p.frameCount * 0.004) - 0.5;
    const driftY = p.noise(this.phase + 500, p.frameCount * 0.004) - 0.5;

    fx += driftX * 0.08;
    fy += driftY * 0.08;

    // Mouse abre uma clareira
    const dx = this.x - p.mouseX;
    const dy = this.y - p.mouseY;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < PARAMS.mouseRadius && d > 0.001) {
      const force = p.map(
        d,
        0,
        PARAMS.mouseRadius,
        PARAMS.dispersionForce,
        0,
        true
      );

      fx += (dx / d) * force;
      fy += (dy / d) * force;
    }

    this.vx = (this.vx + fx) * PARAMS.friction;
    this.vy = (this.vy + fy) * PARAMS.friction;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(p) {
    const dx = this.x - this.home.x;
    const dy = this.y - this.home.y;
    const displacement = Math.sqrt(dx * dx + dy * dy);

    // Quando dispersa, fica ainda mais transparente
    const alpha = p.map(displacement, 0, 90, this.alpha, 4, true);

    p.noStroke();
    p.fill(15, 15, 15, alpha);
    p.textSize(this.size);
    p.text(this.char, this.x, this.y);
  }
}

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    p.textFont(font);
    buildGhostFog(p);
  };

  p.draw = () => {
    p.background(247, 245, 240);

    drawBaseText(p);

    p.textAlign(p.CENTER, p.CENTER);
    p.textFont(font);

    for (const ghost of ghosts) {
      ghost.update(p);
      ghost.draw(p);
    }

    drawTechnicalLabel(p);
  };

  p.mousePressed = () => {
    buildGhostFog(p);
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    buildGhostFog(p);
  };
});

function buildGhostFog(p) {
  ghosts = [];

  const chars = LINES.join(" ").replace(/—/g, "").split("").filter((c) => {
    return c.trim() !== "";
  });

  const areaW = p.width * PARAMS.fogAreaWidth;
  const areaH = p.height * PARAMS.fogAreaHeight;

  const startX = p.width / 2 - areaW / 2;
  const startY = p.height / 2 - areaH / 2;

  for (let i = 0; i < PARAMS.ghostCount; i++) {
    const char = p.random(chars);

    // Distribuição mais concentrada no centro, mas sem virar bloco pesado
    const x = startX + p.random(areaW);
    const y = startY + p.random(areaH);

    ghosts.push(new GhostLetter(p, char, x, y));
  }
}

function drawBaseText(p) {
  const fontSize = Math.min(p.width * 0.032, 42);
  const lineHeight = fontSize * 1.42;

  const totalHeight = (LINES.length - 1) * lineHeight;
  const startY = p.height / 2 - totalHeight / 2;

  p.textFont(font);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(fontSize);

  p.noStroke();
  p.fill(15, 15, 15, PARAMS.textAlpha);

  for (let i = 0; i < LINES.length; i++) {
    p.text(LINES[i], p.width / 2, startY + i * lineHeight);
  }
}

function drawTechnicalLabel(p) {
  p.noStroke();
  p.fill(20, 20, 20, 95);
  p.textFont(font);
  p.textSize(12);
  p.textAlign(p.LEFT, p.BOTTOM);

  p.text(
    "NÉVOA · ghost letters · partial veil · mouse opens a clearing",
    24,
    p.height - 24
  );
}

createAbout({
  title: "NÉVOA",
  behavior:
    "A frase permanece ao fundo como estrutura legível. Na frente, letras-fantasma formam uma névoa tipográfica translúcida. Ao aproximar o mouse, a névoa se dispersa e abre uma clareira temporária de leitura.",
  concept:
    "letras-fantasma · véu tipográfico · dispersão · presença parcial · legibilidade",
  quote:
    "There is no inside except as a folding of the outside; the mirror cracks, I am an other, and I always was.<br>— Mark Fisher",
});