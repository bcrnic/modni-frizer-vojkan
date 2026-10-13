import { lazy, Suspense, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import PricingFAQ from "@/components/PricingFAQ";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BookingInfo from "@/components/sections/BookingInfo";
import FAQ from "@/components/sections/FAQ";
import StickyMobileBar from "@/components/StickyMobileBar";

// The booking dialog pulls in Supabase, the calendar and date-fns;
// download it only when a visitor actually wants to book.
const BookingCalendar = lazy(() => import("@/components/BookingCalendar"));

const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRequested, setBookingRequested] = useState(false);
  const handleBookingOpen = () => {
    setBookingRequested(true);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation onBookingOpen={handleBookingOpen} />
      <main className="pb-24 md:pb-0">
        <Hero onBookingOpen={handleBookingOpen} />
        <About />
        <Services />
        <BookingInfo />
        <PricingFAQ />
        <Gallery />
        <FAQ />
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

export default Index;
