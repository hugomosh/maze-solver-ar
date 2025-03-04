import { defineConfig } from "vite";

export default defineConfig({
  base: "/maze-solver-ar/", // Replace with your actual GitHub repository name
  server: {
    allowedHosts: [
      "gitpod.io",
      "localhost",
      "5173-hugomosh-mazesolverar-x70s2thhzm7.ws-us118.gitpod.io",
    ],
  },
});
