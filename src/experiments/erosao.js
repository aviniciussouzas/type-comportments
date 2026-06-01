import p5 from "p5";
import { collectTextPoints } from "./utils.js";
import { createAbout } from "../about.js";

// EROSÃO — vento Perlin desgasta as letras ao longo do tempo
// "To see a World in a Grain of Sand" — Blake fala do grão que carrega o infinito.
// Aqui o texto É grão: cada ponto é uma partícula que o vento leva.
// Click: reset — a forma volta. A erosão recomeça.
//
// Conceito: ângulo do vento = p.noise(x, y, t) * TWO_PI
// A velocidade de erosão é inversamente proporcional à "massa" local
// (pontos no centro das letras resistem mais que os das bordas).

const LINES = [
  "To see a World in a Grain of Sand",
  "And a Heaven in a Wild Flower,",
  "Hold Infinity in the palm of your hand",
  "And Eternity in an hour.",
  "",
  "— William Blake",
];

let font;
let particles = [];

class ErosaoParticle {
  constructor(p, x, y, delay) {
    this.home = { x, y };
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    // Delay escalonado: bordas do texto erodem primeiro
    this.delay = delay;
    this.age = -delay; // conta negativa = inativa
    this.eroding = false;
  }

  update(p) {
    this.age++;

    if (this.age < 0) {
      // Ainda no lar, aguardando
      return;
    }

    if (!this.eroding) this.eroding = true;

    let noiseScale = 0.0025;
    let t = p.frameCount * 0.004;

    // Vento: Perlin noise → ângulo → força direcional
    let angle = p.noise(this.x * noiseScale, this.y * noiseScale, t) * p.TWO_PI * 2;
    let windStrength = p.map(this.age, 0, 300, 0.05, 1.2);
    this.vx += Math.cos(angle) * windStrength * 0.15;
    this.vy += Math.sin(angle) * windStrength * 0.08 + 0.02; // leve gravidade

    // Amortecimento mínimo (o vento acumula)
    this.vx *= 0.995;
    this.vy *= 0.995;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(p) {
    if (this.age < -10) return;

    let t = Math.max(0, this.age);
    let alpha = p.map(t, 0, 400, 220, 0, true);
    // Tom quente de areia
    let warmth = p.map(t, 0, 400, 0, 60);
    p.fill(220 + warmth * 0.3, 200 - warmth * 0.5, 170 - warmth, alpha);
    p.circle(this.x, this.y, p.map(alpha, 0, 220, 1, 2.5));
  }

  reset(p) {
    this.x = this.home.x;
    this.y = this.home.y;
    this.vx = 0;
    this.vy = 0;
    this.age = -this.delay;
    this.eroding = false;
  }
}

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);

    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    const pts = collectTextPoints(p, font, LINES, 36, 0.28);

    // Calcula centróide do texto para usar como referência de "borda"
    let cx = pts.reduce((s, pt) => s + pt.x, 0) / pts.length;
    let cy = pts.reduce((s, pt) => s + pt.y, 0) / pts.length;

    for (let pt of pts) {
      // Pontos mais distantes do centro erodem primeiro
      let d = Math.hypot(pt.x - cx, pt.y - cy);
      let delay = Math.floor(p.map(d, 0, 300, 80, 0, true));
      particles.push(new ErosaoParticle(p, pt.x, pt.y, delay));
    }
  };

  p.draw = () => {
    p.background(10, 8, 6, 22); // rastro muito lento — areia se acumula
    p.noStroke();

    for (let particle of particles) {
      particle.update(p);
      particle.draw(p);
    }
  };

  // Click: tudo volta — a erosão recomeça do zero
  p.mousePressed = () => {
    for (let particle of particles) {
      particle.reset(p);
    }
  };
});

createAbout({
  title: "EROSÃO",
  behavior: "Vento Perlin empurra as partículas gradualmente. As bordas erodem primeiro — pontos distantes do centróide têm delay zero. A velocidade de erosão aumenta com o tempo. Click reseta tudo.",
  concept: "vento · Perlin noise · delay por distância · impermanência",
  quote: "To see a World in a Grain of Sand / And a Heaven in a Wild Flower,<br>Hold Infinity in the palm of your hand / And Eternity in an hour.<br>— William Blake",
});
