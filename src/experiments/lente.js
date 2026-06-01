import p5 from "p5";
import { collectTextPoints } from "./utils.js";
import { createAbout } from "../about.js";

// LENTE — distorção óptica por projeção esférica
// A lente circular segue o cursor. Dentro dela, cada ponto é projetado
// sobre a superfície de uma esfera virtual: como olhar texto
// através de uma bola de vidro.
//
// Fórmula: dado um ponto (dx, dy) normalizado dentro da lente,
// o ângulo θ = dist/r × π/2 (de polo a equador da esfera).
// O raio projetado = r × sin(θ) — empurra pontos centrais pra fora.

const LINES = [
  "olhar é sempre",
  "uma hipótese",
];

const LENS_R = 180;
const LENS_STRENGTH = 1.4; // > 1 = mais distorção

let font;
let pts = [];

function sphereProject(px, py, cx, cy, r, strength) {
  let dx = px - cx, dy = py - cy;
  let dist = Math.sqrt(dx * dx + dy * dy);
  if (dist >= r || dist === 0) return { x: px, y: py, inside: false };

  let t = dist / r;               // 0 no centro, 1 na borda
  let theta = t * Math.PI * 0.5; // ângulo de polo até equador
  let projected = r * Math.sin(theta) * strength;
  let scale = projected / dist;

  return {
    x: cx + dx * scale,
    y: cy + dy * scale,
    inside: true,
    t,
  };
}

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    pts = collectTextPoints(p, font, LINES, 140, 0.2);
  };

  p.draw = () => {
    p.background(10, 22);
    p.noStroke();

    let cx = p.mouseX;
    let cy = p.mouseY;

    // Linha divisória da lente (círculo sutil)
    p.noFill();
    p.stroke(40);
    p.strokeWeight(0.5);
    p.circle(cx, cy, LENS_R * 2);

    p.noStroke();

    for (let pt of pts) {
      let result = sphereProject(pt.x, pt.y, cx, cy, LENS_R, LENS_STRENGTH);

      if (result.inside) {
        // Dentro da lente: cor e tamanho variam com distorção
        let distortion = Math.abs(result.x - pt.x) + Math.abs(result.y - pt.y);
        let r = p.map(distortion, 0, 80, 200, 255);
        let g = p.map(distortion, 0, 80, 200, 120);
        let b = p.map(distortion, 0, 80, 255, 80);
        let size = p.map(result.t, 0, 1, 5, 2);
        p.fill(r, g, b, 220);
        p.circle(result.x, result.y, size);
      } else {
        // Fora da lente: branco puro, tamanho padrão
        p.fill(255, 160);
        p.circle(pt.x, pt.y, 2.5);
      }
    }
  };
});

createAbout({
  title: "LENTE",
  behavior: "A lente circular segue o cursor. Dentro dela, cada ponto do texto é projetado sobre a superfície de uma esfera virtual — como ver letras através de uma bola de vidro. A cor revela a intensidade da distorção.",
  concept: "projeção esférica · distorção barrel · óptica · refração",
});
