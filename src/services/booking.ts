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

export const checkSlotAvailability = async (
  startTime: Date,
  duration: number = DEFAULT_APPOINTMENT_DURATION
): Promise<SlotAvailability | null> => {
  if (!supabase) return null;

  const endTime = addMinutes(startTime, duration);

  const { data, error } = await supabase.rpc('check_slot_availability', {
    check_start: format(startTime, "yyyy-MM-dd'T'HH:mm:ssxxx"),
    check_end: format(endTime, "yyyy-MM-dd'T'HH:mm:ssxxx")
  });

  if (error) {
    console.error('Error checking slot availability:', error);
    return null;
  }

  return data as SlotAvailability;
};

export const createAppointment = async (
  appointment: AppointmentData
): Promise<{ success: boolean; error?: string; status?: SlotAvailability }> => {
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
    p_start_time: format(appointment.startTime, "yyyy-MM-dd'T'HH:mm:ssxxx"),
    p_end_time: format(endTime, "yyyy-MM-dd'T'HH:mm:ssxxx"),
    p_service_type: appointment.serviceType,
    p_notes: appointment.notes,
    p_source: appointment.source || 'online'
  });

  if (error) {
    console.error('Error creating appointment:', error);
    return {
      success: false,
      error: error.message
    };
  }


};

// ─── Edit appointment ─────────────────────────────────────────────────────────

export const editAppointment = async (
  appointmentId: string,
  appointment: AppointmentData,
  status: string
): Promise<{ success: boolean; error?: string; status?: SlotAvailability }> => {
  if (!supabase) {
    return { success: false, error: 'Booking system not configured' };
  }

  const endTime = addMinutes(appointment.startTime, DEFAULT_APPOINTMENT_DURATION);

  const { data, error } = await supabase.rpc('update_appointment', {
    p_appointment_id: appointmentId,
    p_start_time: format(appointment.startTime, "yyyy-MM-dd'T'HH:mm:ssxxx"),
    p_end_time: format(endTime, "yyyy-MM-dd'T'HH:mm:ssxxx"),
    p_service_type: appointment.serviceType,
    p_customer_name: appointment.customerName,
    p_customer_phone: appointment.customerPhone,
    p_notes: appointment.notes,
    p_status: status
  });

  if (error) {
    console.error('Error updating appointment:', error);
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string; status: SlotAvailability };
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

const sendBookingNotification = async (appointment: AppointmentData): Promise<void> => {
  if (!supabase) return;

  try {
    await supabase.functions.invoke('send-booking-notification', {
      body: {
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        customerEmail: appointment.customerEmail,
        appointmentDate: appointment.startTime.toISOString(),
        appointmentTime: format(appointment.startTime, 'HH:mm'),
        serviceType: appointment.serviceType,
        notes: appointment.notes,
      },
    });
  } catch (err) {
    // Non-critical – booking was successful, email is best-effort
    console.warn('Email notification failed (non-critical):', err);
  }
};

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
