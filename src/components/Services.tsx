import { ScrollReveal, StaggerContainer, StaggerItem } from "./animations/ScrollReveal";
import type { CSSProperties } from "react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { ArrowRight } from "lucide-react";
import { services } from "@/content/pricing";
import { servicePageBySlug, servicePagePath } from "@/content/servicePages";

const Services = () => {
  return (
    <section id="usluge" className="section-padding">
      {/* On phones the section's own px-4 is enough; the extra container padding left too little room. */}
      <div className="container mx-auto px-0 sm:px-8">
        {/* Naslov sekcije */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">Cenovnik</p>
          <h2 className="heading-section mb-6">
            Usluge i <span className="text-gold-gradient">cene</span>
          </h2>
          <div className="decorative-line mb-8" />
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light">
            Šišanje, farbanje, pramenovi, balayage i nega kose. Cene zavise od dužine kose - javi se porukom za tačnu cenu.
          </p>
        </ScrollReveal>

        {/* Kategorije usluga */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {services.map((category) => (
            <StaggerItem key={category.category} className="min-w-0">
              {/* Gold light follows the mouse on desktop; on touch screens the card looks as before. */}
              <SpotlightCard
                className="h-full p-6 md:p-10"
                spotlightColor="#d4a832"
                intensity={0.12}
                spotlightSize={280}
                borderGlow={0.9}
                proximity={60}
                style={{
                  "--spotlight-card-surface": "hsl(var(--card))",
                  "--spotlight-card-border": "hsl(var(--border))",
                  "--spotlight-card-shadow": "none",
                } as CSSProperties}
              >
                <h3 className="font-heading text-xl md:text-2xl text-center mb-6 md:mb-8 pb-4 border-b border-border">
                  {category.category}
                </h3>
                <div className="space-y-5 md:space-y-6">
                  {category.items.map((item) => (
                    <div key={item.name} className="group">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <span className="min-w-0 font-medium text-foreground group-hover:text-primary transition-colors">
                          {item.name}
                        </span>
                        {/* Long prices ("od 450 RSD po pramenu") may wrap instead of widening the card. */}
                        <span className="shrink-0 max-w-[50%] text-right text-primary font-heading text-lg leading-snug">
                          {item.price}
                        </span>
                      </div>
                      <p className="text-muted-foreground/90 text-base md:text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
                {category.slug && (
                  <a
                    href={servicePagePath(category.slug)}
                    className="mt-8 inline-flex items-center gap-2 text-sm text-primary hover:underline underline-offset-4"
                  >
                    {servicePageBySlug[category.slug].linkLabel}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Napomena */}
        <ScrollReveal delay={0.3}>
          <p className="text-center text-muted-foreground text-sm mt-12">
            Konsultacije su besplatne. Tačnu cenu dogovaramo nakon pregleda kose.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Services;
