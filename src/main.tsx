import { createRoot, hydrateRoot } from "react-dom/client";
// Fonts are bundled with the site instead of loaded from Google Fonts,
// so they no longer block the first render.
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/inter/wght.css";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root")!;
const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const isHome = window.location.pathname.replace(/\/$/, "") === base;

// The home page is prerendered at build time (scripts/prerender.mjs), so React
// takes over the existing HTML. Every other path (admin, 404) gets the same
// index.html from the host, so its prerendered home content is cleared first.
if (isHome && root.hasChildNodes()) {
  hydrateRoot(root, <App />);
} else {
  root.textContent = "";
  createRoot(root).render(<App />);
}
