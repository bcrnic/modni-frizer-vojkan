import { useState, useCallback, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { srLatn } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, User, Phone, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { SERVICES } from "@/config/constants";
import { cn } from "@/lib/utils";
import { editAppointment, getSlotsAvailability } from "@/services/booking";
import type { SlotState } from "@/services/booking";
import { salonSlotToDate } from "@/lib/booking-rules";

// The admin may move appointments anywhere in a wider window than the public slots.
const ADMIN_SLOT_TIMES: string[] = [];
for (let hour = 8; hour < 20; hour++) {
    for (const minute of [0, 30]) {
        ADMIN_SLOT_TIMES.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
}



interface AppointmentToEdit {
    id: string;
    customer_name: string;
    customer_phone: string;
    start_time: string;
    end_time: string;
    service_type: string;
    notes: string | null;
    status: "confirmed" | "cancelled";
}

interface EditAppointmentDialogProps {
    appointment: AppointmentToEdit | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

interface TimeSlot {
    time: string;
    state: SlotState | "CURRENT";
}

// ─── Component ────────────────────────────────────────────────────────────────

const EditAppointmentDialog = ({ appointment, isOpen, onOpenChange, onSuccess }: EditAppointmentDialogProps) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [isCheckingSlots, setIsCheckingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [serviceType, setServiceType] = useState("");
    const [notes, setNotes] = useState("");

    // Populate data when dialog opens
    useEffect(() => {
        if (isOpen && appointment) {
            const aptDate = parseISO(appointment.start_time);
            setSelectedDate(aptDate);
            setSelectedTime(format(aptDate, "HH:mm"));
            setName(appointment.customer_name);
            setPhone(appointment.customer_phone);
            setServiceType(appointment.service_type);
            setNotes(appointment.notes || "");
        }
    }, [isOpen, appointment]);

    // ── Fetch slots ────────────────────────────────────────────────────────────

    const fetchSlotAvailability = useCallback(async (date: Date) => {
        if (!appointment) return;
        setIsCheckingSlots(true);
        try {
            const now = new Date();
            const currentStart = parseISO(appointment.start_time).getTime();
            const starts = ADMIN_SLOT_TIMES.map((time) => ({ key: time, start: salonSlotToDate(date, time) }));

            // The appointment itself is excluded so it does not count against its own move.
            const availability = await getSlotsAvailability(
                starts.filter(({ start }) => start > now && start.getTime() !== currentStart),
                { excludeId: appointment.id }
            );

            const slots: TimeSlot[] = starts.map(({ key, start }) => ({
                time: key,
                state: start.getTime() === currentStart ? "CURRENT" : availability[key]?.state ?? "FULL",
            }));
            setAvailableSlots(slots);
            setSelectedTime((prev) => (slots.some((s) => s.time === prev) ? prev : ""));
        } catch (err) {
            console.error("Error fetching slots:", err);
            toast({ title: "Greška", description: "Nije moguće proveriti dostupnost", variant: "destructive" });
        } finally {
            setIsCheckingSlots(false);
        }
    }, [appointment]);

    useEffect(() => {
        if (selectedDate && isOpen) {
            fetchSlotAvailability(selectedDate);
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDate, fetchSlotAvailability, isOpen]);

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime || !name || !phone || !serviceType || !appointment) {
            toast({ title: "Greška", description: "Molimo popunite sva obavezna polja", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const appointmentDate = salonSlotToDate(selectedDate, selectedTime);

            const result = await editAppointment(appointment.id, {
                customerName: name,
                customerPhone: phone,
                serviceType,
                startTime: appointmentDate,
                notes,
            }, appointment.status);

            if (!result.success) {
                throw new Error(result.error || "Failed to update appointment");
            }

            toast({ title: "Uspešno", description: "Termin je uspešno izmenjen." });
            onSuccess();
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            toast({
                title: "Greška",
                description: err instanceof Error ? err.message : "Nije moguće izmeniti termin.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!appointment) return null;

    // ── Helpers ────────────────────────────────────────────────────────────────

    const getSlotColor = (state: SlotState | "CURRENT", isSelected: boolean) => {
        if (isSelected) return "bg-primary text-primary-foreground border-primary";
        if (state === "CURRENT") return "bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-400";
        if (state === "FULL") return "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed border-secondary";
        if (state === "ONLINE_FULL_WALKIN_AVAILABLE") return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30 hover:border-yellow-500/50";
        return "bg-background text-foreground border-input hover:border-primary/50";
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Uredi termin</DialogTitle>
                    <DialogDescription>
                        Izmenite datum, vreme ili podatke klijenta za ovaj termin.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 md:grid-cols-2 mt-4">
                    {/* Calendar */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <CalendarIcon className="w-4 h-4" /> Datum
                        </Label>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={srLatn}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            className="rounded-md border border-border w-full flex justify-center"
                        />
                    </div>

                    {/* Time slots */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" /> Vreme
                        </Label>

                        {!selectedDate ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed rounded-lg bg-secondary/20 h-[300px]">
                                <CalendarIcon className="w-8 h-8 mb-3 opacity-20" />
                                <p className="text-sm">Prvo izaberi datum</p>
                            </div>
                        ) : isCheckingSlots ? (
                            <div className="flex flex-col items-center justify-center py-12 border rounded-lg h-[300px]">
                                <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                                <p className="text-sm text-muted-foreground">Provera dostupnosti...</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[300px] border rounded-lg p-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {availableSlots.map(({ time, state }) => {
                                        const isSelected = selectedTime === time;
                                        const isDisabled = state === "FULL";
                                        return (
                                            <button
                                                key={time}
                                                type="button"
                                                disabled={isDisabled && !isSelected}
                                                onClick={() => setSelectedTime(time)}
                                                className={cn(
                                                    "py-2 px-3 text-sm rounded-md border transition-all duration-200",
                                                    getSlotColor(state, isSelected)
                                                )}
                                                title={state === "CURRENT" ? "Trenutno vreme termina" : state === "ONLINE_FULL_WALKIN_AVAILABLE" ? "Slobodno (samo Walk-in/Admin)" : state === "FULL" ? "Zauzeto" : "Slobodno"}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>

                {/* Customer Details */}
                <div className="grid gap-4 sm:grid-cols-2 mt-2 pt-6 border-t border-border">
                    <div className="space-y-1.5">
                        <Label>Usluga *</Label>
                        <Select value={serviceType} onValueChange={setServiceType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Izaberi uslugu" />
                            </SelectTrigger>
                            <SelectContent>
                                {SERVICES.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Ime klijenta *</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ime i prezime" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Telefon *</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06X XXX XXXX" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Napomena / Beleška</Label>
                        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Bez napomene" />
                    </div>
                </div>

                {/* Submit */}
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Otkaži
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedDate || !selectedTime || !name || !phone || !serviceType || isSubmitting || isCheckingSlots}
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Sačuvaj izmene
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditAppointmentDialog;
