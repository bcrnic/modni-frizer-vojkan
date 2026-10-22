import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { LazyMotion } from "framer-motion";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ServicePage from "./pages/ServicePage";
import { servicePages } from "./content/servicePages";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

// Visitors never download the admin panel.
const Admin = lazy(() => import("./pages/Admin"));
// Toasts are only shown after booking or in the admin panel,
// so they are not part of the first download.
const Toaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));
// Animation features load right after the page instead of with it.
const loadMotionFeatures = () => import("@/lib/motion-features").then((m) => m.default);

// Shared by the browser (App) and the build-time prerender (entry-server.tsx),
// so the prerendered HTML matches what React hydrates.
// The toaster appears only after the page has loaded in the browser, so the
// prerendered HTML and the first browser render are the same.
export const AppToaster = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <Toaster />
    </Suspense>
  );
};

export const AppRoutes = () => (
  <>
    <ScrollToTop />
    <Routes>
        <Route path="/" element={<Index />} />
        {servicePages.map((page) => (
          <Route key={page.slug} path={`/${page.slug}`} element={<ServicePage page={page} />} />
        ))}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <Admin />
            </Suspense>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <LazyMotion features={loadMotionFeatures} strict>
    <AppToaster />
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </BrowserRouter>
  </LazyMotion>
);

export default App;
