import p5 from "p5";
import { createAbout } from "../about.js";

let font;
let particles = [];

const TEXT = "LATÊNCIA";

const PARAMS = {
  repulsionForce: 92,
  friction: 0.82,
  threshold: 210,
  returnForce: 0.045,
};

class LatencyPoint {
  constructor(p, x, y) {
    this.home = { x, y };
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.size = p.random(1.7, 2.8);
  }

  update(p) {
    let fx = 0;
    let fy = 0;

    const dx = this.x - p.mouseX;
    const dy = this.y - p.mouseY;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d < PARAMS.threshold && d > 0.001) {
      const force = p.map(
        d,
        0,
        PARAMS.threshold,
        PARAMS.repulsionForce,
        0,
        true
      );

      fx += (dx / d) * force;
      fy += (dy / d) * force;
    }

    fx += (this.home.x - this.x) * PARAMS.returnForce;
    fy += (this.home.y - this.y) * PARAMS.returnForce;

    this.vx = (this.vx + fx) * PARAMS.friction;
    this.vy = (this.vy + fy) * PARAMS.friction;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(p) {
    const dx = this.x - this.home.x;
    const dy = this.y - this.home.y;
    const displacement = Math.sqrt(dx * dx + dy * dy);

    const alpha = p.map(displacement, 0, 100, 220, 95, true);
    const size = p.map(displacement, 0, 100, this.size, this.size * 2.4, true);

    p.noStroke();
    p.fill(18, 18, 18, alpha);
    p.circle(this.x, this.y, size);
  }
}

function createLatencyText(p) {
  particles = [];

  const margin = p.width * 0.06;
  const maxWidth = p.width - margin * 2;

  let size = Math.min(p.width * 0.16, 260);

  p.textFont(font);
  p.textSize(size);

  while (p.textWidth(TEXT) > maxWidth && size > 80) {
    size *= 0.96;
    p.textSize(size);
  }

  const bounds = font.textBounds(TEXT, 0, 0, size);
  const x = p.width / 2 - bounds.w / 2;
  const y = p.height / 2 + bounds.h / 2;

  const pts = font.textToPoints(TEXT, x, y, size, {
    sampleFactor: 0.42,
    simplifyThreshold: 0,
  });

  for (const pt of pts) {
    particles.push(new LatencyPoint(p, pt.x, pt.y));
  }
}

function drawParameterPanel(p) {
  const x = 24;
  const y = 24;
  const w = 310;
  const h = 138;

  p.noFill();
  p.stroke(20, 20, 20, 90);
  p.strokeWeight(1);
  p.rect(x, y, w, h);

  p.noStroke();
  p.fill(20, 20, 20, 180);
  p.textFont(font);
  p.textAlign(p.LEFT, p.TOP);

  p.textSize(11);
  p.text("LATÊNCIA / PARÂMETROS", x + 16, y + 16);

  p.textSize(12);
  p.fill(20, 20, 20, 135);

  p.text(`força de repulsão  ${PARAMS.repulsionForce}`, x + 16, y + 46);
  p.text(`atrito              ${PARAMS.friction}`, x + 16, y + 68);
  p.text(`limiar              ${PARAMS.threshold}px`, x + 16, y + 90);
  p.text(`retorno             ${PARAMS.returnForce}`, x + 16, y + 112);
}

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    createLatencyText(p);
  };

  p.draw = () => {
    p.background(247, 245, 240);

    for (const particle of particles) {
      particle.update(p);
      particle.draw(p);
    }

    drawParameterPanel(p);

    p.noStroke();
    p.fill(20, 20, 20, 115);
    p.textFont(font);
    p.textSize(12);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(
      "LATÊNCIA · repulsion field · friction · delayed return",
      24,
      p.height - 24
    );
  };

  p.mousePressed = () => {
    for (const particle of particles) {
      const dx = particle.x - p.mouseX;
      const dy = particle.y - p.mouseY;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < PARAMS.threshold * 1.4 && d > 0.001) {
        const burst = p.map(d, 0, PARAMS.threshold * 1.4, 14, 0, true);
        particle.vx += (dx / d) * burst;
        particle.vy += (dy / d) * burst;
      }
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    createLatencyText(p);
  };
});

createAbout({
  title: "LATÊNCIA",
  behavior:
    "Cada ponto da palavra responde ao cursor com atraso físico. A repulsão afasta a forma, o atrito desacelera o movimento e o limiar define a zona de influência. A palavra não retorna imediatamente: ela demora, oscila e recompõe sua presença.",
  concept:
    "força de repulsão · atrito · limiar · retorno elástico · atraso perceptivo",
});