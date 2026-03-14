import { CalendarDays, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER, WHATSAPP_PREFILL } from "@/config/links";

interface StickyMobileBarProps {
  onBookingOpen: () => void;
}

const StickyMobileBar = ({ onBookingOpen }: StickyMobileBarProps) => {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, "")}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <p className="text-[11px] leading-snug text-muted-foreground mb-2">
          Može i{" "}
          <span className="inline-flex items-center rounded-full bg-primary/15 border border-primary/30 px-2 py-0.5 text-[11px] text-primary font-medium">
            bez zakazivanja
          </span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onBookingOpen} className="btn-gold w-full py-3 px-4 text-xs">
            <CalendarDays className="w-4 h-4" />
            Zakaži
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold w-full py-3 px-4 text-xs"
            aria-label="Pošalji poruku na WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default StickyMobileBar;
