import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { LazyMotion } from "framer-motion";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

// Visitors never download the admin panel.
const Admin = lazy(() => import("./pages/Admin"));
// Toasts are only shown after booking or in the admin panel,
// so they are not part of the first download.
const Toaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));
// Animation features load right after the page instead of with it.
const loadMotionFeatures = () => import("@/lib/motion-features").then((m) => m.default);

const App = () => (
  <LazyMotion features={loadMotionFeatures} strict>
    <Suspense fallback={null}>
      <Toaster />
    </Suspense>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
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
    </BrowserRouter>
  </LazyMotion>
);

export default App;
