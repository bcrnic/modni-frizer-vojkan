import { Scissors, Award, Heart } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./animations/ScrollReveal";

const features = [
  {
    icon: Scissors,
    title: "Modni Stil",
    description: "Pratimo najnovije trendove i prilagođavamo ih vašem stilu"
  },
  {
    icon: Award,
    title: "40+ Godina Iskustva",
    description: "Preko četiri decenije posvećenosti ženskoj lepoti i stilu"
  },
  {
    icon: Heart,
    title: "Zadovoljni Klijenti",
    description: "Hiljade zadovoljnih klijentkinja tokom godina"
  }
];

const About = () => {
  return (
    <section id="o-salonu" className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        {/* Naslov sekcije */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">O nama</p>
          <h2 className="heading-section mb-6">
            Tradicija Kvaliteta i <span className="text-gold-gradient">Stila</span>
          </h2>
          <div className="decorative-line mb-8" />
        </ScrollReveal>

        {/* Glavni tekst */}
        <ScrollReveal delay={0.2} className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            <strong className="text-foreground">Modni frizer VOJKAN</strong> je premium ženski frizerski salon 
            u srcu Novog Sada, sa tradicijom dugom preko <strong className="text-primary">40 godina</strong>. 
            Glavni frizer <strong className="text-foreground">Vojkan</strong> je osnivač salona, 
            a uz njega radi i njegov sin <strong className="text-foreground">Boža</strong>, 
            koji je ispekao porodični zanat i nastavlja tradiciju izvrsnosti.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Verujemo da je svaka frizura umetničko delo. Bilo da tražite elegantnu transformaciju 
            ili održavanje vašeg savršenog izgleda, naš salon je mesto gde porodična tradicija 
            sreće savremeni stil.
          </p>
        </ScrollReveal>

        {/* Feature kartice */}
        <StaggerContainer className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="text-center p-8 border border-border/50 bg-card/50 
                              hover:border-primary/30 transition-all duration-500">
                <div className="inline-flex items-center justify-center w-16 h-16 
                                border border-primary/30 mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-xl mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default About;
