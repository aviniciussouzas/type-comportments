// about.js — painel de ficha de laboratório
// Abre como um documento físico sobre o canvas escuro.
// Estética editorial: papel quente, tipografia precisa, sem ornamentos.

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500&family=IBM+Plex+Mono:wght@400&display=swap');

  #lab-toggle {
    position: fixed;
    bottom: 24px;
    left: 24px;
    z-index: 200;
    background: none;
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.25);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    padding: 6px 10px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  #lab-toggle:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.3); }

  #lab-sheet {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 360px;
    background: #F4F2EC;
    border-left: 1px solid #D0CCC2;
    z-index: 150;
    overflow-y: auto;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: 'Space Grotesk', system-ui, sans-serif;
  }

  #lab-sheet.open { transform: translateX(0); }

  .lab-sheet-inner { padding: 32px 28px 48px; }

  .lab-tag {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    color: #A09C94;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin-bottom: 20px;
    display: block;
  }

  .lab-title {
    font-size: 22px;
    font-weight: 500;
    color: #1A1816;
    letter-spacing: 0.04em;
    margin-bottom: 28px;
    line-height: 1.2;
  }

  .lab-section {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #DDD9D0;
  }
  .lab-section:last-child { border-bottom: none; margin-bottom: 0; }

  .lab-section-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    color: #A09C94;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin-bottom: 10px;
    display: block;
  }

  .lab-body {
    font-size: 11px;
    color: #58544E;
    line-height: 1.85;
    font-weight: 400;
  }

  .lab-concept {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    color: #8A8680;
    letter-spacing: 0.1em;
    line-height: 1.9;
  }

  .lab-quote {
    font-size: 11px;
    color: #7A7670;
    line-height: 1.85;
    font-style: italic;
    padding-left: 14px;
    border-left: 2px solid #D0CCC2;
  }

  .lab-close {
    display: block;
    width: 100%;
    margin-top: 32px;
    padding: 10px;
    background: none;
    border: 1px solid #D0CCC2;
    color: #A09C94;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s;
  }
  .lab-close:hover { border-color: #8A8680; color: #1A1816; }
`;

let injected = false;

export function createAbout({ title, behavior, concept, quote } = {}) {
  if (!injected) {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    injected = true;
  }

  // Botão toggle (bottom-left)
  const btn = document.createElement("button");
  btn.id = "lab-toggle";
  btn.textContent = "FICHA";
  document.body.appendChild(btn);

  // Painel lateral
  const sheet = document.createElement("div");
  sheet.id = "lab-sheet";
  sheet.innerHTML = `
    <div class="lab-sheet-inner">
      <span class="lab-tag">ficha de laboratório</span>
      <div class="lab-title">${title ?? ""}</div>

      ${behavior ? `
      <div class="lab-section">
        <span class="lab-section-label">comportamento</span>
        <p class="lab-body">${behavior}</p>
      </div>` : ""}

      ${concept ? `
      <div class="lab-section">
        <span class="lab-section-label">conceitos</span>
        <p class="lab-concept">${concept.replace(/·/g, "<br>·")}</p>
      </div>` : ""}

      ${quote ? `
      <div class="lab-section">
        <span class="lab-section-label">referência</span>
        <p class="lab-quote">${quote}</p>
      </div>` : ""}

      <button class="lab-close">FECHAR FICHA ×</button>
    </div>
  `;
  document.body.appendChild(sheet);

  btn.addEventListener("click", () => sheet.classList.toggle("open"));
  sheet.querySelector(".lab-close").addEventListener("click", () => sheet.classList.remove("open"));
}
