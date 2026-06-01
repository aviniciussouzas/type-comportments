import p5 from "p5";
import { collectTextPoints } from "./utils.js";
import { createAbout } from "../about.js";

// NÉVOA — Perlin noise como máscara de presença
// O texto do Fisher fala de "não haver interior exceto como dobra do exterior"
// A névoa literaliza isso: a letra não está ou não está — depende do ponto
// de observação (noise offset). Mover o mouse desloca a névoa.
//
// Conceito: campos de ruído como filtros perceptivos.
// p.noise(x, y, t) → valor 0–1 suave e contínuo no espaço.

const LINES = [
  "There is no inside except as",
  "a folding of the outside;",
  "the mirror cracks,",
  "I am an other, and I always was.",
  "",
  "— Mark Fisher",
];

let font;
let pts = [];

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);

    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    pts = collectTextPoints(p, font, LINES, 38, 0.35);
  };

  p.draw = () => {
    p.background(8, 15);
    p.noStroke();

    // Mouse desloca o campo de ruído — névoa se move
    let offX = p.map(p.mouseX, 0, p.width, -1.5, 1.5);
    let offY = p.map(p.mouseY, 0, p.height, -1.5, 1.5);
    let t = p.frameCount * 0.006;
    let noiseScale = 0.006;

    for (let pt of pts) {
      // Ruído 3D: posição espacial + tempo → presença
      let n = p.noise(
        pt.x * noiseScale + offX,
        pt.y * noiseScale + offY,
        t
      );

      // Limiar suave: abaixo de 0.45 o ponto some, acima aparece
      let alpha = p.map(n, 0.42, 0.72, 0, 210, true);

      // Tamanho também respira com o ruído
      let size = p.map(n, 0.4, 0.9, 1, 4.5, true);

      // Temperatura de cor: névoa fria (azul) → presença quente (branco)
      let r = p.map(n, 0.4, 0.9, 140, 240);
      let g = p.map(n, 0.4, 0.9, 160, 235);
      let b = p.map(n, 0.4, 0.9, 220, 255);

      p.fill(r, g, b, alpha);
      p.circle(pt.x, pt.y, size);
    }
  };
});

createAbout({
  title: "NÉVOA",
  behavior: "Ruído Perlin 3D controla a opacidade de cada ponto do texto. A terceira dimensão do ruído é o tempo — a névoa respira. Mover o mouse desloca o campo espacialmente: a névoa se move com você.",
  concept: "Perlin noise · opacidade · presença · percepção seletiva",
  quote: "There is no inside except as a folding of the outside; the mirror cracks, I am an other, and I always was.<br>— Mark Fisher",
});
