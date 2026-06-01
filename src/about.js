const CSS = `
  .about { position: fixed; bottom: 24px; left: 24px; z-index: 100; font-family: monospace; }
  .about-btn {
    background: none; border: 1px solid #1e1e1e; color: #2e2e2e;
    width: 26px; height: 26px; cursor: pointer; font-family: monospace;
    font-size: 11px; transition: all 0.2s; letter-spacing: 0;
  }
  .about-btn:hover { color: #fff; border-color: #555; }
  .about.open .about-btn { color: #fff; border-color: #444; }
  .about-panel {
    display: none; margin-top: 10px; max-width: 300px;
    border-left: 1px solid #1a1a1a; padding-left: 16px;
  }
  .about.open .about-panel { display: block; }
  .about-tag { font-size: 9px; color: #2a2a2a; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 8px; }
  .about-name { font-size: 15px; color: #fff; letter-spacing: 0.08em; margin-bottom: 12px; }
  .about-body { font-size: 10px; color: #555; line-height: 1.8; margin-bottom: 10px; }
  .about-concept { font-size: 9px; color: #2a2a2a; letter-spacing: 0.15em; }
  .about-quote {
    font-size: 10px; color: #333; font-style: italic; line-height: 1.7;
    border-left: 1px solid #1a1a1a; padding-left: 10px; margin-top: 12px;
  }
`;

let injected = false;

export function createAbout({ title, behavior, concept, quote } = {}) {
  if (!injected) {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    injected = true;
  }

  const wrap = document.createElement("div");
  wrap.className = "about";
  wrap.innerHTML = `
    <button class="about-btn" onclick="this.parentElement.classList.toggle('open')">i</button>
    <div class="about-panel">
      <p class="about-tag">comportamento</p>
      <p class="about-name">${title ?? ""}</p>
      <p class="about-body">${behavior ?? ""}</p>
      <p class="about-concept">${concept ?? ""}</p>
      ${quote ? `<p class="about-quote">${quote}</p>` : ""}
    </div>
  `;
  document.body.appendChild(wrap);
}
