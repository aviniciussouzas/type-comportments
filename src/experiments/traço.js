import p5 from "p5";
import { createAbout } from "../about.js";

// TRAÇO — escrita visível pelo contorno
// Palavra grande, clima catálogo, desenho progressivo.
// O traço não precisa explicar a letra inteira o tempo todo:
// ele revela a forma por camadas, como estudo de path.

let font;
let paths = [];
let cursors = [];

const TEXT = "boundRIES";

const PARAMS = {
  sampleFactor: 0.32,
  gapThreshold: 42,
  trailLength: 95,
  baseSpeed: 1.35,
};

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    buildPaths(p);
  };

  p.draw = () => {
    p.background(247, 245, 240);

    drawGhostText(p);
    drawPaths(p);
    drawParameterPanel(p);
    drawTechnicalLabel(p);
  };

  p.mousePressed = () => {
    for (const cursor of cursors) {
      cursor.speed = p.random(0.6, 2.8);
      cursor.trail = [];
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    buildPaths(p);
  };
});

function buildPaths(p) {
  paths = [];
  cursors = [];

  const margin = p.width * 0.06;
  const maxWidth = p.width - margin * 2;

  let size = Math.min(p.width * 0.19, 300);

  p.textFont(font);
  p.textSize(size);

  while (p.textWidth(TEXT) > maxWidth && size > 90) {
    size *= 0.96;
    p.textSize(size);
  }

  const bounds = font.textBounds(TEXT, 0, 0, size);
  const x = p.width / 2 - bounds.w / 2;
  const y = p.height / 2 + bounds.h / 2;

  const pts = font.textToPoints(TEXT, x, y, size, {
    sampleFactor: PARAMS.sampleFactor,
    simplifyThreshold: 0,
  });

  let currentPath = [];

  for (let i = 0; i < pts.length; i++) {
    currentPath.push(pts[i]);

    if (i < pts.length - 1) {
      const dx = pts[i + 1].x - pts[i].x;
      const dy = pts[i + 1].y - pts[i].y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d > PARAMS.gapThreshold) {
        if (currentPath.length > 4) paths.push(currentPath);
        currentPath = [];
      }
    }
  }

  if (currentPath.length > 4) paths.push(currentPath);

  for (let i = 0; i < paths.length; i++) {
    cursors.push({
      index: p.random(paths[i].length),
      speed: PARAMS.baseSpeed + p.random(-0.45, 0.75),
      trail: [],
      trailLength: PARAMS.trailLength + p.floor(p.random(-30, 40)),
    });
  }
}

function drawGhostText(p) {
  const allPoints = paths.flat();

  p.noStroke();
  p.fill(20, 20, 20, 22);

  for (const pt of allPoints) {
    p.circle(pt.x, pt.y, 1.35);
  }
}

function drawPaths(p) {
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const cursor = cursors[i];

    cursor.index = (cursor.index + cursor.speed) % path.length;
    const pt = path[Math.floor(cursor.index)];

    cursor.trail.push({ x: pt.x, y: pt.y });

    if (cursor.trail.length > cursor.trailLength) {
      cursor.trail.shift();
    }

    // trilha principal
    p.noFill();

    for (let j = 1; j < cursor.trail.length; j++) {
      const a = cursor.trail[j - 1];
      const b = cursor.trail[j];

      const alpha = p.map(j, 0, cursor.trail.length, 0, 210);
      const weight = p.map(j, 0, cursor.trail.length, 0.35, 2.8);

      p.stroke(15, 15, 15, alpha);
      p.strokeWeight(weight);
      p.line(a.x, a.y, b.x, b.y);
    }

    // ponto de escrita
    p.noStroke();
    p.fill(15, 15, 15, 235);
    p.circle(pt.x, pt.y, 5.5);

    // anel técnico ao redor do cursor
    p.noFill();
    p.stroke(15, 15, 15, 90);
    p.strokeWeight(0.8);
    p.circle(pt.x, pt.y, 15);
  }
}

function drawParameterPanel(p) {
  const x = 24;
  const y = 24;
  const w = 320;
  const h = 136;

  p.noFill();
  p.stroke(20, 20, 20, 90);
  p.strokeWeight(1);
  p.rect(x, y, w, h);

  p.noStroke();
  p.fill(20, 20, 20, 180);
  p.textFont(font);
  p.textAlign(p.LEFT, p.TOP);

  p.textSize(11);
  p.text("TRAÇO / PARÂMETROS", x + 16, y + 16);

  p.textSize(12);
  p.fill(20, 20, 20, 135);

  p.text(`amostragem          ${PARAMS.sampleFactor}`, x + 16, y + 46);
  p.text(`quebra de path      ${PARAMS.gapThreshold}px`, x + 16, y + 68);
  p.text(`rastro              ${PARAMS.trailLength} pontos`, x + 16, y + 90);
  p.text(`velocidade base     ${PARAMS.baseSpeed}`, x + 16, y + 112);
}

function drawTechnicalLabel(p) {
  p.noStroke();
  p.fill(20, 20, 20, 115);
  p.textFont(font);
  p.textSize(12);
  p.textAlign(p.LEFT, p.BOTTOM);

  p.text(
    "TRAÇO · bezier contour · writing cursor · path memory · click recalibra",
    24,
    p.height - 24
  );
}

createAbout({
  title: "TRAÇO",
  behavior:
    "Um cursor percorre os contornos reais da palavra, deixando um rastro visível de escrita. A forma permanece como memória leve ao fundo, enquanto o traço ativo revela o caminho dos glifos.",
  concept:
    "contorno bezier · path · velocidade de escrita · rastro · memória da forma",
});