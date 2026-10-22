import { hydrateRoot } from "react-dom/client";
import { act } from "react";
import { render } from "./entry-server";
import App from "./App";

// jsdom has no IntersectionObserver; the animated components only need it to exist.
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
} as unknown as typeof IntersectionObserver;

it("prerendered home page hydrates without mismatches", async () => {
  const html = render();
  const root = document.createElement("div");
  root.innerHTML = html;
  expect(root.querySelector("h1")?.textContent).toMatch(/Ženski frizerski salon u\s*Novom Sadu/);
  expect(root.textContent).toContain("Česta pitanja");
  document.body.appendChild(root);
  const errors: unknown[] = [];
  const spy = vi.spyOn(console, "error").mockImplementation((...a) => errors.push(a));
  await act(async () => {
    hydrateRoot(root, <App />, { onRecoverableError: (e) => errors.push(e) });
  });
  spy.mockRestore();
  // jsdom cannot draw on canvas and warns about act(); neither is a hydration problem.
  const real = errors.filter((e) => !/getContext|not configured to support act/.test(String(Array.isArray(e) ? e[0] : e)));
  expect(real).toEqual([]);
});
