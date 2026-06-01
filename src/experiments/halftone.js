import p5 from "p5";
import { createAbout } from "../about.js";

// HALFTONE LED — texto digitado vira grade de pontos luminosos
// Como um placar de LED: cada célula dentro do caractere é um "pixel" aceso.
// Conceito: rasterização + quantização espacial.
// O glow cria a ilusão de emissão de luz — adição de alpha em camadas.

const CELL = 11;        // tamanho de cada LED
const LED_R = 255;      // cor do LED (âmbar quente)
const LED_G = 185;
const LED_B = 40;

let dots = [];
let fontReady = false;

function buildDots(p, text) {
  if (!fontReady || !text.trim()) { dots = []; return; }

  const SIZE = Math.min(160, Math.floor((p.width - 80) / Math.max(text.length, 1) * 1.55));
  const capped = Math.max(SIZE, 40);

  let g = p.createGraphics(p.width, p.height);
  g.pixelDensity(1);
  g.background(0);
  g.drawingContext.fillStyle = "#fff";
  g.drawingContext.font = `${capped}px SpaceGroteskLED`;
  g.drawingContext.textAlign = "center";
  g.drawingContext.textBaseline = "middle";
  g.drawingContext.fillText(text.toUpperCase(), p.width / 2, p.height / 2);
  g.loadPixels();

  dots = [];
  for (let y = 0; y < g.height; y += CELL) {
    for (let x = 0; x < g.width; x += CELL) {
      let cx = Math.floor(x + CELL / 2);
      let cy = Math.floor(y + CELL / 2);
      let idx = (cy * g.width + cx) * 4;
      let bright = (g.pixels[idx] || 0) / 255;
      if (bright > 0.3) dots.push({ x: cx, y: cy, bright });
    }
  }
  g.remove();
}

function drawLED(p, x, y, bright, t) {
  // Glow externo
  p.fill(LED_R, LED_G, LED_B, bright * 45);
  p.circle(x, y, CELL * 1.6);

  // Halo médio
  p.fill(LED_R, LED_G, LED_B, bright * 100);
  p.circle(x, y, CELL * 1.0);

  // Núcleo brilhante
  p.fill(255, 240, 180, bright * 250);
  p.circle(x, y, CELL * 0.55);

  // Especular (brilho pontual)
  p.fill(255, bright * 200);
  p.circle(x - CELL * 0.14, y - CELL * 0.14, CELL * 0.18);
}

new p5((p) => {
  let input;

  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);

    const face = new FontFace("SpaceGroteskLED", "url(/fonts/SpaceGrotesk-Regular.ttf)");
    await face.load();
    document.fonts.add(face);
    fontReady = true;

    // Campo de texto — estilo minimalista sobre o canvas
    input = document.createElement("input");
    input.type = "text";
    input.placeholder = "type a word";
    input.maxLength = 12;
    Object.assign(input.style, {
      position: "fixed",
      bottom: "28px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "transparent",
      border: "none",
      borderBottom: "1px solid #333",
      color: "#fff",
      fontFamily: "monospace",
      fontSize: "13px",
      letterSpacing: "0.3em",
      textAlign: "center",
      outline: "none",
      width: "220px",
      padding: "6px 0",
      zIndex: "100",
      textTransform: "uppercase",
    });
    document.body.appendChild(input);
    input.focus();

    input.addEventListener("input", () => buildDots(p, input.value));

    // Texto inicial
    buildDots(p, "TYPO");
    input.value = "TYPO";
  };

  p.draw = () => {
    p.background(8);
    p.noStroke();

    let t = p.frameCount * 0.04;

    for (let d of dots) {
      // Pulso suave individual — cada LED pisca levemente
      let pulse = 0.85 + 0.15 * Math.sin(t + d.x * 0.03 + d.y * 0.02);
      drawLED(p, d.x, d.y, d.bright * pulse, t);
    }
  };
});

createAbout({
  title: "HALFTONE LED",
  behavior: "Digite uma palavra. Cada caractere é rasterizado numa grade de pontos — cada célula vira um LED. O glow é construído em 3 camadas: halo externo, núcleo, especular. Ensina: quantização espacial e síntese de luz aditiva.",
  concept: "rasterização · LED · luz aditiva · quantização espacial",
});
