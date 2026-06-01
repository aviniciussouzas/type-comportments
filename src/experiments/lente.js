import p5 from "p5";
import { createAbout } from "../about.js";

// LENTE — instrumento óptico calibrável
// Texto legível ao fundo.
// A lente segue o cursor.
// Scroll calibra raio, ampliação, distorção e expansão do contorno.

let font;
let baseLayer;
let outlinePoints = [];
let lensPower = 0.5;

const LINES = ["olhar é sempre", "uma hipótese"];

const PARAMS = {
  lensRadiusMin: 72,
  lensRadiusMax: 170,
  magnificationMin: 1.08,
  magnificationMax: 1.9,
  distortionMin: 0.02,
  distortionMax: 0.32,
  outlineSample: 0.16,
  outlineExpansionMin: 3,
  outlineExpansionMax: 16,
};

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    buildBaseLayer(p);
    buildOutline(p);
  };

  p.draw = () => {
    p.background(247, 245, 240);

    p.image(baseLayer, 0, 0);

    const cx = p.mouseX;
    const cy = p.mouseY;

    drawLensDistortion(p, cx, cy);
    drawExpandedOutline(p, cx, cy);
    drawLensFrame(p, cx, cy);
    drawTechnicalLabel(p);
  };

  p.mouseWheel = (event) => {
    lensPower += event.delta > 0 ? -0.06 : 0.06;
    lensPower = p.constrain(lensPower, 0, 1);
    return false;
  };

  p.mousePressed = () => {
    lensPower = 0.5;
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    buildBaseLayer(p);
    buildOutline(p);
  };
});

function getLensRadius(p) {
  return p.lerp(PARAMS.lensRadiusMin, PARAMS.lensRadiusMax, lensPower);
}

function getMagnification(p) {
  return p.lerp(PARAMS.magnificationMin, PARAMS.magnificationMax, lensPower);
}

function getDistortion(p) {
  return p.lerp(PARAMS.distortionMin, PARAMS.distortionMax, lensPower);
}

function getOutlineExpansion(p) {
  return p.lerp(
    PARAMS.outlineExpansionMin,
    PARAMS.outlineExpansionMax,
    lensPower
  );
}

function buildBaseLayer(p) {
  baseLayer = p.createGraphics(p.width, p.height);
  baseLayer.pixelDensity(1);
  baseLayer.background(247, 245, 240);

  const fontSize = Math.min(p.width * 0.082, 112);
  const lineHeight = fontSize * 1.08;

  const totalHeight = (LINES.length - 1) * lineHeight;
  const startY = p.height / 2 - totalHeight / 2;

  baseLayer.textFont(font);
  baseLayer.textAlign(p.CENTER, p.CENTER);
  baseLayer.textSize(fontSize);
  baseLayer.noStroke();
  baseLayer.fill(15, 15, 15, 205);

  for (let i = 0; i < LINES.length; i++) {
    baseLayer.text(LINES[i], p.width / 2, startY + i * lineHeight);
  }
}

function buildOutline(p) {
  outlinePoints = [];

  const fontSize = Math.min(p.width * 0.082, 112);
  const lineHeight = fontSize * 1.08;

  const totalHeight = (LINES.length - 1) * lineHeight;
  const startY = p.height / 2 - totalHeight / 2;

  p.textFont(font);
  p.textSize(fontSize);

  for (let i = 0; i < LINES.length; i++) {
    const line = LINES[i];
    const bounds = font.textBounds(line, 0, 0, fontSize);

    const x = p.width / 2 - bounds.w / 2;
    const y = startY + i * lineHeight + bounds.h / 2;

    const pts = font.textToPoints(line, x, y, fontSize, {
      sampleFactor: PARAMS.outlineSample,
      simplifyThreshold: 0,
    });

    outlinePoints.push(...pts);
  }
}

function drawLensDistortion(p, cx, cy) {
  const r = getLensRadius(p);
  const magnification = getMagnification(p);
  const distortion = getDistortion(p);

  p.push();

  p.drawingContext.save();
  p.drawingContext.beginPath();
  p.drawingContext.arc(cx, cy, r, 0, Math.PI * 2);
  p.drawingContext.clip();

  p.noStroke();
  p.fill(247, 245, 240, 235);
  p.circle(cx, cy, r * 2);

  const slices = 46;
  const sliceH = (r * 2) / slices;

  for (let i = 0; i < slices; i++) {
    const sy = cy - r + i * sliceH;
    const dy = sy;

    const normalized = p.map(i, 0, slices - 1, -1, 1);

    const wave =
      Math.sin(normalized * Math.PI) *
      distortion *
      r *
      p.noise(i * 0.1, p.frameCount * 0.01);

    const sx = cx - r / magnification - wave;
    const sw = (r * 2) / magnification;
    const sh = sliceH / magnification;

    const dx = cx - r;
    const dw = r * 2;

    p.image(
      baseLayer,
      dx,
      dy,
      dw,
      sliceH + 1,
      sx,
      sy - sh / 2,
      sw,
      sh + 1
    );
  }

  p.drawingContext.restore();
  p.pop();
}

function drawExpandedOutline(p, cx, cy) {
  const r = getLensRadius(p);
  const expansion = getOutlineExpansion(p);

  p.noFill();
  p.stroke(15, 15, 15, 90);
  p.strokeWeight(0.7);

  for (const pt of outlinePoints) {
    const dx = pt.x - cx;
    const dy = pt.y - cy;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < r && d > 0.001) {
      const t = 1 - d / r;
      const ex = pt.x + (dx / d) * expansion * t;
      const ey = pt.y + (dy / d) * expansion * t;

      p.point(ex, ey);
    }
  }
}

function drawLensFrame(p, cx, cy) {
  const r = getLensRadius(p);

  p.noFill();

  p.stroke(15, 15, 15, 34);
  p.strokeWeight(1);
  p.circle(cx, cy, r * 2);

  p.stroke(15, 15, 15, 95);
  p.strokeWeight(0.8);
  p.circle(cx, cy, r * 2 + 8);

  p.stroke(15, 15, 15, 70);
  p.line(cx - r - 14, cy, cx - r + 12, cy);
  p.line(cx + r - 12, cy, cx + r + 14, cy);
  p.line(cx, cy - r - 14, cx, cy - r + 12);
  p.line(cx, cy + r - 12, cx, cy + r + 14);

  p.noStroke();
  p.fill(15, 15, 15, 120);
  p.textFont(font);
  p.textSize(11);
  p.textAlign(p.LEFT, p.TOP);
  p.text(`r ${Math.round(r)}px`, cx + r + 18, cy - 18);
  p.text(`p ${lensPower.toFixed(2)}`, cx + r + 18, cy - 2);
}

function drawTechnicalLabel(p) {
  p.noStroke();
  p.fill(20, 20, 20, 100);
  p.textFont(font);
  p.textSize(12);
  p.textAlign(p.LEFT, p.BOTTOM);

  p.text(
    `LENTE · scroll calibra óptica · power ${lensPower.toFixed(
      2
    )} · click reseta`,
    24,
    p.height - 24
  );
}

createAbout({
  title: "LENTE",
  behavior:
    "O texto permanece legível como camada base. Uma lente acompanha o cursor e amplia a área observada por faixas horizontais. O scroll calibra raio, ampliação, distorção e expansão do contorno; o clique retorna ao estado médio.",
  concept:
    "lente · ampliação · distorção óptica · calibração · observação",
});