import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { AppRoutes, AppToaster } from "./App";

// Renders the home page to HTML at build time, so search engines and AI
// crawlers get the full text without running JavaScript. The tree mirrors
// App, so the browser can hydrate it instead of drawing it again.
export function render() {
  return renderToString(
    <LazyMotion features={domAnimation} strict>
      <AppToaster />
      <StaticRouter location="/">
        <AppRoutes />
      </StaticRouter>
    </LazyMotion>,
  );
}
