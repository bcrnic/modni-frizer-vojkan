import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import PricingFAQ from "@/components/PricingFAQ";
import BookingCTA from "@/components/BookingCTA";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BookingCalendar from "@/components/BookingCalendar";

/*
=== MODNI FRIZER VOJKAN - GLAVNI SAJT ===

MESTA ZA IZMENU u sledećim fajlovima:
- src/components/Hero.tsx → WhatsApp broj, email
- src/components/Contact.tsx → Telefon, email, adresa, radno vreme
- src/components/Services.tsx → Cene i opisi usluga

Za Google mapu:
- src/components/Contact.tsx → Zamenite placeholder sa embed kodom

SEO meta tagovi:
- index.html → Promenite title i description
*/

const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const handleBookingOpen = () => setBookingOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <Navigation onBookingOpen={handleBookingOpen} />
      <main>
        <Hero onBookingOpen={handleBookingOpen} />
        <About />
        <Services />
        <PricingFAQ onBookingOpen={handleBookingOpen} />
        <BookingCTA onBookingOpen={handleBookingOpen} />
        <Gallery />
        <Contact onBookingOpen={handleBookingOpen} />
      </main>
      <Footer />
      <BookingCalendar open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  );
};

export default Index;
