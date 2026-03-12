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

          <p className="text-xl md:text-2xl text-muted-foreground/90 leading-relaxed mb-6 font-light">
            Dođi bez zakazivanja ili rezerviši termin unapred.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Uvek ostavljamo kapacitet za walk-in klijente. Za sigurnost, zakaži online ili telefonom.
          </p>

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
