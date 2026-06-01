import p5 from "p5";
import { createAbout } from "../about.js";

// RUÍDO — Campo de fluxo Perlin
// Conceito: turbulência, campos vetoriais, como o ruído Perlin simula natureza
// Partículas nascem dentro das letras e seguem o campo de ruído
// Com o tempo saem da forma, revelando que a ordem é temporária

let font;
let particles = [];
let homePoints = [];

class FlowParticle {
  constructor(p, x, y) {
    this.home = { x, y };
    this.x = x + p.random(-1, 1);
    this.y = y + p.random(-1, 1);
    this.age = p.random(0, 200);
    this.maxAge = p.random(120, 300);
  }

  update(p) {
    this.age++;

    // Campo de fluxo Perlin: ângulo varia suavemente no espaço
    let noiseScale = 0.003;
    let angle = p.noise(this.x * noiseScale, this.y * noiseScale, p.frameCount * 0.004) * p.TWO_PI * 2;
    let speed = 0.8;
    this.x += Math.cos(angle) * speed;
    this.y += Math.sin(angle) * speed;

    // Reinicia ao lar quando envelhece
    if (this.age > this.maxAge) {
      this.x = this.home.x + p.random(-2, 2);
      this.y = this.home.y + p.random(-2, 2);
      this.age = 0;
    }
  }

  draw(p) {
    let life = p.map(this.age, 0, this.maxAge, 1, 0);
    p.fill(200, 220, 255, life * 180);
    p.circle(this.x, this.y, 2);
  }
}

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);

    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");

    let bounds = font.textBounds("RUÍDO", 0, 0, 220);
    let x = (p.width - bounds.w) / 2;
    let y = (p.height + bounds.h) / 2;

    homePoints = font.textToPoints("it's all about collecting different things in your spirit, and then they release when they feel the time to.", x, y, 420, {
      sampleFactor: 0.2,
    });

    // Multiplica partículas por ponto para densidade visual
    for (let pt of homePoints) {
      for (let i = 0; i < 3; i++) {
        particles.push(new FlowParticle(p, pt.x, pt.y));
      }
    }
  };

  p.draw = () => {
    p.background(10, 12);
    p.noStroke();
    for (let particle of particles) {
      particle.update(p);
      particle.draw(p);
    }
  };
});

createAbout({
  title: "RUÍDO",
  behavior: "Partículas nascem dentro das letras e derivam num campo de ruído Perlin. O ruído é suave e contínuo no espaço — dois pontos próximos têm ângulos de vento próximos. Quando envelhecem, retornam ao lar.",
  concept: "Perlin noise · campo vetorial · turbulência · vida útil",
});
