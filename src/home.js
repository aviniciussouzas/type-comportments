// home.js — 50% Sistema / 50% Organismo
// 1. Título TIPO SENSÍVEL com física por letra (repulsão + mola elástica)
// 2. Micro-sketches canvas nos cards via cardBehaviors.js
// 3. Reveal de preview no hover dos cards

import { initCardBehaviors } from "./cardBehaviors.js";

// ── TÍTULO VIVO ───────────────────────────────────────────────

function initTitlePhysics() {
  const container = document.getElementById("catalog-title");
  if (!container) return;

  const text = "TIPO SENSÍVEL";

  // Injeta um span por letra, agrupando palavras para evitar quebra mid-word
  container.innerHTML = text
    .split(" ")
    .map((word) => {
      const letters = word
        .split("")
        .map((ch) => `<span class="letter" aria-hidden="true">${ch}</span>`)
        .join("");
      return `<span class="word" style="display:inline-block;white-space:nowrap">${letters}</span>`;
    })
    .join('<span class="letter word-space" aria-hidden="true" style="display:inline-block;width:0.28em">&nbsp;</span>');

  const letters = Array.from(container.querySelectorAll(".letter"));

  // Estado físico por letra: deslocamento (ox, oy) e velocidade (vx, vy)
  const state = letters.map(() => ({ ox: 0, oy: 0, vx: 0, vy: 0 }));

  const REPULSION_RADIUS = 100;
  const REPULSION_FORCE  = 0.5;
  const SPRING_K         = 0.072;
  const DAMPING          = 0.80;
  const MAX_DISP         = 11;

  let mx = -9999, my = -9999;

  document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
  document.addEventListener("mouseleave", () => { mx = -9999; my = -9999; });

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function tick() {
    for (let i = 0; i < letters.length; i++) {
      const el = letters[i];
      const s  = state[i];

      // Centro canônico da letra no viewport (sem o deslocamento atual)
      const r  = el.getBoundingClientRect();
      const cx = r.left + r.width  / 2 - s.ox;
      const cy = r.top  + r.height / 2 - s.oy;

      // Vetor do mouse → letra canônica
      const dx   = cx - mx;
      const dy   = cy - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Repulsão — só quando o mouse está perto
      if (dist < REPULSION_RADIUS && dist > 0.5) {
        const strength = (1 - dist / REPULSION_RADIUS) * REPULSION_FORCE;
        s.vx += (dx / dist) * strength * 3;
        s.vy += (dy / dist) * strength * 3;
      }

      // Mola: puxa de volta à posição canônica
      s.vx -= s.ox * SPRING_K;
      s.vy -= s.oy * SPRING_K;

      // Amortecimento
      s.vx *= DAMPING;
      s.vy *= DAMPING;

      // Integração
      s.ox = clamp(s.ox + s.vx, -MAX_DISP, MAX_DISP);
      s.oy = clamp(s.oy + s.vy, -MAX_DISP, MAX_DISP);

      // Remove a transition CSS durante movimento; restaura quando em repouso
      const speed = Math.abs(s.vx) + Math.abs(s.vy);
      el.style.transition = speed > 0.09
        ? "none"
        : "transform 1.4s cubic-bezier(0.19,1,0.22,1)";
      el.style.transform = `translate(${s.ox.toFixed(2)}px,${s.oy.toFixed(2)}px)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── CARD HOVER — revela preview com fade ─────────────────────

function initCardHover() {
  document.querySelectorAll(".experiment-card").forEach((card) => {
    const preview = card.querySelector(".experiment-preview");
    if (!preview) return;
    preview.style.transition = "opacity 700ms cubic-bezier(0.19,1,0.22,1)";
    preview.style.opacity = "0.5";
    card.addEventListener("mouseenter", () => { preview.style.opacity = "1"; });
    card.addEventListener("mouseleave", () => { preview.style.opacity = "0.5"; });
  });
}

// ── INIT ─────────────────────────────────────────────────────

function init() {
  initTitlePhysics();
  initCardBehaviors();
  initCardHover();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
