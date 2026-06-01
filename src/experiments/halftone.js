import p5 from "p5";
import { createAbout } from "../about.js";

// RETÍCULA — halftone óptico / rasterização tipográfica
// Texto vira matriz de pontos impressos.
// O mouse atua como uma lente de leitura da retícula.
// Scroll calibra a granulação da malha.

let font;
let dots = [];
let input;
let cellSize = 9;

const DEFAULT_WORD = "FORMA";

const PARAMS = {
  cellMin: 5,
  cellMax: 16,
  threshold: 0.28,
  dotScale: 0.92,
  lensRadius: 145,
  lensBoost: 1.85,
  distortion: 11,
};

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);

    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");

    createInput(p);
    buildDots(p, DEFAULT_WORD);
  };

  p.draw = () => {
    p.background(247, 245, 240);

    drawHalftone(p);
    drawLensGuide(p);
    drawTechnicalLabel(p);
  };

  p.mouseWheel = (event) => {
    cellSize += event.delta > 0 ? 1 : -1;
    cellSize = p.constrain(cellSize, PARAMS.cellMin, PARAMS.cellMax);
    buildDots(p, input.value || DEFAULT_WORD);
    return false;
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    buildDots(p, input.value || DEFAULT_WORD);
  };
});

function createInput(p) {
  const old = document.getElementById("halftone-input");
  if (old) old.remove();

  input = document.createElement("input");
  input.id = "halftone-input";
  input.type = "text";
  input.value = DEFAULT_WORD;
  input.maxLength = 12;

  Object.assign(input.style, {
    position: "fixed",
    bottom: "28px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(15,15,15,.45)",
    color: "#111",
    fontFamily: "Space Grotesk, Inter, sans-serif",
    fontSize: "12px",
    letterSpacing: "0.22em",
    textAlign: "center",
    outline: "none",
    width: "220px",
    padding: "7px 0",
    zIndex: "100",
    textTransform: "uppercase",
  });

  document.body.appendChild(input);

  input.addEventListener("input", () => {
    buildDots(p, input.value || DEFAULT_WORD);
  });
}

function buildDots(p, text) {
  dots = [];

  const word = text.trim().toUpperCase();
  if (!word) return;

  const g = p.createGraphics(p.width, p.height);
  g.pixelDensity(1);
  g.background(0);

  const size = Math.min(
    p.width * 0.22,
    310,
    (p.width - 120) / Math.max(word.length, 1) * 1.65
  );

  g.textFont(font);
  g.textAlign(p.CENTER, p.CENTER);
  g.textSize(size);
  g.noStroke();
  g.fill(255);
  g.text(word, p.width / 2, p.height / 2);

  g.loadPixels();

  for (let y = 0; y < g.height; y += cellSize) {
    for (let x = 0; x < g.width; x += cellSize) {
      const cx = Math.floor(x + cellSize / 2);
      const cy = Math.floor(y + cellSize / 2);
      const idx = (cy * g.width + cx) * 4;
      const bright = (g.pixels[idx] || 0) / 255;

      if (bright > PARAMS.threshold) {
        dots.push({ x: cx, y: cy, bright });
      }
    }
  }

  g.remove();
}

function drawHalftone(p) {
  const cx = p.mouseX;
  const cy = p.mouseY;

  p.noStroke();

  for (const d of dots) {
    const dx = d.x - cx;
    const dy = d.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const inside = dist < PARAMS.lensRadius;
    const t = inside ? 1 - dist / PARAMS.lensRadius : 0;

    const n = p.noise(d.x * 0.012, d.y * 0.012, p.frameCount * 0.006);

    const offsetX = inside
      ? Math.cos(n * Math.PI * 2) * PARAMS.distortion * t
      : 0;

    const offsetY = inside
      ? Math.sin(n * Math.PI * 2) * PARAMS.distortion * t
      : 0;

    const baseSize = cellSize * PARAMS.dotScale * d.bright;
    const size = baseSize * (inside ? 1 + t * PARAMS.lensBoost : 1);

    const alpha = inside ? 240 : 185;

    p.fill(15, 15, 15, alpha);
    p.circle(d.x + offsetX, d.y + offsetY, size);
  }
}

function drawLensGuide(p) {
  const r = PARAMS.lensRadius;

  p.noFill();
  p.stroke(15, 15, 15, 40);
  p.strokeWeight(1);
  p.circle(p.mouseX, p.mouseY, r * 2);

  p.stroke(15, 15, 15, 80);
  p.strokeWeight(0.7);
  p.line(p.mouseX - r - 12, p.mouseY, p.mouseX - r + 12, p.mouseY);
  p.line(p.mouseX + r - 12, p.mouseY, p.mouseX + r + 12, p.mouseY);
}

function drawTechnicalLabel(p) {
  p.noStroke();
  p.fill(20, 20, 20, 100);
  p.textFont(font);
  p.textSize(12);
  p.textAlign(p.LEFT, p.BOTTOM);

  p.text(
    `RETÍCULA · halftone matrix · cell ${cellSize}px · scroll calibra granulação`,
    24,
    p.height - 24
  );
}

createAbout({
  title: "RETÍCULA",
  behavior:
    "Digite uma palavra. A forma tipográfica é rasterizada em uma matriz de pontos. O mouse funciona como uma lente de inspeção: amplia, desloca e revela a granulação da letra. O scroll calibra a densidade da retícula.",
  concept:
    "halftone · rasterização · matriz · granulação · forma óptica",
});