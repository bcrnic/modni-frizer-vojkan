import { Phone, Mail, MessageCircle, MapPin, Clock, CalendarDays } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./animations/ScrollReveal";
import { BOOKING_URL, EMAIL_ADDRESS, PHONE_NUMBER_DISPLAY, PHONE_NUMBER_TEL, VIBER_NUMBER, WHATSAPP_NUMBER, WHATSAPP_PREFILL } from "@/config/links";

/*
=== KONTAKT INFORMACIJE - MESTA ZA IZMENU ===
Promenite vrednosti konstanti ispod sa vašim stvarnim podacima
*/

const ADDRESS = "Uspenska 1, ulaz iz Pavla Papa";

// IZMENITE: Vaše radno vreme
const WORKING_HOURS = [
  { day: "Ponedeljak - Petak", hours: "11:00 - 20:00" },
  { day: "Subota", hours: "08:00 - 16:00" },
  { day: "Nedelja", hours: "Zatvoreno" },
];

const Contact = () => {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;
  const viberLink = `viber://chat?number=${encodeURIComponent(VIBER_NUMBER.replace(/\s/g, ""))}`;
  const emailLink = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent("Zakazivanje termina - Modni frizer VOJKAN")}`;
  const phoneLink = `tel:${PHONE_NUMBER_TEL.replace(/\s/g, "")}`;

  return (
    <>
      <section id="kontakt" className="section-padding">
        <div className="container mx-auto">
          {/* Naslov sekcije */}
          <ScrollReveal className="text-center mb-16">
            <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">Kontakt</p>
            <h2 className="heading-section mb-6">
              Tu smo u <span className="text-gold-gradient">centru Novog Sada</span>
            </h2>
            <div className="decorative-line mb-8" />
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Najbrže je porukom (WhatsApp/Viber). Ako voliš direktno - pozovi nas. Odgovaramo u toku radnog vremena i
              potvrđujemo termin čim se dogovorimo.
            </p>
            {/* Online booking CTA */}
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-flex items-center gap-2"
            >
              <CalendarDays className="w-5 h-5" />
              Zakaži termin
            </a>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Leva strana - Kontakt dugmad */}
            <div className="space-y-8">
              {/* CTA dugmad */}
              <StaggerContainer className="grid gap-4">
                <StaggerItem>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-6 bg-card border border-border 
                               hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 flex items-center justify-center border border-primary/30 
                                    group-hover:bg-primary/10 transition-colors">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium mb-1">WhatsApp</p>
                      <p className="text-muted-foreground text-sm">Pošalji poruku i napiši uslugu + željeni dan</p>
                    </div>
                  </a>
                </StaggerItem>

                <StaggerItem>
                  <a
                    href={viberLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-6 bg-card border border-border 
                               hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 flex items-center justify-center border border-primary/30 
                                    group-hover:bg-primary/10 transition-colors">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium mb-1">Viber</p>
                      <p className="text-muted-foreground text-sm">Pošalji poruku i napiši uslugu + željeni dan</p>
                    </div>
                  </a>
                </StaggerItem>

                <StaggerItem>
                  <a
                    href={emailLink}
                    className="flex items-center gap-4 p-6 bg-card border border-border 
                               hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 flex items-center justify-center border border-primary/30 
                                    group-hover:bg-primary/10 transition-colors">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium mb-1">Email</p>
                      <p className="text-muted-foreground text-sm">{EMAIL_ADDRESS}</p>
                    </div>
                  </a>
                </StaggerItem>

                <StaggerItem>
                  <a
                    href={phoneLink}
                    className="flex items-center gap-4 p-6 bg-card border border-border 
                               hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 flex items-center justify-center border border-primary/30 
                                    group-hover:bg-primary/10 transition-colors">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium mb-1">Telefon</p>
                      <p className="text-muted-foreground text-sm">{PHONE_NUMBER_DISPLAY}</p>
                    </div>
                  </a>
                </StaggerItem>
              </StaggerContainer>

              {/* Radno vreme */}
              <ScrollReveal delay={0.3}>
                <div className="p-8 bg-card border border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="font-heading text-xl">Radno Vreme</h3>
                  </div>
                  <div className="space-y-3">
                    {WORKING_HOURS.map((schedule) => (
                      <div key={schedule.day} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{schedule.day}</span>
                        <span className={schedule.hours === "Zatvoreno" ? "text-muted-foreground" : "text-foreground"}>
                          {schedule.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Desna strana - Mapa i adresa */}
            <div className="space-y-6">
              {/* Adresa */}
              <ScrollReveal direction="right">
                <div className="flex items-start gap-4 p-6 bg-card border border-border">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading text-xl mb-2">Lokacija</h3>
                    <p className="text-muted-foreground font-medium">Hotel Centar</p>
                    <p className="text-muted-foreground">{ADDRESS}</p>
                    <p className="text-muted-foreground">Novi Sad 21000, Srbija</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Google Maps */}
              <ScrollReveal direction="right" delay={0.2}>
                <div className="aspect-[4/3] bg-card border border-border overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2805.2!2d19.8423!3d45.2551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475b1060a9297855%3A0x2d2f2e69f67e8b4f!2sHotel%20Centar!5e0!3m2!1ssr!2srs!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokacija salona Modni frizer VOJKAN - Hotel Centar, Novi Sad"
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default Contact;
