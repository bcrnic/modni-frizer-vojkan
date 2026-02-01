import { useState } from "react";
import { Phone, Mail, MessageCircle, MapPin, Clock, CalendarDays } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./animations/ScrollReveal";
import BookingCalendar from "./BookingCalendar";

/*
=== KONTAKT INFORMACIJE - MESTA ZA IZMENU ===
Promenite vrednosti konstanti ispod sa vašim stvarnim podacima
*/

const PHONE_NUMBER = "+381 62 144 5958";
const WHATSAPP_NUMBER = "+381621445958";
const EMAIL_ADDRESS = "vojkan@example.com"; // IZMENITE: Vaša email adresa
const ADDRESS = "Uspenska 1, ulaz iz Pavla Papa";

// IZMENITE: Vaše radno vreme
const WORKING_HOURS = [
  { day: "Ponedeljak - Petak", hours: "11:00 - 20:00" },
  { day: "Subota", hours: "08:00 - 16:00" },
  { day: "Nedelja", hours: "Zatvoreno" },
];

const Contact = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Zdravo! Želim da zakažem termin u salonu Modni frizer VOJKAN.")}`;
  const emailLink = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent("Zakazivanje termina - Modni frizer VOJKAN")}`;
  const phoneLink = `tel:${PHONE_NUMBER.replace(/\s/g, "")}`;

  return (
    <>
      <section id="kontakt" className="section-padding">
        <div className="container mx-auto">
          {/* Naslov sekcije */}
          <ScrollReveal className="text-center mb-16">
            <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">Kontakt</p>
            <h2 className="heading-section mb-6">
              Zakažite <span className="text-gold-gradient">Termin</span>
            </h2>
            <div className="decorative-line mb-8" />
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Najlakše zakažite termin porukom - odgovor stiže u najkraćem roku
            </p>
            {/* Online booking CTA */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="btn-gold inline-flex items-center gap-2"
            >
              <CalendarDays className="w-5 h-5" />
              Zakaži Online Termin
            </button>
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
                      <p className="text-muted-foreground text-sm">Pišite nam direktno</p>
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
                      <p className="text-muted-foreground text-sm">{PHONE_NUMBER}</p>
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

      <BookingCalendar open={isBookingOpen} onOpenChange={setIsBookingOpen} />
    </>
  );
};

export default Contact;
