import p5 from "p5";
import { createAbout } from "../about.js";

// EROSÃO — erosão raster / pixels em X
// O texto é convertido em uma grade.
// O ruído remove células da palavra e transforma partes dela em grãos.
// Click explode localmente. R reseta.

let font;
let cells = [];

const LINES = [
  "To see a World in a Grain of Sand",
  "And a Heaven in a Wild Flower,",
  "Hold Infinity in the palm of your hand",
  "And Eternity in an hour.",
  "— William Blake",
];

const PARAMS = {
  cell: 6,
  fontSizeMax: 42,
  lineHeight: 1.38,

  erosionSpeed: 0.004,
  noiseScale: 0.018,
  erosionThreshold: 0.66,

  windScale: 0.004,
  windStrength: 0.16,
  gravity: 0.012,
  friction: 0.992,

  baseAlpha: 215,
  erodedAlpha: 190,
};

class ErosionCell {
  constructor(p, x, y, brightness) {
    this.home = { x, y };
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.brightness = brightness;
    this.eroded = false;
    this.seed = p.random(1000);
    this.age = 0;
  }

  update(p) {
    const n = p.noise(
      this.home.x * PARAMS.noiseScale,
      this.home.y * PARAMS.noiseScale,
      p.frameCount * PARAMS.erosionSpeed + this.seed
    );

    if (!this.eroded && n > PARAMS.erosionThreshold) {
      this.eroded = true;
      this.age = 0;

      this.vx = p.random(-0.4, 0.4);
      this.vy = p.random(-0.2, 0.3);
    }

    if (this.eroded) {
      this.age++;

      const angle =
        p.noise(
          this.x * PARAMS.windScale,
          this.y * PARAMS.windScale,
          p.frameCount * 0.004 + this.seed
        ) *
        p.TWO_PI *
        2;

      const growth = p.map(this.age, 0, 520, 0.2, 1.4, true);

      this.vx += Math.cos(angle) * PARAMS.windStrength * growth;
      this.vy += Math.sin(angle) * PARAMS.windStrength * 0.55 * growth;
      this.vy += PARAMS.gravity;

      this.vx *= PARAMS.friction;
      this.vy *= PARAMS.friction;

      this.x += this.vx;
      this.y += this.vy;
    }
  }

  draw(p) {
    if (this.eroded) {
      const alpha = p.map(this.age, 0, 620, PARAMS.erodedAlpha, 0, true);

      p.stroke(15, 15, 15, alpha);
      p.strokeWeight(1);

      const s = PARAMS.cell * 0.65;

      // grão em X
      p.line(this.x - s / 2, this.y - s / 2, this.x + s / 2, this.y + s / 2);
      p.line(this.x + s / 2, this.y - s / 2, this.x - s / 2, this.y + s / 2);
    } else {
      p.noStroke();
      p.fill(15, 15, 15, PARAMS.baseAlpha * this.brightness);

      // pixel quadrado da palavra ainda íntegra
      p.rectMode(p.CENTER);
      p.rect(this.x, this.y, PARAMS.cell * 0.86, PARAMS.cell * 0.86);
    }
  }

  burst(p, mx, my) {
    const dx = this.x - mx;
    const dy = this.y - my;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < 260 && d > 0.001) {
      this.eroded = true;
      this.age = 0;

      const force = p.map(d, 0, 260, 9, 0, true);

      this.vx += (dx / d) * force;
      this.vy += (dy / d) * force;
    }
  }

  reset() {
    this.x = this.home.x;
    this.y = this.home.y;
    this.vx = 0;
    this.vy = 0;
    this.eroded = false;
    this.age = 0;
  }
}

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    buildRasterText(p);
  };

  p.draw = () => {
    p.background(247, 245, 240, 52);

    for (const cell of cells) {
      cell.update(p);
      cell.draw(p);
    }

    drawTechnicalLabel(p);
  };

  p.mousePressed = () => {
    for (const cell of cells) {
      cell.burst(p, p.mouseX, p.mouseY);
    }
  };

  p.keyPressed = () => {
    if (p.key === "r" || p.key === "R") {
      for (const cell of cells) {
        cell.reset();
      }
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    buildRasterText(p);
  };
});

function buildRasterText(p) {
  cells = [];

  const fontSize = Math.min(p.width * 0.032, PARAMS.fontSizeMax);
  const lineHeight = fontSize * PARAMS.lineHeight;

  const totalHeight = (LINES.length - 1) * lineHeight;
  const startY = p.height / 2 - totalHeight / 2;

  const g = p.createGraphics(p.width, p.height);
  g.pixelDensity(1);
  g.background(0);

  g.textFont(font);
  g.textAlign(p.CENTER, p.CENTER);
  g.textSize(fontSize);
  g.fill(255);
  g.noStroke();

  for (let i = 0; i < LINES.length; i++) {
    g.text(LINES[i], p.width / 2, startY + i * lineHeight);
  }

  g.loadPixels();

  for (let y = 0; y < g.height; y += PARAMS.cell) {
    for (let x = 0; x < g.width; x += PARAMS.cell) {
      const cx = Math.floor(x + PARAMS.cell / 2);
      const cy = Math.floor(y + PARAMS.cell / 2);

      const idx = (cy * g.width + cx) * 4;
      const brightness = (g.pixels[idx] || 0) / 255;

      if (brightness > 0.34) {
        cells.push(new ErosionCell(p, cx, cy, brightness));
      }
    }
  }

  g.remove();
}

function drawTechnicalLabel(p) {
  p.noStroke();
  p.fill(20, 20, 20, 95);
  p.textFont(font);
  p.textSize(12);
  p.textAlign(p.LEFT, p.BOTTOM);

  p.text(
    "EROSÃO · raster text · noise removes pixels · X-grain drift · click explode · R reset",
    24,
    p.height - 24
  );
}

createAbout({
  title: "EROSÃO",
  behavior:
    "O texto é rasterizado em células quadradas. Um campo de ruído remove partes da palavra ao longo do tempo; os pixels erodidos se desprendem como grãos em X e derivam com vento Perlin. O clique provoca uma explosão local; R recompõe a forma.",
  concept:
    "erosão raster · pixel · ruído · grão em X · perda material · impermanência",
  quote:
    "To see a World in a Grain of Sand / And a Heaven in a Wild Flower,<br>Hold Infinity in the palm of your hand / And Eternity in an hour.<br>— William Blake",
});