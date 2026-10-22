import { createRoot, hydrateRoot } from "react-dom/client";
// Fonts are bundled with the site instead of loaded from Google Fonts,
// so they no longer block the first render.
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/inter/wght.css";
import App from "./App.tsx";
import "./index.css";
import { PRERENDERED_PATHS } from "./content/servicePages";

const root = document.getElementById("root")!;
const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const path = window.location.pathname.slice(base.length).replace(/\/$/, "") || "/";
const isPrerendered = PRERENDERED_PATHS.includes(path);

// Public pages are prerendered at build time (scripts/prerender.mjs), so React
// takes over the existing HTML. Every other path (admin, 404) gets the home
// page's index.html from the host, so that prerendered content is cleared first.
if (isPrerendered && root.hasChildNodes()) {
  hydrateRoot(root, <App />);
} else {
  root.textContent = "";
  createRoot(root).render(<App />);
}
