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
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            <strong className="text-gold-gradient">Modni frizer VOJKAN</strong> je ženski frizerski salon u centru Novog Sada sa
            tradicijom dugom preko <strong className="text-primary">40 godina</strong>. Radimo porodično -
            <strong className="text-gold-gradient"> Vojkan</strong> i <strong className="text-gold-gradient">Boža</strong> - i cilj
            nam je da izađeš iz salona sa frizurom koju možeš lako da održavaš.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Pre svake promene radimo kratke konsultacije: šta želiš, šta ti stoji i šta je realno za tvoju kosu. Ako farbaš
            ili radiš balayage, dobićeš i savet kako da boja traje duže i kako da kosa ostane sjajna.
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
