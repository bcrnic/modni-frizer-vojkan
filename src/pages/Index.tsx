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
import BookingInfo from "@/components/sections/BookingInfo";
import FAQ from "@/components/sections/FAQ";

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
        <BookingInfo onBookingOpen={handleBookingOpen} />
        <PricingFAQ onBookingOpen={handleBookingOpen} />
        <BookingCTA onBookingOpen={handleBookingOpen} />
        <Gallery />
        <FAQ onBookingOpen={handleBookingOpen} />
        <Contact onBookingOpen={handleBookingOpen} />
      </main>
      <Footer />
      <BookingCalendar open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  );
};

export default Index;
