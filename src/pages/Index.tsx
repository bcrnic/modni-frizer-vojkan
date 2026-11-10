import { lazy, Suspense, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import FeaturedServices from "@/components/FeaturedServices";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FAQ from "@/components/sections/FAQ";
import { ONLINE_BOOKING_ENABLED } from "@/config/booking";

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
      <main>
        <Hero onBookingOpen={handleBookingOpen} />
        <FeaturedServices />
        <Services />
        <Gallery />
        <About />
        <FAQ />
        <Contact onBookingOpen={handleBookingOpen} />
      </main>
      <Footer />
      {ONLINE_BOOKING_ENABLED && bookingRequested && (
        <Suspense fallback={null}>
          <BookingCalendar open={bookingOpen} onOpenChange={setBookingOpen} />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
