import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import PricingFAQ from "@/components/PricingFAQ";
import BookingCTA from "@/components/BookingCTA";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

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
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Services />
        <PricingFAQ />
        <BookingCTA />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
