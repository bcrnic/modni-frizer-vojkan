// Runs after `vite build`: renders every public page into its own HTML file.
// "/" keeps the head from index.html; each service page gets its own title,
// description, canonical, Open Graph tags and JSON-LD.
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const dist = resolve("dist");
const { render, pages } = await import(pathToFileURL(resolve("dist-ssr/entry-server.js")).href);
const template = await readFile(resolve(dist, "index.html"), "utf8");
if (!template.includes('<div id="root"></div>')) throw new Error("root div not found in dist/index.html");

const escapeAttr = (text) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escapeText = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const replaceOnce = (html, pattern, replacement, label) => {
  if (!pattern.test(html)) throw new Error(`${label} not found in index.html`);
  return html.replace(pattern, replacement);
};

const withApp = (html, path) => html.replace('<div id="root"></div>', `<div id="root">${render(path)}</div>`);

await writeFile(resolve(dist, "index.html"), withApp(template, "/"));
console.log("prerendered /");

for (const page of pages) {
  let html = template;
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escapeText(page.title)}</title>`, "title");
  html = replaceOnce(html, /<meta name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeAttr(page.description)}" />`, "description");
  html = replaceOnce(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeAttr(page.title)}" />`, "og:title");
  html = replaceOnce(html, /<meta property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeAttr(page.description)}" />`, "og:description");
  html = replaceOnce(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${page.url}" />`, "og:url");
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${page.url}" />`, "canonical");
  // Only the home page shows the hero photo.
  html = html.replace(/\s*<!--[^>]*?-->\s*<link rel="preload" as="image" href="[^"]*hero-bg\.webp"[^>]*>/, "");
  html = html.replace(/\s*<link rel="preload" as="image" href="[^"]*hero-bg\.webp"[^>]*>/, "");
  // The home page schema (salon, FAQ) describes "/" only.
  html = replaceOnce(
    html,
    /(<!--[^>]*?-->\s*)?<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, "\\u003c")}</script>`,
    "JSON-LD",
  );
  const dir = resolve(dist, page.path.slice(1));
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, "index.html"), withApp(html, page.path));
  console.log(`prerendered ${page.path}`);
}

await rm(resolve("dist-ssr"), { recursive: true, force: true });
