import p5 from "p5";
import { createAbout } from "../about.js";

// TRAÇO — Escrita animada pelos contornos reais da fonte
// Conceito: os glifos são beziers. Percorrer o contorno = velocidade de escrita.
// Um "cursor" caminha pelo path de cada letra em velocidade variável.

let font;
let paths = [];       // contornos como sequências de pontos
let cursors = [];     // posição atual de cada cursor

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);

    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");

    let bounds = font.textBounds("TRAÇO", 0, 0, 220);
    let x = (p.width - bounds.w) / 2;
    let y = (p.height + bounds.h) / 2;

    // textToPoints com sampleFactor alto = contorno suave para percorrer
    let pts = font.textToPoints("it's all about collecting different things in your spirit, and then they release when they feel the time to.", x, y, 420, {
      sampleFactor: 0.6,
    });

    // Agrupa pontos por contorno (cada letra pode ter subpaths)
    let currentPath = [];
    for (let i = 0; i < pts.length; i++) {
      currentPath.push(pts[i]);
      // Quebra em novo subpath quando há salto grande (início de nova letra/buraco)
      if (i < pts.length - 1) {
        let dx = pts[i + 1].x - pts[i].x;
        let dy = pts[i + 1].y - pts[i].y;
        if (Math.sqrt(dx * dx + dy * dy) > 40) {
          paths.push(currentPath);
          currentPath = [];
        }
      }
    }
    if (currentPath.length > 0) paths.push(currentPath);

    // Um cursor por contorno, com velocidade e fase diferentes
    for (let i = 0; i < paths.length; i++) {
      cursors.push({
        index: p.random(0, paths[i].length),
        speed: p.random(0.8, 2.5),
        trail: [],
        trailLen: p.floor(p.random(30, 80)),
      });
    }
  };

  p.draw = () => {
    p.background(10, 30);
    p.noFill();

    for (let i = 0; i < paths.length; i++) {
      let path = paths[i];
      let cursor = cursors[i];

      cursor.index = (cursor.index + cursor.speed) % path.length;
      let pt = path[p.floor(cursor.index)];
      cursor.trail.push({ x: pt.x, y: pt.y });
      if (cursor.trail.length > cursor.trailLen) cursor.trail.shift();

      // Desenha trilha com fade
      for (let j = 1; j < cursor.trail.length; j++) {
        let alpha = p.map(j, 0, cursor.trail.length, 0, 220);
        let weight = p.map(j, 0, cursor.trail.length, 0.5, 2.5);
        p.stroke(255, 255, 255, alpha);
        p.strokeWeight(weight);
        p.line(cursor.trail[j - 1].x, cursor.trail[j - 1].y, cursor.trail[j].x, cursor.trail[j].y);
      }

      // Ponta luminosa do cursor
      p.fill(255);
      p.noStroke();
      p.circle(pt.x, pt.y, 4);
      p.noFill();
    }
  };

  // Click: reinicia velocidades
  p.mousePressed = () => {
    for (let cursor of cursors) {
      cursor.speed = Math.random() * 4 + 0.5;
    }
  };
});

createAbout({
  title: "TRAÇO",
  behavior: "Um cursor percorre o contorno de cada letra em velocidade variável, deixando uma trilha luminosa que some com o tempo. As letras não são imagens — são sequências de coordenadas bezier. Click embaralha as velocidades.",
  concept: "contorno bezier · velocidade de escrita · path · trilha",
});
