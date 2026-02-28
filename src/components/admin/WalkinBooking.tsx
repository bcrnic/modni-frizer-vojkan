import { useState, useCallback } from "react";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Clock, Loader2, UserPlus } from "lucide-react";
import {
  checkSlotAvailability,
  createAppointment,
  getSlotStateColor,
} from "@/services/booking";
import type { SlotAvailability } from "@/services/booking";
import { cn } from "@/lib/utils";
import { SERVICES, TIME_SLOTS, SATURDAY_TIME_SLOTS } from "@/config/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalkinBookingProps {
  /** Poziva se nakon uspešnog kreiranja – npr. za re-fetch liste */
  onSuccess?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WalkinBooking({ onSuccess }: WalkinBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, SlotAvailability>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // ── Fetch slots in parallel ────────────────────────────────────────────────

  const fetchSlotAvailability = useCallback(async (date: Date) => {
    setIsLoadingSlots(true);
    setSlotAvailability({});
    try {
      const isSat = date.getDay() === 6;
      const slots = isSat ? SATURDAY_TIME_SLOTS : TIME_SLOTS;

      const entries = await Promise.all(
        slots.map(async (slot) => {
          const [hours, minutes] = slot.split(":").map(Number);
          const slotDate = new Date(date);
          slotDate.setHours(hours, minutes, 0, 0);
          const availability = await checkSlotAvailability(slotDate);
          return [slot, availability] as const;
        })
      );

      const results: Record<string, SlotAvailability> = {};
      for (const [slot, availability] of entries) {
        if (availability) results[slot] = availability;
      }
      setSlotAvailability(results);
    } catch (err) {
      console.error("Error fetching slot availability:", err);
      toast({
        title: "Greška",
        description: "Nije moguće proveriti dostupnost slotova.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
    if (date) await fetchSlotAvailability(date);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedService || !customerName) {
      toast({
        title: "Nedostaju podaci",
        description: "Popuni ime klijenta, datum, vreme i uslugu.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      const result = await createAppointment({
        customerName,
        customerPhone: customerPhone || "—",
        startTime,
        serviceType: selectedService,
        notes: notes || undefined,
        source: "walkin",
      });

      if (!result.success) throw new Error(result.error ?? "Greška pri kreiranju termina");

      toast({
        title: "Termin kreiran ✓",
        description: `${customerName} – ${format(startTime, "d. MMMM", { locale: srLatn })} u ${selectedTime}h`,
      });

      // Reset
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
      setSelectedService("");
      setSelectedTime("");

      // Re-fetch dostupnosti i lista u parent-u
      await fetchSlotAvailability(selectedDate);
      onSuccess?.();
    } catch (err) {
      toast({
        title: "Greška",
        description: err instanceof Error ? err.message : "Kreiranje termina nije uspelo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = selectedDate
    ? selectedDate.getDay() === 6
      ? SATURDAY_TIME_SLOTS
      : TIME_SLOTS
    : [];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">

      {/* Gornji red: kalendar + vremenski slotovi */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Kalendar */}
        <div>
          <Label className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Datum
          </Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={srLatn}
            className="rounded-md border border-border"
          />
        </div>

        {/* Slotovi */}
        <div>
          <Label className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {selectedDate
              ? `Vreme – ${format(selectedDate, "d. MMM", { locale: srLatn })}`
              : "Vreme"}
          </Label>

          {isLoadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : timeSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Izaberi datum.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => {
                const avail = slotAvailability[time];
                // Admins can override ONLINE_FULL, only truly FULL is blocked
                const isFull = avail?.state === "FULL";

                return (
                  <div key={time} className="relative">
                    <Button
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => !isFull && setSelectedTime(time)}
                      className={cn(
                        "w-full text-xs",
                        isFull && "opacity-40 cursor-not-allowed",
                        selectedTime === time && "ring-2 ring-primary"
                      )}
                    >
                      {time}
                    </Button>

                    {avail && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "absolute -top-2 -right-2 text-[9px] py-0 px-1 leading-tight",
                          getSlotStateColor(avail.state)
                        )}
                      >
                        {avail.total_count}/{avail.total_capacity}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Donji deo: usluga + podaci */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Usluga *</Label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Izaberi uslugu..." />
            </SelectTrigger>
            <SelectContent>
              {SERVICES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wk-name">Ime klijenta *</Label>
          <Input
            id="wk-name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ime i prezime"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wk-phone">Telefon (opciono)</Label>
          <Input
            id="wk-phone"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+381 6X XXX XXXX"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wk-notes">Napomena (opciono)</Label>
          <Input
            id="wk-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Posebni zahtevi..."
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedDate || !selectedTime || !selectedService || !customerName}
        className="w-full sm:w-auto"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Kreiranje...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Zakaži termin
          </>
        )}
      </Button>
    </div>
  );
}
