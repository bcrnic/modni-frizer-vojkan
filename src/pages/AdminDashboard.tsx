import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isToday, isTomorrow, isPast, startOfDay } from "date-fns";
import { srLatn } from "date-fns/locale";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { toast } from "@/hooks/use-toast";
import {
  LogOut,
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  Scissors,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  notes: string | null;
  status: string;
  created_at: string;
}

type StatusFilter = "all" | "pending" | "confirmed" | "cancelled";

const statusLabels: Record<string, string> = {
  pending: "Na čekanju",
  confirmed: "Potvrđen",
  cancelled: "Otkazan",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
};

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAppointments = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (selectedDate) {
        query = query.eq("appointment_date", format(selectedDate, "yyyy-MM-dd"));
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Greška",
        description: "Nije moguće učitati termine.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, statusFilter]);

  useEffect(() => {
    // Check auth
    if (!isSupabaseConfigured || !supabase) {
      navigate("/admin/login");
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/admin/login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const updateStatus = async (id: string, newStatus: string) => {
    if (!supabase) return;

    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status ažuriran",
        description: `Termin je ${statusLabels[newStatus].toLowerCase()}.`,
      });

      fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Greška",
        description: "Nije moguće ažurirati status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Danas";
    if (isTomorrow(date)) return "Sutra";
    return format(date, "EEEE, d. MMM", { locale: srLatn });
  };

  const todayCount = appointments.filter(
    (a) => a.status !== "cancelled"
  ).length;

  const pendingCount = appointments.filter(
    (a) => a.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Modni Frizer Vojkan</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Odjavi se
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar - Calendar & Filters */}
          <div className="space-y-6">
            {/* Date picker */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Izaberite datum
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
                className="w-full mt-2"
                onClick={() => setSelectedDate(undefined)}
              >
                Prikaži sve datume
              </Button>
            </div>

            {/* Status filter */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium mb-3">Status</h3>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  <SelectItem value="pending">Na čekanju</SelectItem>
                  <SelectItem value="confirmed">Potvrđeni</SelectItem>
                  <SelectItem value="cancelled">Otkazani</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Statistika</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ukupno termina:</span>
                <span className="font-medium">{todayCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Na čekanju:</span>
                <span className="font-medium text-yellow-600">{pendingCount}</span>
              </div>
            </div>
          </div>

          {/* Main content - Appointments list */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl">
                {selectedDate
                  ? `Termini - ${format(selectedDate, "d. MMMM yyyy.", { locale: srLatn })}`
                  : "Svi termini"}
              </h2>
              <Button variant="outline" size="sm" onClick={fetchAppointments}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Osveži
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Nema termina za prikaz</p>
                <p className="text-sm mt-1">Izaberite drugi datum ili promenite filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      "bg-card border border-border rounded-lg p-5 transition-all hover:border-primary/30",
                      apt.status === "cancelled" && "opacity-60"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Appointment info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-full border font-medium",
                              statusColors[apt.status]
                            )}
                          >
                            {statusLabels[apt.status]}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {getDateLabel(apt.appointment_date)}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 mt-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="font-medium">{apt.appointment_time.slice(0, 5)}h</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Scissors className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{apt.service_type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span>{apt.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <a
                              href={`tel:${apt.customer_phone}`}
                              className="hover:text-primary transition-colors"
                            >
                              {apt.customer_phone}
                            </a>
                          </div>
                          {apt.customer_email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <a
                                href={`mailto:${apt.customer_email}`}
                                className="hover:text-primary transition-colors"
                              >
                                {apt.customer_email}
                              </a>
                            </div>
                          )}
                          {apt.notes && (
                            <div className="flex items-center gap-2 text-sm sm:col-span-2">
                              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground">{apt.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {apt.status !== "cancelled" && (
                        <div className="flex gap-2 flex-shrink-0">
                          {apt.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-500/30 hover:bg-green-500/10"
                              onClick={() => updateStatus(apt.id, "confirmed")}
                              disabled={updatingId === apt.id}
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
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-500/30 hover:bg-red-500/10"
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
                                  <strong>{apt.customer_name}</strong> ({apt.appointment_time.slice(0, 5)}h - {apt.service_type})?
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
      </div>
    </div>
  );
};

export default AdminDashboard;
