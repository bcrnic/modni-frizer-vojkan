import { hydrateRoot } from "react-dom/client";
import { act } from "react";
import { pages, render } from "./entry-server";
import { servicePages } from "./content/servicePages";
import App from "./App";

// jsdom has no IntersectionObserver; the animated components only need it to exist.
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
} as unknown as typeof IntersectionObserver;

const hydrationErrors = async (path: string) => {
  window.history.replaceState(null, "", path);
  const root = document.createElement("div");
  root.innerHTML = render(path);
  document.body.appendChild(root);
  const errors: unknown[] = [];
  const spy = vi.spyOn(console, "error").mockImplementation((...a) => errors.push(a));
  await act(async () => {
    hydrateRoot(root, <App />, { onRecoverableError: (e) => errors.push(e) });
  });
  spy.mockRestore();
  root.remove();
  // jsdom cannot draw on canvas and warns about act(); neither is a hydration problem.
  return errors.filter((e) => !/getContext|not configured to support act/.test(String(Array.isArray(e) ? e[0] : e)));
};

it("prerendered home page has its content and hydrates without mismatches", async () => {
  const root = document.createElement("div");
  root.innerHTML = render("/");
  expect(root.querySelector("h1")?.textContent).toMatch(/Ženski frizerski salon u\s*Novom Sadu/);
  expect(root.textContent).toContain("Česta pitanja");
  expect(await hydrationErrors("/")).toEqual([]);
});

describe.each(servicePages)("service page /$slug", (page) => {
  it("renders its heading, prices and FAQ and hydrates without mismatches", async () => {
    const root = document.createElement("div");
    root.innerHTML = render(`/${page.slug}`);
    expect(root.querySelector("h1")?.textContent).toBe(page.h1);
    for (const item of page.prices) expect(root.textContent).toContain(item.price);
    for (const item of page.faq) expect(root.textContent).toContain(item.question);
    expect(await hydrationErrors(`/${page.slug}`)).toEqual([]);
  });
});

it("service page head data matches the page", () => {
  for (const page of pages) {
    expect(page.title.length).toBeLessThanOrEqual(60);
    expect(page.description.length).toBeLessThanOrEqual(155);
    expect(JSON.stringify(page.jsonLd)).toContain(page.url);
  }
});
