import p5 from "p5";
import { createAbout } from "../about.js";

let font;
let particles = [];

const TEXT_LINES = [
  "it's all about collecting",
  "different things in your spirit,",
  "and then they release when",
  "they feel the time to.",
];

class Particle {
  constructor(p, x, y) {
    this.home = { x, y };
    this.x = x + p.random(-1, 1);
    this.y = y + p.random(-1, 1);
    this.vx = 0;
    this.vy = 0;
    this.mass = p.random(0.8, 1.2);
    this.phase = p.random(1000);
  }

  update(p) {
    const k = 0.048;

    let fx = (this.home.x - this.x) * k;
    let fy = (this.home.y - this.y) * k;

    const tremor = p.noise(this.phase, p.frameCount * 0.015) - 0.5;
    fx += tremor * 0.05;
    fy += tremor * 0.05;

    const dx = this.x - p.mouseX;
    const dy = this.y - p.mouseY;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < 135 && d > 0.001) {
      const repel = p.map(d, 0, 135, 5.8, 0);
      fx += (dx / d) * repel;
      fy += (dy / d) * repel;
    }

    this.vx = (this.vx + fx / this.mass) * 0.88;
    this.vy = (this.vy + fy / this.mass) * 0.88;

    this.x += this.vx;
    this.y += this.vy;
  }

  drawSpring(p) {
    const dx = this.x - this.home.x;
    const dy = this.y - this.home.y;
    const displacement = Math.sqrt(dx * dx + dy * dy);

    if (displacement < 8) return;

    const alpha = p.map(displacement, 8, 70, 0, 38, true);

    p.stroke(20, 20, 20, alpha);
    p.strokeWeight(0.28);
    p.line(this.home.x, this.home.y, this.x, this.y);
  }

  draw(p) {
    const dx = this.x - this.home.x;
    const dy = this.y - this.home.y;
    const displacement = Math.sqrt(dx * dx + dy * dy);

    const alpha = p.map(displacement, 0, 70, 165, 255, true);
    const size = p.map(displacement, 0, 70, 1.35, 3.1, true);

    p.noStroke();
    p.fill(15, 15, 15, alpha);
    p.circle(this.x, this.y, size);
  }
}

function createTypographicMass(p) {
  particles = [];

  const marginX = p.width * 0.08;
  const maxTextWidth = p.width - marginX * 2;

  const fontSize = Math.min(p.width * 0.055, 82);
  const lineHeight = fontSize * 1.18;

  const totalHeight = (TEXT_LINES.length - 1) * lineHeight;
  const startY = p.height / 2 - totalHeight / 2;

  p.textFont(font);
  p.textSize(fontSize);

  TEXT_LINES.forEach((line, lineIndex) => {
    let size = fontSize;

    p.textSize(size);
    while (p.textWidth(line) > maxTextWidth && size > 26) {
      size *= 0.96;
      p.textSize(size);
    }

    const bounds = font.textBounds(line, 0, 0, size);
    const x = p.width / 2 - bounds.w / 2;
    const y = startY + lineIndex * lineHeight;

    const pts = font.textToPoints(line, x, y, size, {
      sampleFactor: 0.22,
      simplifyThreshold: 0,
    });

    for (const pt of pts) {
      particles.push(new Particle(p, pt.x, pt.y));
    }
  });
}

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    createTypographicMass(p);
  };

  p.draw = () => {
    p.background(247, 245, 240);

    for (const particle of particles) {
      particle.update(p);
      particle.drawSpring(p);
    }

    for (const particle of particles) {
      particle.draw(p);
    }

    p.noStroke();
    p.fill(20, 20, 20, 115);
    p.textFont(font);
    p.textSize(12);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(
      "TENSÃO · Hooke field · elastic return · damped oscillation",
      24,
      p.height - 24
    );
  };

  p.mousePressed = () => {
    for (const particle of particles) {
      const dx = particle.x - p.mouseX;
      const dy = particle.y - p.mouseY;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < 260 && d > 0.001) {
        const burst = p.map(d, 0, 260, 13, 1.4);
        particle.vx += (dx / d) * burst;
        particle.vy += (dy / d) * burst;
      }
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    createTypographicMass(p);
  };
});

createAbout({
  title: "TENSÃO",
  behavior:
    "A frase é convertida em uma mancha tipográfica elástica. Cada ponto possui uma posição de repouso e é puxado de volta por uma mola invisível. O mouse cria repulsão; o clique aplica impulso.",
  concept:
    "lei de Hooke · mola · amortecimento · oscilação · mancha tipográfica",
  quote:
    "it's all about collecting different things in your spirit, and then they release when they feel the time to.",
});