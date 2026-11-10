import { CalendarDays, Images, MessageCircle } from "lucide-react";
import { ONLINE_BOOKING_ENABLED } from "@/config/booking";

interface HeroProps {
  onBookingOpen: () => void;
}

const Hero = ({ onBookingOpen }: HeroProps) => (
  <section className="px-4 pb-10 pt-24 md:px-8 md:pb-16 md:pt-28">
    <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
      <div className="max-w-xl">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-primary">
          Modni frizer Vojkan
        </p>
        <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Ženski frizer u centru <span className="text-primary">Novog Sada</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-foreground md:text-lg">
          Vojkan i Boža vode porodični salon sa više od 40 godina tradicije, kod Hotela Centar.
        </p>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Šišanje, farbanje i balayage uz besplatne konsultacije.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row md:flex-wrap">
          <a href="#galerija" className="btn-gold">
            <Images className="h-4 w-4" aria-hidden="true" />
            Pogledajte radove
          </a>
          <a href="#kontakt" className="btn-outline-gold">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Pitajte za cenu
          </a>
          {ONLINE_BOOKING_ENABLED && (
            <button type="button" onClick={onBookingOpen} className="btn-outline-gold">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Zakažite termin
            </button>
          )}
        </div>
      </div>
      <img
        src={`${import.meta.env.BASE_URL}assets/1.webp`}
        alt="Bakarni talasi srednje dužine, rad iz salona Modni frizer Vojkan"
        width={900}
        height={1200}
        {...{ fetchpriority: "high" }}
        className="aspect-[4/3] w-full object-cover object-[center_55%] md:aspect-square"
      />
    </div>
  </section>
);

export default Hero;
