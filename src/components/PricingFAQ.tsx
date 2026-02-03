import { CalendarDays, MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BOOKING_URL, WHATSAPP_NUMBER, WHATSAPP_PREFILL } from "@/config/links";
import { ScrollReveal } from "./animations/ScrollReveal";

const PricingFAQ = () => {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, "")}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;

  return (
    <section id="cene" className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        <ScrollReveal className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">Cene</p>
          <h2 className="heading-section mb-6">
            Cene u salonu <span className="text-gold-gradient">Modni frizer VOJKAN</span> (Novi Sad)
          </h2>
          <div className="decorative-line mb-8" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Najčešće pitanje je: “Koliko košta?”. Cene su okvirne i zavise od dužine kose i utroška materijala.
            Najbrži način da dobiješ tačnu cenu je poruka - napiši uslugu i pošalji sliku kose.
          </p>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Da li imate cenovnik?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Imamo okvirne cene u sekciji “Usluge”. Tačna cena zavisi od dužine kose, gustine i količine materijala.
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
              <AccordionTrigger>Da li moram da zakažem termin?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Može i bez zakazivanja, ali preporučujemo zakazivanje kako bi termin bio siguran - posebno za boju, balayage i
                vikend.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Kako najbrže da dobijem tačnu cenu?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Pošalji poruku: usluga + dužina kose + (po želji) fotografija. Javljamo ti okvir i predlog termina.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-gold">
              <CalendarDays className="w-5 h-5" />
              Zakaži termin
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-outline-gold">
              <MessageCircle className="w-5 h-5" />
              Pitaj za cenu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingFAQ;
