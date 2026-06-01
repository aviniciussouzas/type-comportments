import { initCardBehaviors } from "./cardBehaviors.js";

// Home sem hero animado — o catálogo é o conteúdo.
// Os micro-sketches dos cards são os únicos elementos vivos na home.

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCardBehaviors);
} else {
  initCardBehaviors();
}
