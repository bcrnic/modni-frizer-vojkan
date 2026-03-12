import { CalendarDays } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

interface BookingInfoProps {
  onBookingOpen: () => void;
}

const BookingInfo = ({ onBookingOpen }: BookingInfoProps) => {
  return (
    <section id="zakazivanje" aria-labelledby="zakazivanje-title" className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        <ScrollReveal className="max-w-3xl mx-auto">
          <h2 id="zakazivanje-title" className="heading-section mb-6 text-center">
            Zakazivanje termina i walk-in posete
          </h2>

          <div className="space-y-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            <p className="lead-text">
              U našem salonu možete doći bez zakazivanja ili rezervisati termin unapred - kako vam više odgovara.
            </p>
            <p>
              Uvek ostavljamo deo kapaciteta za klijente koji dolaze bez zakazivanja, tako da ste dobrodošli u bilo kom
              trenutku tokom radnog vremena.
            </p>
            <p>
              Ako želite da izbegnete čekanje, preporučujemo zakazivanje termina online ili telefonom.
            </p>
            <p>
              Naš cilj je da pružimo maksimalnu fleksibilnost - bilo da planirate unapred ili dolazite spontano.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-2">
            <button onClick={onBookingOpen} className="btn-gold inline-flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Zakaži termin
            </button>
            <p className="text-sm text-muted-foreground">ili dođite bez zakazivanja</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BookingInfo;
