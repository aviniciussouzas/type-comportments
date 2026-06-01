import p5 from "p5";

// Home hero — "TYPO COMPORTMENTS" estilo LOUDER
// Halftone: título rasterizado em grade de pontos.
// Eco: 5 cópias sobrepostas com offset direcional controlado pelo mouse.
// O mesmo mecanismo do experimento ECO aplicado à identidade da série.

const CELL = 7;
const N_ECHO = 5;

let dots = [];
let fontReady = false;

async function buildHero(p) {
  const face = new FontFace("SpaceGroteskHome", "url(/fonts/SpaceGrotesk-Regular.ttf)");
  await face.load();
  document.fonts.add(face);
  fontReady = true;

  let g = p.createGraphics(p.width, p.height);
  g.pixelDensity(1);
  g.background(0);
  g.drawingContext.fillStyle = "#fff";

  // "TYPO" — grande
  g.drawingContext.font = `170px SpaceGroteskHome`;
  g.drawingContext.textAlign = "center";
  g.drawingContext.textBaseline = "middle";
  g.drawingContext.fillText("TYPO", p.width / 2, p.height * 0.42);

  // "COMPORTMENTS" — menor, logo abaixo
  g.drawingContext.font = `58px SpaceGroteskHome`;
  g.drawingContext.fillText("COMPORTMENTS", p.width / 2, p.height * 0.62);

  g.loadPixels();

  dots = [];
  for (let y = 0; y < g.height; y += CELL) {
    for (let x = 0; x < g.width; x += CELL) {
      let cx = Math.floor(x + CELL / 2);
      let cy = Math.floor(y + CELL / 2);
      let idx = (cy * g.width + cx) * 4;
      let bright = (g.pixels[idx] || 0) / 255;
      if (bright > 0.3) dots.push({ x: cx, y: cy, bright });
    }
  }
  g.remove();
}

new p5((p) => {
  p.setup = async () => {
    let canvas = p.createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent("hero");
    await buildHero(p);
  };

  p.draw = () => {
    if (!fontReady) { p.background(10); return; }
    p.background(10, 35);
    p.noStroke();

    let mx = p.mouseX - p.width / 2;
    let my = p.mouseY - p.height / 2;
    let dist = Math.sqrt(mx * mx + my * my);
    let maxOff = p.map(dist, 0, p.width * 0.5, 0, 50, true);
    let nx = dist > 0 ? mx / dist : 0;
    let ny = dist > 0 ? my / dist : 0;

    for (let i = N_ECHO; i >= 0; i--) {
      let t = i / N_ECHO;
      let ox = nx * maxOff * t;
      let oy = ny * maxOff * t * 0.55;
      let alpha = p.map(t, 0, 1, 230, 12);
      let dotMax = p.map(t, 0, 1, CELL * 0.9, CELL * 0.48);

      p.fill(255, alpha);
      for (let d of dots) {
        p.circle(d.x + ox, d.y + oy, d.bright * dotMax);
      }
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    buildHero(p);
  };
});
