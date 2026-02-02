import { CalendarDays, MessageCircle } from "lucide-react";
import { ScrollReveal } from "./animations/ScrollReveal";
import { BOOKING_URL, WHATSAPP_NUMBER, WHATSAPP_PREFILL } from "@/config/links";

const BookingCTA = () => {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, "")}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <ScrollReveal className="text-center">
          <h2 className="heading-section mb-6">Zakaži termin u 30 sekundi</h2>
          <div className="decorative-line mb-8" />
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            Klikni na “Zakaži termin” i izaberi slobodan termin. Ako ti više odgovara, pošalji poruku — napiši
            uslugu i željeni dan, a mi predložimo najbolji termin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              <CalendarDays className="w-5 h-5" />
              Zakaži termin
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold"
            >
              <MessageCircle className="w-5 h-5" />
              Pošalji poruku
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BookingCTA;
