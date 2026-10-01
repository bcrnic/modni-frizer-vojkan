import { addMinutes, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { SlotState, AppointmentSource } from '@/integrations/supabase/types';

// Re-export SlotAvailability type for components
export type { SlotState } from '@/integrations/supabase/types';

export interface SlotAvailability {
  state: SlotState;
  online_count: number;
  total_count: number;
  max_online: number;
  total_capacity: number;
  holiday?: boolean;
}

export interface BookingResult {
  success: boolean;
  error?: string;
  appointment_id?: string;
  status?: SlotAvailability;
}

export interface AppointmentData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: string;
  startTime: Date;
  notes?: string;
  source?: AppointmentSource;
}

export interface HolidayData {
  id: string;
  holiday_date: string;
  reason: string | null;
}

const DEFAULT_APPOINTMENT_DURATION = 60; // minutes

/**
 * Availability of several slots in one request. Slots whose availability is
 * unknown (request failed) are missing from the result and must be treated
 * as not bookable.
 */
export const getSlotsAvailability = async (
  starts: { key: string; start: Date }[],
  options: { duration?: number; excludeId?: string } = {}
): Promise<Record<string, SlotAvailability>> => {
  if (!supabase || starts.length === 0) return {};

  const { data, error } = await supabase.rpc('get_slots_availability', {
    p_starts: starts.map(({ start }) => start.toISOString()),
    p_duration_minutes: options.duration ?? DEFAULT_APPOINTMENT_DURATION,
    p_exclude_id: options.excludeId ?? null,
  });

  if (error) {
    console.error('Error checking slot availability:', error);
    throw error;
  }

  const byInstant = new Map<number, SlotAvailability>();
  for (const row of (data ?? []) as { start: string; availability: SlotAvailability }[]) {
    byInstant.set(new Date(row.start).getTime(), row.availability);
  }

  const result: Record<string, SlotAvailability> = {};
  for (const { key, start } of starts) {
    const availability = byInstant.get(start.getTime());
    if (availability) result[key] = availability;
  }
  return result;
};

export const isCurrentUserAdmin = async (): Promise<boolean> => {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
  return data === true;
};

export const createAppointment = async (
  appointment: AppointmentData
): Promise<BookingResult> => {
  if (!supabase) {
    return {
      success: false,
      error: 'Booking system not configured'
    };
  }

  const endTime = addMinutes(appointment.startTime, DEFAULT_APPOINTMENT_DURATION);

  const { data, error } = await supabase.rpc('create_appointment', {
    p_customer_name: appointment.customerName,
    p_customer_phone: appointment.customerPhone,
    p_customer_email: appointment.customerEmail || null,
    p_start_time: appointment.startTime.toISOString(),
    p_end_time: endTime.toISOString(),
    p_service_type: appointment.serviceType,
    p_notes: appointment.notes ?? null,
    p_source: appointment.source || 'online'
  });

  if (error) {
    console.error('Error creating appointment:', error);
    return {
      success: false,
      error: error.message
    };
  }

  const result = data as BookingResult | null;

  if (!result) {
    return { success: false, error: 'Zakazivanje nije uspelo. Pokušajte ponovo.' };
  }

  if (result.success && result.appointment_id && (appointment.source ?? 'online') === 'online') {
    // Best-effort email notification (non-blocking). Booking must succeed even if email fails.
    void sendBookingNotification(result.appointment_id);
  }

  return result;
};

// ─── Edit appointment ─────────────────────────────────────────────────────────

export const editAppointment = async (
  appointmentId: string,
  appointment: AppointmentData,
  status: string
): Promise<BookingResult> => {
  if (!supabase) {
    return { success: false, error: 'Booking system not configured' };
  }

  const endTime = addMinutes(appointment.startTime, DEFAULT_APPOINTMENT_DURATION);

  const { data, error } = await supabase.rpc('update_appointment', {
    p_appointment_id: appointmentId,
    p_start_time: appointment.startTime.toISOString(),
    p_end_time: endTime.toISOString(),
    p_service_type: appointment.serviceType,
    p_customer_name: appointment.customerName,
    p_customer_phone: appointment.customerPhone,
    p_notes: appointment.notes ?? null,
    p_status: status
  });

  if (error) {
    console.error('Error updating appointment:', error);
    return { success: false, error: error.message };
  }

  return data as BookingResult;
};

// ─── Holidays Management ──────────────────────────────────────────────────────

export const getHolidays = async (): Promise<HolidayData[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('salon_holidays')
    .select('*')
    .order('holiday_date', { ascending: true });

  if (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
  return data as HolidayData[];
};

export const addHoliday = async (date: Date, reason?: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('salon_holidays')
    .insert([{ holiday_date: format(date, 'yyyy-MM-dd'), reason }]);

  if (error) {
    console.error('Error adding holiday:', error);
    return false;
  }
  return true;
};

export const deleteHoliday = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('salon_holidays')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting holiday:', error);
    return false;
  }
  return true;
};

async function sendBookingNotification(appointmentId: string): Promise<void> {
  if (!supabase) return;

  try {
    // The function loads everything it sends from the database itself.
    await supabase.functions.invoke('send-booking-notification', {
      body: { appointmentId },
    });
  } catch (err) {
    // Non-critical – booking was successful, email is best-effort
    console.warn('Email notification failed (non-critical):', err);
  }
}

export const getSlotStateLabel = (state: SlotState): string => {
  switch (state) {
    case 'ONLINE_AVAILABLE':
      return 'Dostupno za online zakazivanje';
    case 'ONLINE_FULL_WALKIN_AVAILABLE':
      return 'Online zakazivanje nije dostupno - možete doći lično';
    case 'FULL':
      return 'Nema slobodnih mesta';
    default:
      return 'Proverite dostupnost';
  }
};

export const getSlotStateColor = (state: SlotState): string => {
  switch (state) {
    case 'ONLINE_AVAILABLE':
      return 'text-green-500';
    case 'ONLINE_FULL_WALKIN_AVAILABLE':
      return 'text-yellow-500';
    case 'FULL':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
};
