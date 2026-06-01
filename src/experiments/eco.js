import p5 from "p5";
import { createAbout } from "../about.js";

// ECO — rasterização + memória direcional
// Palavra convertida em grade discreta.
// Ecos surgem como cópias atrasadas, orientadas pelo mouse.

const WORD = "ECO";

const PARAMS = {
  cell: 7,
  copies: 7,
  maxOffset: 72,
  verticalDamping: 0.42,
  alphaDecay: 0.72,
};

let dots = [];
let fontFaceLoaded = false;

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    await loadFontFace();
    buildRaster(p);
  };

  p.draw = () => {
    p.background(247, 245, 240);
    p.noStroke();

    const mx = p.mouseX - p.width / 2;
    const my = p.mouseY - p.height / 2;
    const dist = Math.sqrt(mx * mx + my * my) || 1;

    const intensity = p.map(dist, 0, p.width * 0.5, 0, 1, true);
    const maxOff = PARAMS.maxOffset * intensity;

    // Ecos primeiro: memória atrás da palavra
    for (let i = PARAMS.copies; i >= 1; i--) {
      const t = i / PARAMS.copies;

      const ox = (mx / dist) * maxOff * t;
      const oy = (my / dist) * maxOff * t * PARAMS.verticalDamping;

      const alpha = 145 * Math.pow(PARAMS.alphaDecay, i);
      const dotSize = p.map(t, 0, 1, PARAMS.cell * 0.92, PARAMS.cell * 0.48);

      p.fill(15, 15, 15, alpha);

      for (const d of dots) {
        p.circle(d.x + ox, d.y + oy, d.bright * dotSize);
      }
    }

    // Palavra principal: presença
    p.fill(15, 15, 15, 235);
    for (const d of dots) {
      p.circle(d.x, d.y, d.bright * PARAMS.cell * 0.96);
    }

    drawParameterPanel(p, intensity);
    drawTechnicalLabel(p);
  };

  p.mousePressed = () => {
    buildRaster(p);
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    buildRaster(p);
  };
});

async function loadFontFace() {
  if (fontFaceLoaded) return;

  const face = new FontFace(
    "SpaceGroteskExp",
    "url(/fonts/SpaceGrotesk-Regular.ttf)"
  );

  await face.load();
  document.fonts.add(face);
  fontFaceLoaded = true;
}

function buildRaster(p) {
  dots = [];

  const size = Math.min(p.width * 0.24, 360);

  const g = p.createGraphics(p.width, p.height);
  g.pixelDensity(1);
  g.background(0);

  g.drawingContext.fillStyle = "#fff";
  g.drawingContext.font = `${size}px SpaceGroteskExp`;
  g.drawingContext.textAlign = "center";
  g.drawingContext.textBaseline = "middle";
  g.drawingContext.fillText(WORD, p.width / 2, p.height / 2);

  g.loadPixels();

  for (let y = 0; y < g.height; y += PARAMS.cell) {
    for (let x = 0; x < g.width; x += PARAMS.cell) {
      const cx = Math.floor(x + PARAMS.cell / 2);
      const cy = Math.floor(y + PARAMS.cell / 2);

      const idx = (cy * g.width + cx) * 4;
      const bright = (g.pixels[idx] || 0) / 255;

      if (bright > 0.35) {
        dots.push({
          x: cx,
          y: cy,
          bright,
        });
      }
    }
  }

  g.remove();
}

function drawParameterPanel(p, intensity) {
  const x = 24;
  const y = 24;
  const w = 310;
  const h = 156;

  p.noFill();
  p.stroke(20, 20, 20, 90);
  p.strokeWeight(1);
  p.rect(x, y, w, h);

  p.noStroke();
  p.fill(20, 20, 20, 180);
  p.textFont("SpaceGroteskExp");
  p.textAlign(p.LEFT, p.TOP);

  p.textSize(11);
  p.text("ECO / PARÂMETROS", x + 16, y + 16);

  p.textSize(12);
  p.fill(20, 20, 20, 135);

  p.text(`raster              ${PARAMS.cell}px`, x + 16, y + 46);
  p.text(`cópias              ${PARAMS.copies}`, x + 16, y + 68);
  p.text(`offset máximo       ${PARAMS.maxOffset}px`, x + 16, y + 90);
  p.text(`amortecimento Y     ${PARAMS.verticalDamping}`, x + 16, y + 112);
  p.text(`intensidade         ${intensity.toFixed(2)}`, x + 16, y + 134);
}

function drawTechnicalLabel(p) {
  p.noStroke();
  p.fill(20, 20, 20, 115);
  p.textFont("SpaceGroteskExp");
  p.textSize(12);
  p.textAlign(p.LEFT, p.BOTTOM);

  p.text(
    "ECO · raster grid · directional memory · mouse controls delay field",
    24,
    p.height - 24
  );
}

createAbout({
  title: "ECO",
  behavior:
    "A palavra é rasterizada em uma grade discreta de pontos. O mouse orienta uma sequência de cópias atrasadas, criando um eco direcional: quanto mais distante do centro, maior o deslocamento e mais longa a memória visual.",
  concept:
    "rasterização · memória direcional · eco visual · grid · repetição",
});