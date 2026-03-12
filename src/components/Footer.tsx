import { Instagram, Facebook, Clock } from "lucide-react";
import { SOCIAL_LINKS } from "@/config/links";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <img
            src={`${import.meta.env.BASE_URL}assets/logo.png`}
            alt="Modni Frizer VOJKAN"
            className="w-20 h-20 object-contain opacity-80"
          />

          {/* Radno vreme */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pon-Pet: 9-18h | Sub: 9-15h</span>
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
          <nav className="flex gap-6 text-sm">
            <a href="#usluge" className="text-muted-foreground hover:text-primary transition-colors">
              Cenovnik
            </a>
            <a href="#kontakt" className="text-muted-foreground hover:text-primary transition-colors">
              Kontakt
            </a>
          </nav>

          {/* Dekorativna linija */}
          <div className="decorative-line" />

          {/* Copyright */}
          <p className="text-muted-foreground text-sm text-center">
            © {currentYear} Modni Frizer VOJKAN. Sva prava zadržana.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
