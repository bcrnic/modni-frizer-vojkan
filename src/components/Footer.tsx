import { Instagram, Facebook, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";
import { SOCIAL_LINKS } from "@/config/links";
import { servicePages, servicePagePath } from "@/content/servicePages";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const onHome = useLocation().pathname === "/";
  const sectionHref = (hash: string) => (onHome ? hash : `${import.meta.env.BASE_URL}${hash}`);

  return (
    // Extra bottom padding on phones keeps the footer clear of the fixed call/WhatsApp bar.
    <footer className="pt-12 pb-40 md:pb-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <img
            src={`${import.meta.env.BASE_URL}assets/logo-160.webp`}
            alt="Modni Frizer VOJKAN"
            width={160}
            height={160}
            loading="lazy"
            decoding="async"
            className="w-20 h-20 object-contain opacity-80"
          />

          {/* Radno vreme */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pon-Pet: 11-19h | Sub: 8-16h</span>
          </div>

          {/* Društvene mreže */}
          <div className="flex items-center gap-4">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>

          {/* Minimalni linkovi */}
          <nav aria-label="Usluge" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {servicePages.map((page) => (
              <a
                key={page.slug}
                href={servicePagePath(page.slug)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {page.serviceName}
              </a>
            ))}
          </nav>
          <nav className="flex gap-6 text-sm">
            <a href={sectionHref("#usluge")} className="text-muted-foreground hover:text-primary transition-colors">
              Cenovnik
            </a>
            <a href={sectionHref("#kontakt")} className="text-muted-foreground hover:text-primary transition-colors">
              Kontakt
            </a>
          </nav>

          {/* Dekorativna linija */}
          <div className="decorative-line" />

          {/* Copyright */}
          <p className="text-muted-foreground text-sm text-center">
            © {currentYear} Modni Frizer VOJKAN. Sva prava zadržana.
          </p>
          <p className="text-muted-foreground text-xs text-center -mt-4">
            Izrada sajta:{" "}
            <a
              href="https://rebule.rs/"
              target="_blank"
              rel="noopener"
              className="hover:text-primary underline-offset-4 hover:underline transition-colors"
            >
              rebule.rs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
