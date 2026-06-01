import p5 from "p5";

let font;
let particles = [];

class Particle {
  constructor(p, x, y) {
    this.home = { x, y };
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }

  update(p) {
    // Lei de Hooke: F = -k * deslocamento (mola puxando de volta ao lar)
    const k = 0.06;
    let fx = (this.home.x - this.x) * k;
    let fy = (this.home.y - this.y) * k;

    // Repulsão do mouse
    let dx = this.x - p.mouseX;
    let dy = this.y - p.mouseY;
    let d = Math.sqrt(dx * dx + dy * dy);
    if (d < 130 && d > 0) {
      let repel = p.map(d, 0, 130, 9, 0);
      fx += (dx / d) * repel;
      fy += (dy / d) * repel;
    }

    // Amortecimento (fricção) — sem isso oscila pra sempre
    this.vx = (this.vx + fx) * 0.87;
    this.vy = (this.vy + fy) * 0.87;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(p) {
    let dx = this.x - this.home.x;
    let dy = this.y - this.home.y;
    let displacement = Math.sqrt(dx * dx + dy * dy);

    // Cor como tensômetro: frio (em casa) → quente (sob tensão)
    let r = p.map(displacement, 0, 80, 80, 255);
    let g = p.map(displacement, 0, 80, 180, 60);
    let b = p.map(displacement, 0, 80, 255, 80);

    let size = p.map(displacement, 0, 80, 2, 5);

    p.fill(r, g, b);
    p.circle(this.x, this.y, size);
  }
}

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);

    font = await p.loadFont("fonts/SpaceGrotesk-Regular.ttf");

    let bounds = font.textBounds("Chegara o tempo", 0, 0, 220);
    let x = (p.width - bounds.w) / 2;
    let y = (p.height + bounds.h) / 2;

    let pts = font.textToPoints("it's all about collecting different things in your spirit, and then they release when they feel the time to.", x, y, 220, {
      sampleFactor: 0.3,
    });

    for (let pt of pts) {
      particles.push(new Particle(p, pt.x, pt.y));
    }
  };

  p.draw = () => {
    p.background(10, 18);
    p.noStroke();

    for (let particle of particles) {
      particle.update(p);
      particle.draw(p);
    }
  };

  // Click: impulso explosivo — tensão máxima, depois volta oscilando
  p.mousePressed = () => {
    for (let particle of particles) {
      let dx = particle.x - p.mouseX;
      let dy = particle.y - p.mouseY;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d < 250 && d > 0) {
        let burst = p.map(d, 0, 250, 18, 2);
        particle.vx += (dx / d) * burst;
        particle.vy += (dy / d) * burst;
      }
    }
  };
});
