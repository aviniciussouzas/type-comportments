import p5 from "p5";
import { collectTextPoints } from "./utils.js";
import { createAbout } from "../about.js";

// CONSTELAÇÃO — grafo vivo de proximidade
// "Existe quase um anseio sensual pela comunhão com outros..."
// Pontos se conectam quando próximos — cada letra uma estrela, cada
// conexão uma relação. O mouse expande o raio de comunhão.
//
// Conceito: algoritmo de proximidade O(n²), força de conexão
// inversamente proporcional à distância.

const LINES = [
  "Existe quase um anseio sensual",
  "pela comunhão com outros que",
  "compartilham uma visão ampla.",
  "",
  "— Pierre Teilhard de Chardin",
];

let font;
let pts = [];

// Grade espacial para acelerar busca de vizinhos (evitar O(n²) puro)
let grid = {};
const CELL = 30;

function gridKey(x, y) {
  return `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;
}

function buildGrid(points) {
  grid = {};
  for (let i = 0; i < points.length; i++) {
    const k = gridKey(points[i].x, points[i].y);
    if (!grid[k]) grid[k] = [];
    grid[k].push(i);
  }
}

function neighbors(px, py, radius) {
  const result = [];
  const cr = Math.ceil(radius / CELL);
  const cx = Math.floor(px / CELL);
  const cy = Math.floor(py / CELL);
  for (let dx = -cr; dx <= cr; dx++) {
    for (let dy = -cr; dy <= cr; dy++) {
      const k = `${cx + dx},${cy + dy}`;
      if (grid[k]) result.push(...grid[k]);
    }
  }
  return result;
}

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);

    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");
    pts = collectTextPoints(p, font, LINES, 40, 0.22);
    buildGrid(pts);
  };

  p.draw = () => {
    p.background(6, 10, 18, 28); // rastro leve para efeito de brilho

    // Raio de conexão: base + influência do mouse (comunhão expande com presença)
    let baseRadius = 18;
    let mouseInfluence = p.map(
      p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2),
      0, p.width / 2,
      14, 0
    );
    let radius = baseRadius + mouseInfluence;

    // Conexões
    p.noFill();
    for (let i = 0; i < pts.length; i++) {
      const nbs = neighbors(pts[i].x, pts[i].y, radius);
      for (const j of nbs) {
        if (j <= i) continue;
        const d = p.dist(pts[i].x, pts[i].y, pts[j].x, pts[j].y);
        if (d > radius) continue;

        const alpha = p.map(d, 0, radius, 90, 0);
        p.stroke(180, 200, 255, alpha);
        p.strokeWeight(0.5);
        p.line(pts[i].x, pts[i].y, pts[j].x, pts[j].y);
      }
    }

    // Pontos
    p.noStroke();
    for (let pt of pts) {
      // Ponto pisca suavemente com ruído temporal individual
      let flicker = p.noise(pt.x * 0.01, pt.y * 0.01, p.frameCount * 0.02);
      let size = p.map(flicker, 0, 1, 1, 3.5);
      let alpha = p.map(flicker, 0, 1, 100, 240);
      p.fill(200, 220, 255, alpha);
      p.circle(pt.x, pt.y, size);
    }
  };
});

createAbout({
  title: "CONSTELAÇÃO",
  behavior: "Pontos próximos se conectam por linhas. A força de conexão diminui com a distância — desaparece no limite do raio. Aproximar o mouse do centro expande a zona de comunhão. Grade espacial evita O(n²).",
  concept: "grafo · proximidade · raio de vizinhança · spatial grid",
  quote: "Existe quase um anseio sensual pela comunhão com outros que compartilham uma visão ampla.<br>— Pierre Teilhard de Chardin",
});
