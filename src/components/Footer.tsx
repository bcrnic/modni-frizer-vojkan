import { Instagram, Facebook } from "lucide-react";
import logo from "@/assets/logo.png";

/*
=== DRUŠTVENE MREŽE - MESTA ZA IZMENU ===
Promenite URL-ove ispod sa vašim stvarnim profilima
*/
const INSTAGRAM_URL = "https://instagram.com/modnifrizer_vojkan"; // IZMENITE: Vaš Instagram profil
const FACEBOOK_URL = "https://facebook.com/modnifrizer.vojkan"; // IZMENITE: Vaš Facebook profil

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <img
            src={logo}
            alt="Modni Frizer VOJKAN"
            className="w-20 h-20 object-contain opacity-80"
          />

          {/* Društvene mreže */}
          <div className="flex items-center gap-4">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center border border-border 
                         hover:border-primary hover:text-primary transition-all duration-300"
              aria-label="Pratite nas na Instagramu"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center border border-border 
                         hover:border-primary hover:text-primary transition-all duration-300"
              aria-label="Pratite nas na Facebooku"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>

          {/* Navigacija */}
          <nav className="flex flex-wrap justify-center gap-8 text-sm">
            <a href="#o-salonu" className="text-muted-foreground hover:text-primary transition-colors">
              O salonu
            </a>
            <a href="#usluge" className="text-muted-foreground hover:text-primary transition-colors">
              Usluge
            </a>
            <a href="#galerija" className="text-muted-foreground hover:text-primary transition-colors">
              Galerija
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
