import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { m } from "framer-motion";
import { ScrollReveal } from "./animations/ScrollReveal";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const galleryImages = [
  {
    src: `${import.meta.env.BASE_URL}assets/8.webp`,
    alt: "Plava balayage sa loknama",
    caption: "Mekani prelivi i glamurozne lokne",
  },
  {
    src: `${import.meta.env.BASE_URL}assets/1.webp`,
    alt: "Bakarni talasi (srednja dužina)",
    caption: "Topla bakarna nijansa i mekani talasi",
  },
  {
    src: `${import.meta.env.BASE_URL}assets/4.webp`,
    alt: "Kratka bob frizura (blond)",
    caption: "Geometrijski bob sa čistom linijom",
  },
  {
    src: `${import.meta.env.BASE_URL}assets/3.webp`,
    alt: "Ravna kosa sa toplim prelivom",
    caption: "Prirodan preliv i sjajno feniranje",
  },
  {
    src: `${import.meta.env.BASE_URL}assets/2.webp`,
    alt: "Ledeno plavi lob (ravno)",
    caption: "Precizan rez i hladni tonovi plave",
  },
  {
    src: `${import.meta.env.BASE_URL}assets/7.webp`,
    alt: "Talasasta smeđa kosa",
    caption: "Mekani talasi za prirodan, elegantan look",
  },
  {
    src: `${import.meta.env.BASE_URL}assets/5.webp`,
    alt: "Kratki bob sa volumenom (blond)",
    caption: "Pun volumen i svetli blond ton",
  },
  {
    src: `${import.meta.env.BASE_URL}assets/10.webp`,
    alt: "Svečana frizura (lokne)",
    caption: "Romantične lokne za posebne prilike",
  },
  {
    src: `${import.meta.env.BASE_URL}assets/gallery-3.webp`,
    alt: "Kratki bob sa šiškama",
    caption: "Moderni bob sa punim volumenom",
  },
  {
    src: `${import.meta.env.BASE_URL}assets/6.webp`,
    alt: "Platinasto plavi bob",
    caption: "Kratka forma i hladna plava nijansa",
  },
  {
    src: `${import.meta.env.BASE_URL}assets/9.webp`,
    alt: "Platinasto plava ravna kosa",
    caption: "Ravno feniranje i čist, hladan ton plave",
  },
  {
    src: `${import.meta.env.BASE_URL}assets/gallery-2.webp`,
    alt: "Ravno feniranje (srednja dužina)",
    caption: "Prirodan sjaj i uredne linije šišanja",
  },
];

// The first photo is the large feature tile; with three columns the grid then
// fills exactly five rows. On phones the last photo spans both columns so the
// two-column grid has no gap at the end.
const tileClass = (index: number) =>
  cn(
    index === 0 && "col-span-2 aspect-[4/5] md:aspect-auto md:row-span-2",
    index === galleryImages.length - 1 && "col-span-2 md:col-span-1 aspect-[4/5]",
    index !== 0 && index !== galleryImages.length - 1 && "aspect-[4/5]",
  );

const Gallery = () => {
  const [open, setOpen] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const show = useCallback(
    (step: number) =>
      setOpen((current) =>
        current === null ? current : (current + step + galleryImages.length) % galleryImages.length,
      ),
    [],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") show(1);
      if (event.key === "ArrowLeft") show(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, show]);

  const current = open === null ? null : galleryImages[open];

  return (
    <section id="galerija" className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        <ScrollReveal className="text-center mb-12 md:mb-16">
          <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">Galerija</p>
          <h2 className="heading-section mb-6">
            Naši <span className="text-gold-gradient">Radovi</span>
          </h2>
          <div className="decorative-line mb-8" />
          <p className="text-muted-foreground max-w-xl mx-auto">
            Šišanja, boje i balayage iz našeg salona. Kliknite na fotografiju da je pogledate u punoj veličini.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 max-w-5xl mx-auto">
          {galleryImages.map((image, index) => (
            <m.button
              key={image.src}
              type="button"
              onClick={() => setOpen(index)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
              className={cn(
                "group relative overflow-hidden bg-card text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                tileClass(index),
              )}
              aria-label={`Otvori fotografiju: ${image.alt}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                width={900}
                height={1125}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 flex items-end justify-between gap-3 p-3 md:p-5
                           bg-gradient-to-t from-black/75 via-black/10 to-transparent
                           md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100 transition-opacity duration-500"
              >
                <span className="hidden md:block font-heading text-base lg:text-lg leading-snug text-foreground">
                  {image.alt}
                </span>
                <Expand className="ml-auto w-4 h-4 md:w-5 md:h-5 shrink-0 text-primary" aria-hidden="true" />
              </div>
            </m.button>
          ))}
        </div>

      </div>

      <Dialog open={open !== null} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent
          className="max-w-5xl w-[calc(100%-2rem)] p-0 gap-0 border-border bg-background/95 overflow-hidden"
          onTouchStart={(event) => (touchStartX.current = event.touches[0].clientX)}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const delta = event.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(delta) > 50) show(delta < 0 ? 1 : -1);
            touchStartX.current = null;
          }}
        >
          {current && open !== null && (
            <>
              <div className="relative flex items-center justify-center bg-black">
                <img
                  src={current.src}
                  alt={current.alt}
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => show(-1)}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/60 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Prethodna fotografija"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => show(1)}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/60 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Sledeća fotografija"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <DialogTitle className="font-heading text-lg">{current.alt}</DialogTitle>
                  <DialogDescription className="text-primary text-sm">{current.caption}</DialogDescription>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                  {open + 1} / {galleryImages.length}
                </span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery;
