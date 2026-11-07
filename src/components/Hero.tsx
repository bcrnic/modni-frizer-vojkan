import { CalendarDays, Images } from "lucide-react";
import { ONLINE_BOOKING_ENABLED } from "@/config/booking";
import BlurText from "@/components/reactbits/BlurText";
import ShinyText from "@/components/reactbits/ShinyText";
import StarBorder from "@/components/reactbits/StarBorder";

interface HeroProps {
  onBookingOpen: () => void;
}

const Hero = ({ onBookingOpen }: HeroProps) => {
  return (
    <>
      {/* Top padding keeps the content below the fixed 80px navigation on short (laptop) screens. */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16 md:pt-32">
        {/* Pozadinska slika sa overlay-em */}
        <div className="absolute inset-0">
          <img
            src={`${import.meta.env.BASE_URL}assets/hero-bg.webp`}
            alt=""
            aria-hidden="true"
            width={1376}
            height={768}
            // React 18 only passes the lowercase attribute through to the DOM.
            {...{ fetchpriority: "high" }}
            className="w-full h-full object-cover object-[72%_center] md:object-center opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/45 to-background" />
        </div>

        {/* Sadržaj */}
        <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Logo */}
          <div className="mb-8 animate-fade-in opacity-0" style={{ animationDelay: "0.2s" }}>
            <img
              src={`${import.meta.env.BASE_URL}assets/logo.webp`}
              srcSet={`${import.meta.env.BASE_URL}assets/logo-288.webp 288w, ${import.meta.env.BASE_URL}assets/logo.webp 384w`}
              sizes="(min-width: 768px) 192px, 144px"
              width={384}
              height={384}
              alt="Modni Frizer Vojkan Logo"
              decoding="async"
              className="w-36 h-36 md:w-48 md:h-48 [@media(max-height:800px)]:md:w-36 [@media(max-height:800px)]:md:h-36 mx-auto object-contain mix-blend-lighten opacity-90"
            />
          </div>

          {/* Naslov */}
          <BlurText
            as="h1"
            className="heading-display mb-6 text-foreground justify-center"
            delay={90}
            stepDuration={0.3}
            segments={[
              "Ženski frizerski salon u",
              {
                key: "grad",
                node: (
                  <ShinyText color="#d4a832" shineColor="#fff4cc" speed={2.6} delay={2.5} shineWidth={30}>
                    Novom Sadu
                  </ShinyText>
                ),
              },
              "- frizura koja traje",
            ]}
          />

          <p
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-3 font-light tracking-wide animate-fade-in opacity-0"
            style={{ animationDelay: "0.5s" }}
          >
            {ONLINE_BOOKING_ENABLED ? "Zakazivanje termina ili" : "Dođite"}{" "}
            <span className="inline-flex items-center rounded-full bg-primary/15 border border-primary/30 px-2.5 py-0.5 md:px-3 md:py-1 text-sm md:text-base text-primary font-medium">
              {ONLINE_BOOKING_ENABLED ? "dolazak bez zakazivanja" : "bez zakazivanja"}
            </span>{" "}
            {ONLINE_BOOKING_ENABLED ? "- izbor je vaš." : "- tu smo u centru Novog Sada."}
          </p>

          {/* Podnaslov */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 font-light tracking-wide animate-fade-in opacity-0"
            style={{ animationDelay: "0.6s" }}
          >
            U "<span className="text-gold-gradient">Modnom frizeru VOJKAN</span>" radite sa frizerima koji slušaju, predlažu i rade precizno.
            {ONLINE_BOOKING_ENABLED
              ? " Zakažite termin za šišanje, boju ili balayage - bez komplikacija."
              : " Šišanje, boja i balayage - bez komplikacija."}
          </p>

          {/* Dekorativna linija */}
          <div 
            className="decorative-line mb-12 animate-fade-in opacity-0"
            style={{ animationDelay: "0.7s" }}
          />

          {/* CTA: online booking when it is on; otherwise a quiet link to the work. */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.8s" }}
          >
            {ONLINE_BOOKING_ENABLED ? (
              <StarBorder
                as="button"
                onClick={onBookingOpen}
                className="btn-gold"
                radius={0}
                thickness={1.5}
                color="#fff4cc"
                trailColor="#d4a832"
                glow={0.8}
                duration={5}
                borderColor="rgba(255, 255, 255, 0.18)"
              >
                <CalendarDays className="w-5 h-5" />
                Zakaži termin
              </StarBorder>
            ) : (
              <a href="#galerija" className="btn-outline-gold">
                <Images className="w-5 h-5" />
                Pogledajte naše radove
              </a>
            )}
          </div>
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
