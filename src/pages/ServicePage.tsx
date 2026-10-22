import { lazy, Suspense, useEffect, useState } from "react";
import { CalendarDays, ChevronRight, Clock, MessageCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import StickyMobileBar from "@/components/StickyMobileBar";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WHATSAPP_NUMBER, WHATSAPP_PREFILL } from "@/config/links";
import { servicePages, servicePagePath, type ServicePage as ServicePageData } from "@/content/servicePages";

// Same as on the home page: the booking dialog loads only when someone wants to book.
const BookingCalendar = lazy(() => import("@/components/BookingCalendar"));

interface ServicePageProps {
  page: ServicePageData;
}

const ServicePage = ({ page }: ServicePageProps) => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRequested, setBookingRequested] = useState(false);
  const handleBookingOpen = () => {
    setBookingRequested(true);
    setBookingOpen(true);
  };

  // The prerendered HTML already has the right <title>; this covers the dev server.
  useEffect(() => {
    document.title = page.title;
  }, [page.title]);

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, "")}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;
  const otherPages = servicePages.filter((other) => other.slug !== page.slug);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation onBookingOpen={handleBookingOpen} />
      <main className="pb-24 md:pb-0">
        {/* Uvod: direktan odgovor odmah ispod naslova */}
        <section className="pt-32 pb-12 md:pt-40 md:pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <nav aria-label="Putanja" className="mb-8 text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-1">
                <li>
                  <a href={import.meta.env.BASE_URL} className="hover:text-primary transition-colors">
                    Početna
                  </a>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="w-4 h-4" />
                </li>
                <li aria-current="page" className="text-foreground">
                  {page.serviceName}
                </li>
              </ol>
            </nav>

            <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">{page.eyebrow}</p>
            <h1 className="heading-section mb-6">{page.h1}</h1>
            <div className="decorative-line mb-8 !mx-0" />
            <p className="lead-text mb-10">{page.intro}</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleBookingOpen} className="btn-gold">
                <CalendarDays className="w-5 h-5" />
                Zakaži termin
              </button>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-outline-gold">
                <MessageCircle className="w-5 h-5" />
                Pitaj za cenu
              </a>
            </div>
          </div>
        </section>

        {/* Cene i trajanje */}
        <section aria-labelledby="cene-title" className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <ScrollReveal>
              <h2 id="cene-title" className="heading-section mb-8 text-center">
                Cene: {page.serviceName.toLowerCase()}
              </h2>
              <div className="p-6 md:p-10 bg-card border border-border">
                <div className="space-y-5">
                  {page.prices.map((item) => (
                    <div key={item.name} className="flex justify-between items-start gap-4">
                      <span className="min-w-0 font-medium text-foreground">{item.name}</span>
                      <span className="shrink-0 max-w-[50%] text-right text-primary font-heading text-lg leading-snug">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-8 pt-6 border-t border-border flex items-start gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{page.duration}</span>
                </p>
              </div>
              <p className="text-center text-muted-foreground text-sm mt-6">
                Konsultacije su besplatne. Tačnu cenu dogovaramo nakon pregleda kose.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Tekst o usluzi */}
        <section className="section-padding">
          <div className="container mx-auto px-4 max-w-3xl space-y-12">
            {page.sections.map((section) => (
              <ScrollReveal key={section.heading}>
                <h2 className="font-heading text-2xl md:text-3xl mb-4">{section.heading}</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Radovi */}
        <section aria-labelledby="radovi-title" className="section-padding bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 id="radovi-title" className="heading-section mb-10 text-center">
              Naši radovi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {page.images.map((image) => (
                <figure key={image.file} className="gallery-item aspect-[4/5]">
                  <img
                    src={`${import.meta.env.BASE_URL}assets/${image.file}`}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    width={600}
                    height={750}
                    className="w-full h-full object-cover"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 z-10 p-4 bg-gradient-to-t from-black/85 via-black/20 to-transparent text-foreground font-heading text-base">
                    {image.alt}
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="text-center mt-8">
              <a href={`${import.meta.env.BASE_URL}#galerija`} className="text-primary hover:underline underline-offset-4">
                Pogledaj celu galeriju
              </a>
            </p>
          </div>
        </section>

        {/* Česta pitanja za ovu uslugu */}
        <section aria-labelledby="pitanja-title" className="section-padding">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 id="pitanja-title" className="heading-section mb-10 text-center">
              Česta pitanja
            </h2>
            <div className="space-y-6">
              {page.faq.map((item) => (
                <div key={item.question} className="p-6 bg-card border border-border">
                  <h3 className="font-heading text-xl mb-2">{item.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ostale usluge */}
        <section aria-labelledby="ostalo-title" className="pb-12">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 id="ostalo-title" className="font-heading text-2xl mb-6">
              Ostale usluge
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {otherPages.map((other) => (
                <a key={other.slug} href={servicePagePath(other.slug)} className="btn-outline-gold">
                  {other.serviceName}
                </a>
              ))}
              <a href={`${import.meta.env.BASE_URL}#usluge`} className="btn-outline-gold">
                Ceo cenovnik
              </a>
            </div>
          </div>
        </section>

        <Contact onBookingOpen={handleBookingOpen} />
      </main>
      <Footer />
      <StickyMobileBar />
      {bookingRequested && (
        <Suspense fallback={null}>
          <BookingCalendar open={bookingOpen} onOpenChange={setBookingOpen} />
        </Suspense>
      )}
    </div>
  );
};

export default ServicePage;
