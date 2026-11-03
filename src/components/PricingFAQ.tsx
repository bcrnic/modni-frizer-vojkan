import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollReveal } from "./animations/ScrollReveal";

const PricingFAQ = () => {
  return (
    <section id="cene" className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        <ScrollReveal className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">Cene</p>
          <h2 className="heading-section mb-6">
            Cene u salonu Modni frizer VOJKAN - Novi Sad
          </h2>
          <div className="decorative-line mb-8" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Najčešće pitanje je: “Koliko košta?”. Cene su okvirne i zavise od dužine kose i utroška materijala.
          </p>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Da li imate cenovnik?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Imamo okvirne cene u sekciji "Cenovnik". Tačna cena zavisi od dužine kose, gustine i količine materijala.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Zašto se cena razlikuje od osobe do osobe?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Kod farbanja i balayage-a, utrošak materijala i vreme rada se razlikuju. Zato uvek radimo kratke konsultacije
                pre usluge i dogovorimo cenu pre početka.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Da li su cene iz cenovnika konačne?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Cene su okvirne. Tačna cena zavisi od dužine kose, gustine i utroška materijala - zato se dogovaramo nakon kratkih
                konsultacija.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Kako najbrže da dobijem tačnu cenu?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Javite nam se sa uslugom i dužinom kose (po želji i fotografijom) - kontakt je na dnu stranice. Ili dođite u
                salon, pa ćemo cenu dogovoriti na kratkim konsultacijama.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>
      </div>
    </section>
  );
};

export default PricingFAQ;
