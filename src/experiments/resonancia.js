import p5 from "p5";
import { createAbout } from "../about.js";

// RESSONÂNCIA — Pixel sampling com ondas
// Conceito: a letra como campo de densidade. Pixels dentro da letra
// oscilam em fase. Pixels fora ficam quietos. Mouse muda a frequência.

let font;
let cols, rows;
const CELL = 8;
let insideMap = [];

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);

    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");

    cols = Math.ceil(p.width / CELL);
    rows = Math.ceil(p.height / CELL);

    // Renderiza o texto em um graphics offscreen para saber quais pixels estão "dentro"
    let g = p.createGraphics(p.width, p.height);
    g.background(0);
    g.fill(255);
    g.noStroke();

    let bounds = font.textBounds("it's all about collecting different things in your spirit, and then they release when they feel the time to.", 0, 0, 220);
    let tx = (p.width - bounds.w) / 2;
    let ty = (p.height + bounds.h) / 2;
    let pts = font.textToPoints("it's all about collecting different things in your spirit, and then they release when they feel the time to.", tx, ty, 420, { sampleFactor: 0.4 });

    // Preenche a letra amostrando numa grid fina — verifica pertencimento por raycast
    // Simplificação: usa os pontos como nuvem e verifica distância mínima ao contorno
    g.loadPixels();

    // Mapeia quais células da grid estão dentro da letra
    for (let row = 0; row < rows; row++) {
      insideMap[row] = [];
      for (let col = 0; col < cols; col++) {
        let cx = col * CELL + CELL / 2;
        let cy = row * CELL + CELL / 2;

        // Ponto dentro se há pelo menos 1 ponto do contorno perto O suficiente
        // E densidade local é alta (letra preenchida)
        let minD = Infinity;
        for (let pt of pts) {
          let d = Math.hypot(cx - pt.x, cy - pt.y);
          if (d < minD) minD = d;
        }
        insideMap[row][col] = minD < CELL * 2.5;
      }
    }
  };

  p.draw = () => {
    p.background(10);
    p.noStroke();

    let freq = p.map(p.mouseX, 0, p.width, 0.02, 0.12);
    let amp = p.map(p.mouseY, 0, p.height, 2, CELL * 0.45);
    let t = p.frameCount * 0.05;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!insideMap[row] || !insideMap[row][col]) continue;

        let cx = col * CELL + CELL / 2;
        let cy = row * CELL + CELL / 2;

        let wave = Math.sin(cx * freq + t) * Math.cos(cy * freq * 0.7 + t * 0.8);
        let size = p.map(wave, -1, 1, 1, CELL * 0.9) + amp * 0.3;
        let brightness = p.map(wave, -1, 1, 80, 255);

        p.fill(brightness);
        p.circle(cx, cy, size);
      }
    }
  };
});

createAbout({
  title: "RESSONÂNCIA",
  behavior: "A letra é amostrada numa grade. Dentro da letra, cada célula oscila com uma onda 2D. Mouse X controla a frequência, Mouse Y controla a amplitude. O padrão que surge é interferência — duas ondas cruzadas.",
  concept: "pixel sampling · onda 2D · interferência · frequência",
});
