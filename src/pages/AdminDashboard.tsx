import { useState, useEffect, useCallback, useRef } from "react";
import { format, isToday, isTomorrow, parseISO, addDays } from "date-fns";
import { srLatn } from "date-fns/locale";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  LogOut, CalendarDays, Clock, User, Phone, Mail, Scissors,
  FileText, CheckCircle, XCircle, Loader2, RefreshCw, Plus, Wifi, WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import WalkinBooking from "@/components/admin/WalkinBooking";
import EditAppointmentDialog from "@/components/admin/EditAppointmentDialog";
import { getHolidays, addHoliday, deleteHoliday, type HolidayData } from "@/services/booking";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  start_time: string;
  end_time: string;
  service_type: string;
  notes: string | null;
  status: "confirmed" | "cancelled";
  source: "online" | "walkin";
  created_at: string;
}

type StatusFilter = "all" | "confirmed" | "cancelled";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Potvrđen",
  cancelled: "Otkazan",
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-500/10 text-green-600 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
};

const SOURCE_LABELS: Record<string, string> = {
  online: "Online",
  walkin: "Walk-in / Poziv",
};

function getDateLabel(isoString: string): string {
  const d = parseISO(isoString);
  if (isToday(d)) return "Danas";
  if (isTomorrow(d)) return "Sutra";
  return format(d, "EEEE, d. MMM", { locale: srLatn });
}

function getTimeFromISO(isoString: string): string {
  return format(parseISO(isoString), "HH:mm");
}

// ─── Component ───────────────────────────────────────────────────────────────

interface AdminDashboardProps {
  session: Session;
}

const AdminDashboard = ({ session: _session }: AdminDashboardProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Edit State
  const [editAppointmentItem, setEditAppointmentItem] = useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Holidays State
  const [holidays, setHolidays] = useState<HolidayData[]>([]);
  const [holidayDate, setHolidayDate] = useState<Date | undefined>(undefined);
  const [holidayReason, setHolidayReason] = useState("");
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);

  const [isLive, setIsLive] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAppointments = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      let q = supabase
        .from("appointments")
        .select("*")
        .order("start_time", { ascending: true });

      if (selectedDate) {
        const day = format(selectedDate, "yyyy-MM-dd");
        const nextDay = format(addDays(selectedDate, 1), "yyyy-MM-dd");
        q = q.gte("start_time", `${day}T00:00:00`).lt("start_time", `${nextDay}T00:00:00`);
      }

      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter);
      }

      const { data, error } = await q;
      if (error) throw error;
      setAppointments((data as Appointment[]) ?? []);
    } catch (err) {
      console.error(err);
      toast({ title: "Greška", description: "Nije moguće učitati termine.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, statusFilter]);

  const fetchHolidaysData = useCallback(async () => {
    const data = await getHolidays();
    setHolidays(data);
  }, []);

  // ── Real-time subscription ─────────────────────────────────────────────────

  useEffect(() => {
    if (!supabase) return;

    // Clean up previous channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel("appointments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => {
          // Re-fetch whenever any change happens
          fetchAppointments();
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      setIsLive(false);
    };
  }, [fetchAppointments]);

  // Initial load
  useEffect(() => {
    fetchAppointments();
    fetchHolidaysData();
  }, [fetchAppointments, fetchHolidaysData]);

  // ── Auth logout ────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    // Admin.tsx detects session=null and shows login
  };

  // ── Update status ──────────────────────────────────────────────────────────

  const updateStatus = async (id: string, newStatus: string) => {
    if (!supabase) return;
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Status ažuriran", description: `Termin je ${STATUS_LABELS[newStatus]?.toLowerCase()}.` });
      // Real-time will automatically refresh - no need to do it manually
    } catch (err) {
      console.error(err);
      toast({ title: "Greška", description: "Nije moguće ažurirati status.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddHoliday = async () => {
    if (!holidayDate) return;
    setIsAddingHoliday(true);
    try {
      const success = await addHoliday(holidayDate, holidayReason);
      if (success) {
        toast({ title: "Slobodan dan dodat", description: "Termini na ovaj dan su sada blokirani." });
        setHolidayDate(undefined);
        setHolidayReason("");
        await fetchHolidaysData();
      } else {
        throw new Error("Failed to add");
      }
    } catch (err) {
      toast({ title: "Greška", description: "Nije moguće dodati slobodan dan (možda već postoji).", variant: "destructive" });
    } finally {
      setIsAddingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      const success = await deleteHoliday(id);
      if (success) {
        toast({ title: "Slobodan dan obrisan", description: "Termini su sada ponovo otvoreni za ovaj dan." });
        await fetchHolidaysData();
      }
    } catch (err) {
      toast({ title: "Greška", description: "Nije moguće obrisati slobodan dan.", variant: "destructive" });
    }
  };

  // ── Computed statistics ────────────────────────────────────────────────────
  const activeAppointments = appointments.filter(
    (apt: Appointment) => apt.status === "confirmed"
  );
  const activeCount = activeAppointments.length;
  const onlineCount = activeAppointments.filter(
    (apt: Appointment) => apt.source === "online"
  ).length;
  const walkinCount = activeAppointments.filter(
    (apt: Appointment) => apt.source === "walkin"
  ).length;


  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scissors className="w-5 h-5 text-primary" />
            <div>
              <h1 className="font-heading text-xl leading-none">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Modni Frizer Vojkan</p>
            </div>
            {/* Real-time indicator */}
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ml-4",
                isLive
                  ? "text-green-600 border-green-500/30 bg-green-500/10"
                  : "text-muted-foreground border-border"
              )}
            >
              {isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isLive ? "Uživo" : "Offline"}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Odjavi se
          </Button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="appointments">
          <TabsList className="mb-8">
            <TabsTrigger value="appointments" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Termini
            </TabsTrigger>
            <TabsTrigger value="add" className="gap-2">
              <Plus className="w-4 h-4" />
              Dodaj termin
            </TabsTrigger>
            <TabsTrigger value="holidays" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Neradni dani
            </TabsTrigger>
          </TabsList>

          {/* TAB: Appointments */}
          <TabsContent value="appointments">
            <div className="grid lg:grid-cols-[280px_1fr] gap-8">

              {/* Sidebar */}
              <aside className="space-y-4">
                {/* Calendar */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2 text-sm">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    Datum
                  </h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={srLatn}
                    className="rounded-md border border-border"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    Prikaži sve datume
                  </Button>
                </div>

                {/* Filter */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-3 text-sm">Status</h3>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Svi statusi</SelectItem>
                      <SelectItem value="confirmed">Potvrđeni</SelectItem>
                      <SelectItem value="cancelled">Otkazani</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Statistics */}
                <div className="bg-card border border-border rounded-lg p-4 space-y-2.5">
                  <h3 className="font-medium text-sm">Statistika</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ukupno aktivnih:</span>
                    <span className="font-semibold">{activeCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Online:</span>
                    <span className="font-medium text-blue-500">{onlineCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Walk-in / Poziv:</span>
                    <span className="font-medium text-primary">{walkinCount}</span>
                  </div>
                </div>
              </aside>

              {/* Appointments list */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-2xl">
                    {selectedDate
                      ? `${format(selectedDate, "d. MMMM yyyy.", { locale: srLatn })}`
                      : "Svi termini"}
                  </h2>
                  <Button variant="outline" size="sm" onClick={fetchAppointments}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Osveži
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-24 text-muted-foreground">
                    <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Nema termina za prikaz</p>
                    <p className="text-sm mt-1">Izaberi drugi datum ili promeni filter</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          "bg-card border border-border rounded-lg p-5 transition-all hover:border-primary/30",
                          apt.status === "cancelled" && "opacity-50"
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          {/* Info */}
                          <div className="space-y-3 flex-1 min-w-0">
                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={cn(
                                  "text-xs px-2.5 py-0.5 rounded-full border font-medium",
                                  STATUS_COLORS[apt.status]
                                )}
                              >
                                {STATUS_LABELS[apt.status]}
                              </span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full border border-primary/30 text-primary">
                                {SOURCE_LABELS[apt.source]}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {getDateLabel(apt.start_time)}
                              </span>
                            </div>

                            {/* Details */}
                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="font-semibold">
                                  {getTimeFromISO(apt.start_time)} – {getTimeFromISO(apt.end_time)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Scissors className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>{apt.service_type}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span>{apt.customer_name}</span>
                              </div>
                              {apt.customer_phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <a
                                    href={`tel:${apt.customer_phone}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {apt.customer_phone}
                                  </a>
                                </div>
                              )}
                              {apt.customer_email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <a
                                    href={`mailto:${apt.customer_email}`}
                                    className="hover:text-primary transition-colors truncate"
                                  >
                                    {apt.customer_email}
                                  </a>
                                </div>
                              )}
                              {apt.notes && (
                                <div className="flex items-start gap-2 text-sm sm:col-span-2">
                                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground">{apt.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          {apt.status !== "cancelled" && (
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-500/30 hover:bg-green-500/10"
                                onClick={() => updateStatus(apt.id, "confirmed")}
                                disabled={updatingId === apt.id || apt.status === "confirmed"}
                              >
                                {updatingId === apt.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Potvrdi
                                  </>
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="text-primary border-primary/30 hover:bg-primary/10"
                                onClick={() => {
                                  setEditAppointmentItem(apt);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                {<Scissors className="w-4 h-4 mr-1" />}
                                Uredi
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                                    disabled={updatingId === apt.id}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Otkaži
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Otkazati termin?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Da li ste sigurni da želite da otkažete termin za{" "}
                                      <strong>{apt.customer_name}</strong> (
                                      {getTimeFromISO(apt.start_time)}h – {apt.service_type})?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Ne</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => updateStatus(apt.id, "cancelled")}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Da, otkaži
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB: Add Appointment */}
          <TabsContent value="add">
            <div className="max-w-2xl">
              <div className="mb-6">
                <h2 className="font-heading text-2xl mb-1">Dodaj termin</h2>
                <p className="text-sm text-muted-foreground">
                  Ručno unesi walk-in klijenta ili upit primljen telefonom. Termin se odmah vidi u listi.
                </p>
              </div>
              <WalkinBooking onSuccess={fetchAppointments} />
            </div>
          </TabsContent>

          {/* TAB: Holidays (Neradni dani) */}
          <TabsContent value="holidays">
            <div className="grid lg:grid-cols-[350px_1fr] gap-8">
              {/* Add Holiday Form */}
              <aside className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                  <div>
                    <h3 className="font-medium text-lg mb-1">Blokiraj dan</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Izabrani dan će biti potpuno uklonjen iz kalendara za online zakazivanje.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Izaberi datum *</label>
                    <Calendar
                      mode="single"
                      selected={holidayDate}
                      onSelect={setHolidayDate}
                      locale={srLatn}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md border border-border w-full flex justify-center"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Razlog (Opciono)</label>
                    <input
                      type="text"
                      value={holidayReason}
                      onChange={(e) => setHolidayReason(e.target.value)}
                      placeholder="Npr. Državni praznik, Godišnji odmor..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <Button
                    className="w-full mt-2"
                    onClick={handleAddHoliday}
                    disabled={!holidayDate || isAddingHoliday}
                  >
                    {isAddingHoliday ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Blokiraj izabrani dan
                  </Button>
                </div>
              </aside>

              {/* Holidays List */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-heading text-xl mb-6">Lista neradnih dana</h2>

                {holidays.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Trenutno nema blokiranih dana u kalendaru.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {holidays.map((holiday) => (
                      <div key={holiday.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
                        <div>
                          <p className="font-medium capitalize">{format(parseISO(holiday.holiday_date), "EEEE, d. MMMM yyyy.", { locale: srLatn })}</p>
                          {holiday.reason && (
                            <p className="text-sm text-muted-foreground mt-1">{holiday.reason}</p>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          title="Obriši"
                        >
                          <XCircle className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <EditAppointmentDialog
        appointment={editAppointmentItem}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={fetchAppointments}
      />
    </div>
  );
};

export default AdminDashboard;
