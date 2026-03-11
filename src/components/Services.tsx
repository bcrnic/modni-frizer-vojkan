import { ScrollReveal, StaggerContainer, StaggerItem } from "./animations/ScrollReveal";

/*
=== CENOVNIK - MESTA ZA IZMENU ===
Izmenite cene i opise usluga u nizu "services" ispod
*/

const services = [
  {
    category: "Šišanje & Stilizacija",
    items: [
      { name: "Žensko šišanje + feniranje", price: "od 3.500 RSD", description: "Kreativno šišanje prilagođeno Vašem stilu" },
      { name: "Feniranje", price: "od 1.200 RSD", description: "Profesionalno feniranje i stilizacija" },
    ]
  },
  {
    category: "Farbanje Kose",
    items: [
      { name: "Farbanje kose - koren", price: "od 4.000 RSD", description: "Jednobojno farbanje premium bojama" },
      { name: "Farbanje kose - cela dužina", price: "od 5.000 RSD", description: "Jednobojno farbanje premium bojama" },
      { name: "Farbanje kose + šišanje", price: "od 6.000 RSD", description: "Jednobojno farbanje premium bojama" },
    ]
  },
  {
    category: "Pramenovi & Prelivi",
    items: [
      { name: "Pramenovi / Balayage", price: "od 9.000 RSD", description: "Moderna tehnika za prirodan izgled" },
      { name: "Pramenovi / Balayage + šišanje", price: "od 11.000 RSD", description: "Moderna tehnika za prirodan izgled" },
      { name: "Preliv / Toniranje", price: "od 4.000 RSD", description: "Osvežavanje i nijansiranje boje" },
      { name: "Preliv / Toniranje + šišanje", price: "od 6.000 RSD", description: "Osvežavanje i nijansiranje boje" },
    ]
  },
  {
    category: "Tretmani & Nega",
    items: [
      { name: "Regeneracija kose + feniranje", price: "od 2.500 RSD", description: "Dubinski tretman za oporavak kose" },
      { name: "Nadogradnja kose", price: "od 450 RSD po pramenu", description: "Totalna transformacija u jednom danu" },
    ]
  }
];

const Services = () => {
  return (
    <section id="usluge" className="section-padding">
      <div className="container mx-auto">
        {/* Naslov sekcije */}
        <ScrollReveal className="text-center mb-16">
          <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">Cenovnik</p>
          <h2 className="heading-section mb-6">
            Naše <span className="text-gold-gradient">cene</span>
          </h2>
          <div className="decorative-line mb-8" />
          <p className="text-muted-foreground max-w-xl mx-auto">
            Cene su okvirne i zavise od dužine kose i utroška materijala. Ako nisi sigurna šta ti tačno treba, javi se porukom
            - preporučićemo opciju i okvirnu cenu pre dolaska.
          </p>
        </ScrollReveal>

        {/* Kategorije usluga */}
        <StaggerContainer className="grid md:grid-cols-2 gap-8">
          {services.map((category) => (
            <StaggerItem key={category.category}>
              <div className="service-card h-full">
                <h3 className="font-heading text-2xl text-center mb-8 pb-4 border-b border-border">
                  {category.category}
                </h3>
                <div className="space-y-6">
                  {category.items.map((item) => (
                    <div key={item.name} className="group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {item.name}
                        </span>
                        <span className="text-primary font-heading text-lg ml-4 whitespace-nowrap">
                          {item.price}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Napomena */}
        <ScrollReveal delay={0.3}>
          <p className="text-center text-muted-foreground text-sm mt-12">
            * Cene mogu varirati u zavisnosti od dužine kose i kompleksnosti tretmana.
            Konsultacije su besplatne. Tačnu cenu dogovaramo nakon kratkog pregleda kose.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Services;
