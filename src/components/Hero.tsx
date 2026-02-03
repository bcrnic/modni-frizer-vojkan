import { MessageCircle, Mail, CalendarDays } from "lucide-react";
import logo from "@/assets/logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import { BOOKING_URL, EMAIL_ADDRESS, VIBER_NUMBER, WHATSAPP_NUMBER, WHATSAPP_PREFILL } from "@/config/links";

/*
=== MESTA ZA IZMENU ===
- WHATSAPP_NUMBER: Promenite broj telefona za WhatsApp
- EMAIL_ADDRESS: Promenite email adresu
*/

const Hero = () => {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, "")}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;
  const viberLink = `viber://chat?number=${encodeURIComponent(VIBER_NUMBER.replace(/\s/g, ""))}`;
  const emailLink = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent("Zakazivanje termina - Modni frizer VOJKAN")}`;

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Pozadinska slika sa overlay-em */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Luksuzni frizerski salon"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Sadržaj */}
        <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Logo */}
          <div className="mb-8 animate-fade-in opacity-0" style={{ animationDelay: "0.2s" }}>
            <img
              src={logo}
              alt="Modni Frizer Vojkan Logo"
              className="w-36 h-36 md:w-48 md:h-48 mx-auto object-contain mix-blend-lighten opacity-90"
            />
          </div>

          {/* Naslov */}
          <h1 
            className="heading-display mb-6 text-foreground animate-fade-in opacity-0"
            style={{ animationDelay: "0.4s" }}
          >
            Ženski frizerski salon u <span className="text-gold-gradient">Novom Sadu</span> - frizura koja ti stoji i sutra
          </h1>

          {/* Podnaslov */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 font-light tracking-wide animate-fade-in opacity-0"
            style={{ animationDelay: "0.6s" }}
          >
            U “<span className="text-gold-gradient">Modnom frizeru VOJKAN</span>” radiš sa frizerima koji slušaju, predlažu i rade precizno. Zakaži termin za šišanje,
            boju, balayage ili svečanu frizuru - bez komplikacija.
          </p>

          {/* Dekorativna linija */}
          <div 
            className="decorative-line mb-12 animate-fade-in opacity-0"
            style={{ animationDelay: "0.7s" }}
          />

          {/* CTA Dugmad */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.8s" }}
          >
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              <CalendarDays className="w-5 h-5" />
              Zakaži termin
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
            <a
              href={viberLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold"
            >
              <MessageCircle className="w-5 h-5" />
              Viber
            </a>
            <a
              href={emailLink}
              className="btn-outline-gold"
            >
              <Mail className="w-5 h-5" />
              Email
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-6 animate-fade-in opacity-0" style={{ animationDelay: "0.95s" }}>
            Najbrže odgovaramo na poruke. Pošalji: željeni dan + usluga + dužina kose.
          </p>
        </div>

        {/* Scroll indikator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-16 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

    </>
  );
};

export default Hero;
