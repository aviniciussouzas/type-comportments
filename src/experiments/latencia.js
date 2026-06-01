import p5 from "p5";
import { createAbout } from "../about.js";

let font;
let points = [];

const TEXT = "LATÊNCIA";
const SIZE = 280;

new p5((p) => {
  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);

    font = await p.loadFont("/fonts/SpaceGrotesk-Regular.ttf");

    // textBounds e textToPoints usam o mesmo SIZE — centering correto
    let bounds = font.textBounds(TEXT, 0, 0, SIZE);
    let x = (p.width - bounds.w) / 2;
    let y = (p.height + bounds.h) / 2;

    points = font.textToPoints(TEXT, x, y, SIZE, {
      sampleFactor: 0.15,
    });
  };

  p.draw = () => {
    p.background(10, 18);
    p.fill(255);
    p.noStroke();

    for (let pt of points) {
      let d = p.dist(p.mouseX, p.mouseY, pt.x, pt.y);
      let angle = p.atan2(pt.y - p.mouseY, pt.x - p.mouseX);
      let force = p.map(d, 0, 200, 80, 0, true);
      let x = pt.x + p.cos(angle) * force;
      let y = pt.y + p.sin(angle) * force;
      let size = p.map(force, 0, 80, 2, 6);
      p.circle(x, y, size);
    }
  };
});

createAbout({
  title: "LATÊNCIA",
  behavior: "Cada ponto da letra é repelido pelo cursor. A força é inversamente proporcional à distância — quanto mais perto, maior o empurrão. Sem memória: quando o mouse se afasta, a forma retorna imediatamente.",
  concept: "distância · repulsão · campo de força",
});
