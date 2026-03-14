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
                Zakazivanje nije obavezno. Uvek primamo i klijente bez zakazivanja (walk-in). Za kraće čekanje preporučujemo zakazivanje termina unapred.
              </p>
            </div>

            <div className="p-6 bg-card border border-border">
              <h3 className="font-heading text-xl mb-2">Koliko traje šišanje i feniranje?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Klasično žensko šišanje sa feniranjem traje u proseku oko 45 minuta do sat vremena, zavisno od dužine i gustine kose. Usluge farbanja i balayage-a zahtevaju od 2 do 3.5 sata.
              </p>
            </div>

            <div className="p-6 bg-card border border-border">
              <h3 className="font-heading text-xl mb-2">Da li radite nedeljom?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ne, nedeljom ne radimo. Naše radno vreme je od ponedeljka do petka od 11:00 do 19:00, i subotom od 08:00 do 16:00 časova.
              </p>
            </div>

            <div className="p-6 bg-card border border-border">
              <h3 className="font-heading text-xl mb-2">Smešteni ste u centru, da li ima parkinga u blizini?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Da, nalazimo se u strogom centru Novog Sada (kod Hotela Centar). Najbliži javni parking je ispred Pozorišta, kao i u okolnim ulicama (plava zona).
              </p>
            </div>

            <div className="p-6 bg-card border border-border">
              <h3 className="font-heading text-xl mb-2">Kako da znam koja frizura mi najbolje pristaje?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pre svakog tretmana radimo besplatne konsultacije. Na osnovu vašeg oblika lica, tipa kose i životnog stila, naš tim će vam predložiti najbolju opciju održavanja i stilizovanja.
              </p>
            </div>
          </div>

          {onBookingOpen && (
            <div className="mt-10 flex flex-col items-center">
              <button onClick={onBookingOpen} className="btn-gold">
                Zakaži termin
              </button>
              <p className="mt-3 text-sm text-muted-foreground">
                ili dođi{" "}
                <span className="inline-flex items-center rounded-full bg-primary/15 border border-primary/30 px-2.5 py-0.5 text-sm text-primary font-medium">
                  bez zakazivanja
                </span>
              </p>
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FAQ;
