// Runs after `vite build`: puts the rendered home page into dist/index.html.
import { readFile, writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const dist = resolve("dist");
const { render } = await import(pathToFileURL(resolve("dist-ssr/entry-server.js")).href);
const html = await readFile(resolve(dist, "index.html"), "utf8");
const app = render();
if (!html.includes('<div id="root"></div>')) throw new Error("root div not found in dist/index.html");
await writeFile(resolve(dist, "index.html"), html.replace('<div id="root"></div>', `<div id="root">${app}</div>`));
await rm(resolve("dist-ssr"), { recursive: true, force: true });
console.log(`prerendered / (${app.length} chars)`);
