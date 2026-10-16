import { createRoot } from "react-dom/client";
// Fonts are bundled with the site instead of loaded from Google Fonts,
// so they no longer block the first render.
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/inter/wght.css";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
