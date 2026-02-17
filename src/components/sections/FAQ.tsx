import { ScrollReveal } from "@/components/animations/ScrollReveal";

interface FAQProps {
  onBookingOpen?: () => void;
}

const FAQ = ({ onBookingOpen }: FAQProps) => {
  return (
    <section id="faq" aria-labelledby="faq-title" className="section-padding">
      <div className="container mx-auto">
        <ScrollReveal className="max-w-3xl mx-auto">
          <h2 id="faq-title" className="heading-section mb-10 text-center">Česta pitanja</h2>

          <div className="space-y-8">
            <div className="p-6 bg-card border border-border">
              <h3 className="font-heading text-xl mb-2">Da li je potrebno zakazivanje?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Zakazivanje nije obavezno. Uvek primamo i klijente bez zakazivanja. Za kraće čekanje preporučujemo zakazivanje termina unapred.
              </p>
            </div>

            <div className="p-6 bg-card border border-border">
              <h3 className="font-heading text-xl mb-2">Da li mogu doći bez najave?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Da. Naš salon radi po hibridnom modelu, što znači da uvek ostavljamo mesta za walk-in klijente.
              </p>
            </div>
          </div>

          {onBookingOpen && (
            <div className="mt-10 flex justify-center">
              <button onClick={onBookingOpen} className="btn-gold">
                Zakaži termin
              </button>
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FAQ;
