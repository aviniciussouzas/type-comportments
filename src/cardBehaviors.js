// cardBehaviors.js — micro-sketches em canvas 2D puro (sem p5.js)
// Um por card, rodando simultaneamente sem impacto nos sketches principais.

// ── helpers ──────────────────────────────────────────────────
function rand(a, b) { return a + Math.random() * (b - a); }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

// ── behaviors ────────────────────────────────────────────────

function behaviorLatencia(ctx, W, H, canvas, card) {
  let mx = -999, my = -999;
  card.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });
  card.addEventListener("mouseleave", () => { mx = -999; my = -999; });

  const pts = Array.from({ length: 6 }, () => ({
    x: rand(W * 0.15, W * 0.85),
    y: rand(H * 0.15, H * 0.85),
    vx: 0, vy: 0,
  }));

  function tick() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (const p of pts) {
      const dx = p.x - mx, dy = p.y - my;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 55 && d > 0) { p.vx += (dx / d) * 1.8; p.vy += (dy / d) * 1.8; }
      p.vx *= 0.88; p.vy *= 0.88;
      p.x = clamp(p.x + p.vx, 3, W - 3);
      p.y = clamp(p.y + p.vy, 3, H - 3);
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function behaviorTensao(ctx, W, H) {
  const pts = [
    { x: W * 0.25, y: H * 0.5, vx: 0.4, vy: 0.6, hx: W * 0.25, hy: H * 0.5 },
    { x: W * 0.5,  y: H * 0.3, vx: -0.5, vy: 0.4, hx: W * 0.5,  hy: H * 0.3 },
    { x: W * 0.75, y: H * 0.6, vx: 0.3, vy: -0.5, hx: W * 0.75, hy: H * 0.6 },
  ];

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.vx += (p.hx - p.x) * 0.025; p.vy += (p.hy - p.y) * 0.025;
      p.vx *= 0.94; p.vy *= 0.94;
      p.x += p.vx; p.y += p.vy;
    }
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
      }
    }
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill(); }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function behaviorRuido(ctx, W, H) {
  const cols = 8, rows = 5;
  function tick(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    const time = t * 0.0009;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const bx = (c + 0.5) * W / cols, by = (r + 0.5) * H / rows;
        const a = Math.sin(c * 0.6 + time) * Math.cos(r * 0.5 + time * 0.8) * Math.PI;
        const x = bx + Math.cos(a) * 4, y = by + Math.sin(a) * 4;
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function behaviorTraco(ctx, W, H) {
  function tick(t) {
    ctx.clearRect(0, 0, W, H);
    const time = t * 0.0007;
    const x1  = W * (0.1  + 0.12 * Math.sin(time * 0.7));
    const y1  = H * (0.35 + 0.18 * Math.cos(time * 0.5));
    const cx1 = W * (0.3  + 0.2  * Math.cos(time * 1.1));
    const cy1 = H * (0.1  + 0.15 * Math.sin(time * 0.9));
    const cx2 = W * (0.7  - 0.2  * Math.sin(time * 0.8));
    const cy2 = H * (0.9  - 0.15 * Math.cos(time * 1.2));
    const x2  = W * (0.9  - 0.12 * Math.cos(time * 0.6));
    const y2  = H * (0.65 - 0.18 * Math.sin(time * 0.4));

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // ponta luminosa
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath(); ctx.arc(x2, y2, 1.5, 0, Math.PI * 2); ctx.fill();

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function behaviorEco(ctx, W, H) {
  let lastPulse = 0;
  const rings = [];

  function tick(t) {
    ctx.clearRect(0, 0, W, H);
    if (t - lastPulse > 1800) { rings.push({ born: t }); lastPulse = t; }

    const maxR = Math.hypot(W, H) * 0.55;
    for (let i = rings.length - 1; i >= 0; i--) {
      const age = (t - rings[i].born) / 1800;
      if (age > 1) { rings.splice(i, 1); continue; }
      const r = age * maxR;
      const alpha = 0.5 * (1 - age);
      ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 0.5; ctx.stroke();
    }
    requestAnimationFrame(tick);
  }
  rings.push({ born: 0 });
  requestAnimationFrame(tick);
}

function behaviorNevoa(ctx, W, H) {
  const step = 14;
  function tick(t) {
    ctx.clearRect(0, 0, W, H);
    const time = t * 0.0009;
    for (let y = step / 2; y < H; y += step) {
      for (let x = step / 2; x < W; x += step) {
        const n = (Math.sin(x * 0.04 + time) * Math.cos(y * 0.035 + time * 0.7) + 1) / 2;
        const v = n * n;
        if (v > 0.28) {
          ctx.fillStyle = `rgba(255,255,255,${v * 0.75})`;
          ctx.beginPath(); ctx.arc(x, y, 0.8, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function behaviorConstelacao(ctx, W, H) {
  const pts = Array.from({ length: 8 }, () => ({
    x: rand(8, W - 8), y: rand(8, H - 8),
    vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
  }));
  const R = Math.min(W, H) * 0.44;

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 4 || p.x > W - 4) p.vx *= -1;
      if (p.y < 4 || p.y > H - 4) p.vy *= -1;
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < R) {
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d / R) * 0.38})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill(); }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function behaviorErosao(ctx, W, H) {
  const particles = Array.from({ length: 10 }, () => ({
    x: rand(0, W), y: rand(0, H),
    vx: rand(0.25, 0.7), size: rand(0.6, 1.8), alpha: rand(0.5, 0.9),
  }));

  function tick() {
    ctx.clearRect(0, 0, W, H);
    if (Math.random() < 0.04) {
      particles.push({ x: -3, y: rand(0, H), vx: rand(0.25, 0.7), size: rand(0.6, 1.8), alpha: rand(0.5, 0.9) });
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      if (p.x > W + 5) { particles.splice(i, 1); continue; }
      const progress = p.x / W;
      const a = p.alpha * (1 - progress);
      const s = p.size * (1 - progress * 0.75);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function behaviorLente(ctx, W, H) {
  const numRings = 4;
  function tick(t) {
    ctx.clearRect(0, 0, W, H);
    const time = t * 0.00025;
    const maxR = Math.max(W, H) * 0.52;
    for (let i = 0; i < numRings; i++) {
      const phase = (time + i / numRings) % 1;
      const r = phase * maxR;
      const alpha = (1 - phase) * 0.32;
      ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 0.5; ctx.stroke();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function behaviorHalftone(ctx, W, H) {
  const step = 13;
  function tick(t) {
    ctx.clearRect(0, 0, W, H);
    const time = t * 0.002;
    for (let y = step / 2; y < H; y += step) {
      for (let x = step / 2; x < W; x += step) {
        const wave = Math.sin(Math.sqrt((x - W / 2) ** 2 + (y - H / 2) ** 2) * 0.14 - time);
        const v = wave * 0.5 + 0.5;
        const r = step * 0.44 * (0.28 + 0.72 * v);
        ctx.fillStyle = `rgba(255,255,255,${0.18 + 0.32 * v})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── map ───────────────────────────────────────────────────────

const MAP = {
  "01": behaviorLatencia,
  "02": behaviorTensao,
  "03": behaviorRuido,
  "04": behaviorTraco,
  "05": behaviorEco,
  "06": behaviorNevoa,
  "07": behaviorConstelacao,
  "08": behaviorErosao,
  "09": behaviorLente,
  "10": behaviorHalftone,
};

// ── init ─────────────────────────────────────────────────────

export function initCardBehaviors() {
  document.querySelectorAll(".card").forEach((card) => {
    const num = card.getAttribute("data-num");
    const fn = MAP[num];
    if (!fn) return;

    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
      position: "absolute",
      top: "0", left: "0",
      width: "100%", height: "100%",
      zIndex: "0",
      pointerEvents: "none",
      opacity: "0.2",
    });

    // z-index 0 funciona somente se o card tiver position != static
    if (getComputedStyle(card).position === "static") card.style.position = "relative";

    card.insertBefore(canvas, card.firstChild);

    // Dimensões em pixels (layout já calculado neste ponto)
    canvas.width  = card.offsetWidth  || 280;
    canvas.height = card.offsetHeight || 200;

    const ctx = canvas.getContext("2d");
    if (!ctx || canvas.width === 0) return;

    fn(ctx, canvas.width, canvas.height, canvas, card);
  });
}
