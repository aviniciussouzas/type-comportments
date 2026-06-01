import p5 from "p5";
import { createAbout } from "../about.js";

// ECO — halftone + eco direcional
// Texto rasterizado em grade de pontos.
// 5 cópias sobrepostas com offset controlado pelo mouse.
// Ensina: rasterização (contínuo → grade discreta) e eco direcional.

const WORD = "ECO";
const SIZE = 220;
const CELL = 9; // tamanho de cada célula da grade

let dots = [];   // {x, y, bright} — células ativas (dentro das letras)

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);

    // Carrega fonte no contexto do browser para poder usar drawingContext
    const face = new FontFace("SpaceGroteskExp", "url(/fonts/SpaceGrotesk-Regular.ttf)");
    await face.load();
    document.fonts.add(face);

    // Renderiza texto preenchido num buffer offscreen
    let g = p.createGraphics(p.width, p.height);
    g.pixelDensity(1);
    g.background(0);
    g.drawingContext.fillStyle = "#fff";
    g.drawingContext.font = `${SIZE}px SpaceGroteskExp`;
    g.drawingContext.textAlign = "center";
    g.drawingContext.textBaseline = "middle";
    g.drawingContext.fillText(WORD, p.width / 2, p.height / 2);
    g.loadPixels();

    // Amostra a grade — guarda células com brilho suficiente
    for (let y = 0; y < g.height; y += CELL) {
      for (let x = 0; x < g.width; x += CELL) {
        let cx = Math.floor(x + CELL / 2);
        let cy = Math.floor(y + CELL / 2);
        let idx = (cy * g.width + cx) * 4;
        let bright = (g.pixels[idx] || 0) / 255;
        if (bright > 0.35) dots.push({ x: cx, y: cy, bright });
      }
    }
    g.remove();
  };

  p.draw = () => {
    p.background(10, 30);
    p.noStroke();

    const N = 5;

    // Offset máximo cresce com distância do mouse ao centro
    let mx = p.mouseX - p.width / 2;
    let my = p.mouseY - p.height / 2;
    let dist = Math.sqrt(mx * mx + my * my);
    let maxOff = p.map(dist, 0, p.width * 0.5, 0, 55, true);

    for (let i = N; i >= 0; i--) {
      let t = i / N;

      // Eco: cópias mais distantes têm mais offset e menos alpha
      let ox = (mx / (dist || 1)) * maxOff * t;
      let oy = (my / (dist || 1)) * maxOff * t * 0.5;

      let alpha = p.map(t, 0, 1, 230, 18);
      let dotMax = p.map(t, 0, 1, CELL * 0.86, CELL * 0.52);

      p.fill(255, alpha);
      for (let d of dots) {
        p.circle(d.x + ox, d.y + oy, d.bright * dotMax);
      }
    }
  };
});

createAbout({
  title: "ECO",
  behavior: "O texto é rasterizado — convertido de forma contínua para uma grade discreta de pontos. 5 cópias sobrepostas com offset crescente criam o eco. Mouse controla a direção e a intensidade do deslocamento.",
  concept: "rasterização · eco direcional · grid · halftone",
});
