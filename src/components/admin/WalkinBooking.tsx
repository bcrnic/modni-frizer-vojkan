import { useState } from "react";
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
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { checkSlotAvailability, createAppointment, getSlotStateLabel, getSlotStateColor } from "@/services/booking";
import type { SlotAvailability } from "@/services/booking";
import type { SlotState } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { SERVICES, TIME_SLOTS, SATURDAY_TIME_SLOTS } from "@/config/constants";

export default function WalkinBooking() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, SlotAvailability>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const fetchSlotAvailability = async (date: Date) => {
    setIsLoadingSlots(true);
    try {
      const isSat = date.getDay() === 6;
      const slots = isSat ? SATURDAY_TIME_SLOTS : TIME_SLOTS;
      const results: Record<string, SlotAvailability> = {};

      for (const slot of slots) {
        const [hours, minutes] = slot.split(':').map(Number);
        const slotDate = new Date(date);
        slotDate.setHours(hours, minutes, 0, 0);

        const availability = await checkSlotAvailability(slotDate);
        if (availability) {
          results[slot] = availability;
        }
      }

      setSlotAvailability(results);
    } catch (error) {
      console.error("Error fetching slot availability:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri proveri dostupnosti.",
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
    if (!selectedDate || !selectedTime || !selectedService || !customerName) {
      toast({
        title: "Greška",
        description: "Molimo popunite obavezna polja (ime i usluga).",
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
        startTime,
        serviceType: selectedService,
        notes: notes || undefined,
        source: 'walkin'
      });

      if (!result.success) {
        throw new Error(result.error || 'Greška pri kreiranju termina');
      }

      toast({
        title: "Walk-in termin zakazan",
        description: `${customerName} - ${format(startTime, "d. MMMM yyyy.", { locale: srLatn })} u ${selectedTime}h`,
      });

      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
      setSelectedService("");
      setSelectedTime("");
      
      // Refresh availability
      await fetchSlotAvailability(selectedDate);
    } catch (error) {
      console.error("Error creating walk-in:", error);
      toast({
        title: "Greška",
        description: error instanceof Error ? error.message : "Došlo je do greške pri kreiranju termina.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-lg font-medium mb-2">Walk-in Zakazivanje</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Kreiranje termina za walk-in klijente. Nije ograničeno online kvotom.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="text-sm text-muted-foreground mb-3 block">
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Datum
          </Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={srLatn}
            className="rounded-md border mx-auto"
          />
        </div>

        <div className="space-y-4">
          {selectedDate && (
            <div>
              <Label className="text-sm text-muted-foreground mb-3 block">
                <Clock className="w-4 h-4 inline mr-2" />
                Vreme ({format(selectedDate, "d. MMM", { locale: srLatn })})
              </Label>
              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {getAvailableTimeSlots().map((time) => {
                    const availability = slotAvailability[time];
                    const state = availability?.state || 'ONLINE_AVAILABLE';
                    const isSelectable = state !== 'FULL';
                    
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
                        
                        <Badge 
                          variant="outline"
                          className={cn(
                            "absolute -top-2 -right-2 text-[10px] py-0 px-1",
                            getSlotStateColor(state)
                          )}
                        >
                          {state === 'FULL' ? '×' : availability?.total_count || 0}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div>
            <Label>Usluga *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Izaberite uslugu..." />
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

          <div>
            <Label>Ime klijenta *</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ime i prezime"
            />
          </div>

          <div>
            <Label>Telefon (opciono)</Label>
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+381 6X XXX XXXX"
            />
          </div>

          <div>
            <Label>Napomena (opciono)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Posebni zahtevi..."
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedDate || !selectedTime || !selectedService || !customerName}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Kreiranje...
              </>
            ) : (
              "Zakaži walk-in"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
