import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        latencia: resolve(__dirname, "latencia.html"),
        tensao: resolve(__dirname, "tensao.html"),
        ruido: resolve(__dirname, "ruido.html"),
        traco: resolve(__dirname, "traco.html"),
        eco: resolve(__dirname, "eco.html"),
        nevoa: resolve(__dirname, "nevoa.html"),
        constelacao: resolve(__dirname, "constelacao.html"),
        erosao: resolve(__dirname, "erosao.html"),
        lente: resolve(__dirname, "lente.html"),
        halftone: resolve(__dirname, "halftone.html"),
      },
    },
  },
});
