import { Scissors, Award, Heart } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./animations/ScrollReveal";

const features = [
  {
    icon: Scissors,
    title: "Precizno šišanje",
    description: "Oblik koji se lepo nosi i kada nemaš vremena za stilizovanje."
  },
  {
    icon: Award,
    title: "Boje i balayage",
    description: "Prirodni prelivi i nijanse koje odgovaraju tenu i stilu."
  },
  {
    icon: Heart,
    title: "Konsultacije pre usluge",
    description: "Kratak dogovor pre rada - da znaš šta dobijaš i koliko traje."
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
            Iskustvo, mirna ruka i dogovor bez <span className="text-gold-gradient">iznenađenja</span>
          </h2>
          <div className="decorative-line mb-8" />
        </ScrollReveal>

        {/* Glavni tekst */}
        <ScrollReveal delay={0.2} className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-xl md:text-2xl text-muted-foreground/90 leading-relaxed mb-8 font-light">
            Ženski frizerski salon u centru Novog Sada sa tradicijom od <strong className="text-primary">40 godina</strong>.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Radimo porodično i cilj nam je frizura koju lako održavaš. Pre svake promene: kratka konsultacija i savet za negu.
          </p>
        </ScrollReveal>

        {/* Feature kartice */}
        <StaggerContainer className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="text-center p-10 border border-border/30 bg-card/30 shadow-sm
                              hover:border-primary/20 hover:shadow-md transition-all duration-500">
                <div className="inline-flex items-center justify-center w-14 h-14 
                                border border-primary/20 mb-8">
                  <feature.icon className="w-5 h-5 text-primary" />
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
