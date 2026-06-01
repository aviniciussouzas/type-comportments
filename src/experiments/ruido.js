import p5 from "p5";
import { createAbout } from "../about.js";

// RUÍDO — legibilidade ↔ interferência
// A frase permanece como texto, mas sofre instabilidade:
// deslocamento, camadas desalinhadas, cortes horizontais e ruído ótico.

let font;

const TEXT_LINES = [
  "A palavra é minha",
  "quarta dimensão.",
  "Clarice Lispector",
];

let interference = 0;

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    p.textFont(font);
  };

  p.draw = () => {
    p.background(247, 245, 240);

    const mouseDist = p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2);
    const mouseForce = p.map(mouseDist, 0, p.width / 2, 1, 0, true);

    interference = p.lerp(interference, mouseForce, 0.06);

    drawTypographicBlock(p);
    drawInterferenceLines(p);
    drawTechnicalLabel(p);
  };

  p.mousePressed = () => {
    interference = 0;
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
});

function drawTypographicBlock(p) {
  const fontSize = Math.min(p.width * 0.062, 84);
  const lineHeight = fontSize * 1.35;

  const totalHeight = (TEXT_LINES.length - 1) * lineHeight;
  const startY = p.height / 2 - totalHeight / 2;

  p.textAlign(p.CENTER, p.CENTER);
  p.textFont(font);
  p.textSize(fontSize);

  for (let i = 0; i < TEXT_LINES.length; i++) {
    const line = TEXT_LINES[i];
    const y = startY + i * lineHeight;

    const noiseA = p.noise(i * 10, p.frameCount * 0.012);
    const noiseB = p.noise(i * 20 + 100, p.frameCount * 0.018);

    const shiftX = p.map(noiseA, 0, 1, -18, 18) * interference;
    const shiftY = p.map(noiseB, 0, 1, -5, 5) * interference;

    // camada principal: legibilidade
    p.noStroke();
    p.fill(15, 15, 15, 235);
    p.text(line, p.width / 2, y);

    // camada interferente: desalinhamento horizontal
    p.fill(15, 15, 15, 55 * interference);
    p.text(line, p.width / 2 + shiftX, y + shiftY);

    // camada oposta: eco de leitura
    p.fill(15, 15, 15, 35 * interference);
    p.text(line, p.width / 2 - shiftX * 0.6, y - shiftY * 0.6);

    // cortes horizontais
    drawSlicedText(p, line, p.width / 2, y, fontSize, interference, i);
  }
}

function drawSlicedText(p, line, x, y, size, amount, lineIndex) {
  const slices = 7;

  p.textFont(font);
  p.textSize(size);
  p.textAlign(p.CENTER, p.CENTER);

  const bounds = font.textBounds(line, x, y, size);
  const sliceH = bounds.h / slices;

  for (let s = 0; s < slices; s++) {
    const n = p.noise(lineIndex * 50, s * 10, p.frameCount * 0.018);
    const offset = p.map(n, 0, 1, -28, 28) * amount;

    if (amount < 0.08) continue;

    p.push();

    // clip por faixa horizontal
    p.drawingContext.save();
    p.drawingContext.beginPath();
    p.drawingContext.rect(
      0,
      y - bounds.h / 2 + s * sliceH,
      p.width,
      sliceH * 0.72
    );
    p.drawingContext.clip();

    p.fill(15, 15, 15, 55 * amount);
    p.noStroke();
    p.text(line, x + offset, y);

    p.drawingContext.restore();
    p.pop();
  }
}

function drawInterferenceLines(p) {
  const count = 18;

  p.strokeWeight(1);

  for (let i = 0; i < count; i++) {
    const y = p.map(i, 0, count - 1, p.height * 0.18, p.height * 0.82);
    const n = p.noise(i * 3, p.frameCount * 0.01);
    const alpha = p.map(n, 0, 1, 0, 38) * interference;

    p.stroke(15, 15, 15, alpha);
    p.line(p.width * 0.08, y, p.width * 0.92, y);
  }
}

function drawTechnicalLabel(p) {
  p.noStroke();
  p.fill(20, 20, 20, 115);
  p.textFont(font);
  p.textSize(12);
  p.textAlign(p.LEFT, p.BOTTOM);

  p.text(
    "RUÍDO · legibilidade ↔ interferência · mouse intensifica · click reseta",
    24,
    p.height - 24
  );
}

createAbout({
  title: "RUÍDO",
  behavior:
    "A frase permanece legível, mas sofre interferência visual: camadas desalinhadas, cortes horizontais e ruído ótico. A presença do mouse intensifica a instabilidade; o clique reduz a interferência.",
  concept:
    "legibilidade · interferência · ruído ótico · deslocamento · instabilidade",
  quote:
    "Liberdade é pouco. O que eu desejo ainda não tem nome.<br>— Clarice Lispector",
});