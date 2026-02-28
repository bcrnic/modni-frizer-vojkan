import { useState, useEffect } from "react";
import { format, addDays, isSunday, isBefore, startOfDay, parseISO } from "date-fns";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Clock, Check, Loader2, AlertCircle } from "lucide-react";
import { checkSlotAvailability, createAppointment, getSlotStateLabel, getSlotStateColor } from "@/services/booking";
import type { SlotAvailability } from "@/services/booking";
import type { SlotState } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

import { SERVICES, TIME_SLOTS, SATURDAY_TIME_SLOTS } from "@/config/constants";

interface BookingCalendarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookingCalendar = ({ open, onOpenChange }: BookingCalendarProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, SlotAvailability>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const resetForm = () => {
    setStep(1);
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedService("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setNotes("");
    setSlotAvailability({});
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const fetchSlotAvailability = async (date: Date) => {
    setIsLoadingSlots(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        setSlotAvailability({});
        return;
      }

      const isSat = date.getDay() === 6;
      const slots = isSat ? SATURDAY_TIME_SLOTS : TIME_SLOTS;

      // Check all slots in parallel instead of sequentially
      const entries = await Promise.all(
        slots.map(async (slot) => {
          const [hours, minutes] = slot.split(':').map(Number);
          const slotDate = new Date(date);
          slotDate.setHours(hours, minutes, 0, 0);
          const availability = await checkSlotAvailability(slotDate);
          return [slot, availability] as const;
        })
      );

      const results: Record<string, SlotAvailability> = {};
      for (const [slot, availability] of entries) {
        if (availability) {
          results[slot] = availability;
        }
      }

      setSlotAvailability(results);
    } catch (error) {
      console.error("Error fetching slot availability:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri proveri dostupnosti. Molimo pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
    if (date) {
      await fetchSlotAvailability(date);
    }
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    
    const isSat = selectedDate.getDay() === 6;
    return isSat ? SATURDAY_TIME_SLOTS : TIME_SLOTS;
  };

  const handleSubmit = async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast({
        title: "Online zakazivanje nije dostupno",
        description: "Trenutno nije podešen sistem za online zakazivanje. Kontaktirajte nas putem telefona ili WhatsApp-a.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate || !selectedTime || !selectedService || !customerName || !customerPhone) {
      toast({
        title: "Greška",
        description: "Molimo popunite sva obavezna polja.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      const result = await createAppointment({
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        startTime,
        serviceType: selectedService,
        notes: notes || undefined,
        source: 'online'
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create appointment');
      }

      toast({
        title: "Termin uspešno zakazan!",
        description: `Očekujemo Vas ${format(startTime, "d. MMMM yyyy.", { locale: srLatn })} u ${selectedTime}h.`,
      });

      handleClose();
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Greška pri zakazivanju",
        description: error instanceof Error ? error.message : "Došlo je do greške. Molimo pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledDays = (date: Date) => {
    const today = startOfDay(new Date());
    return isSunday(date) || isBefore(date, today);
  };

  const availableSlots = getAvailableTimeSlots();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            Zakazivanje Termina
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Izaberite datum i vreme"}
            {step === 2 && "Izaberite uslugu"}
            {step === 3 && "Unesite Vaše podatke"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>

        {/* Step 1: Date & Time Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm text-muted-foreground mb-3 block">
                <CalendarIcon className="w-4 h-4 inline mr-2" />
                Izaberite datum
              </Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                locale={srLatn}
                className="rounded-md border border-border mx-auto pointer-events-auto"
                fromDate={new Date()}
                toDate={addDays(new Date(), 60)}
              />
            </div>

            {selectedDate && (
              <div>
                <Label className="text-sm text-muted-foreground mb-3 block">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Izaberite vreme ({format(selectedDate, "d. MMM", { locale: srLatn })})
                </Label>
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nema slobodnih termina za ovaj datum
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((time) => {
                      const availability = slotAvailability[time];
                      const state = availability?.state || 'ONLINE_AVAILABLE';
                      const isSelectable = state === 'ONLINE_AVAILABLE';
                      
                      return (
                        <div key={time} className="relative group">
                          <Button
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => isSelectable && setSelectedTime(time)}
                            className={cn(
                              "text-sm w-full",
                              !isSelectable && "opacity-50 cursor-not-allowed",
                              selectedTime === time && "ring-2 ring-primary"
                            )}
                          >
                            {time}
                          </Button>
                          
                          {/* Availability badge */}
                          <Badge 
                            variant="outline"
                            className={cn(
                              "absolute -top-2 -right-2 text-[10px] py-0 px-1",
                              getSlotStateColor(state)
                            )}
                          >
                            {state === 'ONLINE_AVAILABLE' ? '✓' : '!'}
                          </Badge>
                          
                          {/* Tooltip on hover */}
                          {!isSelectable && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background border text-xs rounded shadow-lg hidden group-hover:block whitespace-nowrap z-50">
                              {getSlotStateLabel(state)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedDate || !selectedTime}
              className="w-full"
            >
              Dalje
            </Button>
          </div>
        )}

        {/* Step 2: Service Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm text-muted-foreground mb-3 block">
                Izaberite uslugu
              </Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Odaberite uslugu..." />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Nazad
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedService}
                className="flex-1"
              >
                Dalje
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Customer Information */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">Vaš termin:</p>
              <p className="font-medium">
                {selectedDate && format(selectedDate, "EEEE, d. MMMM yyyy.", { locale: srLatn })}
              </p>
              <p className="font-medium">{selectedTime}h - {selectedService}</p>
            </div>

            <div>
              <Label htmlFor="name">Ime i prezime *</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Vaše ime"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+381 6X XXX XXXX"
              />
            </div>

            <div>
              <Label htmlFor="email">Email (opciono)</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="vas@email.com"
              />
            </div>

            <div>
              <Label htmlFor="notes">Napomena (opciono)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Posebni zahtevi..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Nazad
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !customerName || !customerPhone}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Zakazivanje...
                  </>
                ) : (
                  "Zakaži termin"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingCalendar;
