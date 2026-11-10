import { CalendarDays, Images, MessageCircle } from "lucide-react";
import BlurText from "@/components/reactbits/BlurText";
import ShinyText from "@/components/reactbits/ShinyText";
import StarBorder from "@/components/reactbits/StarBorder";
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
        <BlurText
          as="h1"
          className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          delay={90}
          stepDuration={0.3}
          segments={[
            "Ženski frizer u centru",
            {
              key: "city",
              // Extend the gradient past descenders without changing line spacing.
              node: (
                <ShinyText
                  className="-my-[0.16em] py-[0.16em]"
                  color="#d4a832"
                  shineColor="#fff4cc"
                  speed={2.6}
                  delay={2.5}
                  shineWidth={30}
                >
                  Novog Sada
                </ShinyText>
              ),
            },
          ]}
        />
        <p className="mt-5 text-base leading-relaxed text-foreground motion-safe:animate-fade-in motion-safe:[animation-delay:300ms] motion-safe:[animation-fill-mode:both] md:text-lg">
          Vojkan i Boža vode porodični salon sa više od 40 godina tradicije, kod Hotela Centar.
        </p>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground motion-safe:animate-fade-in motion-safe:[animation-delay:400ms] motion-safe:[animation-fill-mode:both]">
          Šišanje, farbanje i balayage uz besplatne konsultacije.
        </p>
        <div className="mt-7 flex flex-col gap-3 motion-safe:animate-fade-in-up motion-safe:[animation-delay:500ms] motion-safe:[animation-fill-mode:both] sm:flex-row md:flex-wrap">
          <StarBorder
            as="a"
            href="#galerija"
            className="btn-gold"
            radius={0}
            thickness={1.5}
            color="#fff4cc"
            trailColor="#d4a832"
            glow={0.8}
            duration={5}
            borderColor="rgba(255, 255, 255, 0.18)"
          >
            <Images className="h-4 w-4" aria-hidden="true" />
            Pogledajte radove
          </StarBorder>
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
      <div className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute -inset-2 -z-10 border border-primary/30 shadow-gold-subtle md:-inset-3" />
        <img
          src={`${import.meta.env.BASE_URL}assets/1.webp`}
          alt="Bakarni talasi srednje dužine, rad iz salona Modni frizer Vojkan"
          width={900}
          height={1200}
          {...{ fetchpriority: "high" }}
          className="aspect-[4/3] w-full object-cover object-[center_55%] md:aspect-square"
        />
      </div>
    </div>
  </section>
);

export default Hero;
