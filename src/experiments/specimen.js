import p5 from "p5";
import { createAbout } from "../about.js";

// ESPECIMEN — prova tipográfica viva
// A letra como sistema visual.
// Mouse controla tracking e escala.
// Scroll calibra intensidade da variação.
// Click alterna palavra central.

let font;
let input;

const WORDS = ["FORMA", "SINAL", "TIPO", "CAMPO", "RITMO"];
let wordIndex = 0;
let specimenPower = 0.45;

const PARAMS = {
  trackingMin: -8,
  trackingMax: 34,
  scaleMin: 0.88,
  scaleMax: 1.18,
  axisMin: 0,
  axisMax: 1,
};

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    createInput(p);
  };

  p.draw = () => {
    p.background(247, 245, 240);

    drawGrid(p);
    drawHeader(p);
    drawMainSpecimen(p);
    drawAlphabetBlock(p);
    drawScaleBlock(p);
    drawAnatomyBlock(p);
    drawFooter(p);
  };

  p.mouseWheel = (event) => {
    specimenPower += event.delta > 0 ? -0.05 : 0.05;
    specimenPower = p.constrain(specimenPower, 0, 1);
    return false;
  };

  p.mousePressed = () => {
    wordIndex = (wordIndex + 1) % WORDS.length;
    input.value = WORDS[wordIndex];
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
});

function createInput(p) {
  const old = document.getElementById("specimen-input");
  if (old) old.remove();

  input = document.createElement("input");
  input.id = "specimen-input";
  input.type = "text";
  input.value = WORDS[wordIndex];
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
}

function currentWord() {
  return (input?.value || WORDS[wordIndex] || "FORMA").toUpperCase();
}

function getTracking(p) {
  const mouseFactor = p.map(p.mouseX, 0, p.width, 0, 1, true);
  return p.lerp(PARAMS.trackingMin, PARAMS.trackingMax, mouseFactor);
}

function getScale(p) {
  const mouseFactor = p.map(p.mouseY, 0, p.height, 1, 0, true);
  return p.lerp(PARAMS.scaleMin, PARAMS.scaleMax, mouseFactor);
}

function drawGrid(p) {
  const margin = 24;
  const cols = 12;
  const w = p.width - margin * 2;
  const colW = w / cols;

  p.stroke(15, 15, 15, 28);
  p.strokeWeight(1);

  p.noFill();
  p.rect(margin, margin, p.width - margin * 2, p.height - margin * 2);

  for (let i = 1; i < cols; i++) {
    const x = margin + colW * i;
    p.line(x, margin, x, p.height - margin);
  }

  p.line(margin, 96, p.width - margin, 96);
  p.line(margin, p.height * 0.68, p.width - margin, p.height * 0.68);
}

function drawHeader(p) {
  p.textFont(font);
  p.noStroke();
  p.fill(15, 15, 15);

  p.textAlign(p.LEFT, p.TOP);
  p.textSize(12);
  p.text("ESPECIMEN / PROVA TIPOGRÁFICA VIVA", 44, 44);

  p.textAlign(p.RIGHT, p.TOP);
  p.text(
    `tracking ${Math.round(getTracking(p))} · scale ${getScale(p).toFixed(
      2
    )} · power ${specimenPower.toFixed(2)}`,
    p.width - 44,
    44
  );
}

function drawMainSpecimen(p) {
  const word = currentWord();
  const tracking = getTracking(p);
  const scale = getScale(p);

  const baseSize = Math.min(p.width * 0.18, 220) * scale;
  const x = p.width / 2;
  const y = p.height * 0.38;

  drawTrackedText(p, word, x, y, baseSize, tracking, p.CENTER, 230);

  // eco estrutural, quase como prova de registro
  drawTrackedText(
    p,
    word,
    x + tracking * specimenPower * 0.8,
    y + 16 * specimenPower,
    baseSize,
    tracking,
    p.CENTER,
    26
  );

  // linha de base e altura
  p.stroke(15, 15, 15, 48);
  p.strokeWeight(1);
  p.line(44, y + baseSize * 0.22, p.width - 44, y + baseSize * 0.22);
  p.line(44, y - baseSize * 0.46, p.width - 44, y - baseSize * 0.46);

  p.noStroke();
  p.fill(15, 15, 15, 95);
  p.textSize(11);
  p.textAlign(p.LEFT, p.CENTER);
  p.text("baseline", 44, y + baseSize * 0.22 - 8);
  p.text("cap height", 44, y - baseSize * 0.46 - 8);
}

function drawTrackedText(p, text, x, y, size, tracking, align, alpha) {
  p.textFont(font);
  p.textSize(size);
  p.textAlign(p.LEFT, p.CENTER);
  p.noStroke();
  p.fill(15, 15, 15, alpha);

  const chars = [...text];
  const widths = chars.map((c) => p.textWidth(c));
  const total =
    widths.reduce((sum, w) => sum + w, 0) + tracking * (chars.length - 1);

  let startX = align === p.CENTER ? x - total / 2 : x;

  for (let i = 0; i < chars.length; i++) {
    const phase = i * 0.7 + p.frameCount * 0.015;
    const jitter =
      Math.sin(phase) * specimenPower * 1.8 +
      (p.noise(i, p.frameCount * 0.01) - 0.5) * specimenPower * 2;

    p.text(chars[i], startX, y + jitter);
    startX += widths[i] + tracking;
  }
}

function drawAlphabetBlock(p) {
  const y = p.height * 0.74;
  const left = 44;

  p.noStroke();
  p.fill(15, 15, 15, 180);
  p.textFont(font);
  p.textAlign(p.LEFT, p.TOP);

  p.textSize(11);
  p.text("ALFABETO", left, y);

  p.textSize(28);
  p.fill(15, 15, 15, 210);
  p.text("ABCDEFGHIJKLMNOPQRSTUVWXYZ", left, y + 26);

  p.textSize(22);
  p.fill(15, 15, 15, 155);
  p.text("abcdefghijklmnopqrstuvwxyz 0123456789", left, y + 66);
}

function drawScaleBlock(p) {
  const x = p.width * 0.58;
  const y = p.height * 0.735;

  p.noStroke();
  p.fill(15, 15, 15, 180);
  p.textFont(font);
  p.textAlign(p.LEFT, p.TOP);

  p.textSize(11);
  p.text("ESCALA", x, y);

  const sizes = [12, 18, 28, 42];

  let yy = y + 28;
  for (const s of sizes) {
    p.fill(15, 15, 15, 70);
    p.textSize(11);
    p.text(`${s} pt`, x, yy + s * 0.25);

    p.fill(15, 15, 15, 210);
    p.textSize(s);
    p.text("Ag", x + 54, yy);

    yy += s + 18;
  }
}

function drawAnatomyBlock(p) {
  const word = currentWord();
  const x = p.width * 0.78;
  const y = p.height * 0.735;

  p.noStroke();
  p.fill(15, 15, 15, 180);
  p.textFont(font);
  p.textAlign(p.LEFT, p.TOP);

  p.textSize(11);
  p.text("ANATOMIA", x, y);

  p.textSize(42);
  p.fill(15, 15, 15, 210);
  p.text(word[0] || "A", x, y + 28);

  p.stroke(15, 15, 15, 75);
  p.strokeWeight(1);
  p.line(x + 62, y + 44, x + 142, y + 44);
  p.line(x + 62, y + 78, x + 142, y + 78);

  p.noStroke();
  p.fill(15, 15, 15, 100);
  p.textSize(10);
  p.text("terminal", x + 150, y + 36);
  p.text("counter / mass", x + 150, y + 70);
}

function drawFooter(p) {
  p.noStroke();
  p.fill(20, 20, 20, 100);
  p.textFont(font);
  p.textSize(12);
  p.textAlign(p.LEFT, p.BOTTOM);

  p.text(
    "ESPECIMEN · mouse controla tracking/escala · scroll calibra instabilidade · click troca palavra",
    24,
    p.height - 24
  );
}

createAbout({
  title: "ESPECIMEN",
  behavior:
    "Uma prova tipográfica viva. A palavra central responde ao mouse por tracking e escala; o scroll calibra a instabilidade do sistema. A página exibe alfabeto, escala e anatomia como uma folha técnica em transformação.",
  concept:
    "espécime tipográfico · sistema · escala · tracking · anatomia · prova",
});