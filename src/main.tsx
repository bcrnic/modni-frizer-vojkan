import { createRoot, hydrateRoot } from "react-dom/client";
// Fonts are bundled with the site instead of loaded from Google Fonts,
// so they no longer block the first render.
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/inter/wght.css";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root")!;
const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const path = window.location.pathname.slice(base.length).replace(/\/$/, "") || "/";
// Set by scripts/prerender.mjs. A host may answer an address with another
// page's HTML (the admin panel gets the home page), so check it is this page.
const isPrerendered = root.dataset.prerendered === path;

// Public pages are prerendered at build time, so React takes over the existing
// HTML. Anywhere else the prerendered content belongs to another page, so it is
// cleared and the page is drawn in the browser.
if (isPrerendered) {
  hydrateRoot(root, <App />);
} else {
  root.textContent = "";
  createRoot(root).render(<App />);
}
