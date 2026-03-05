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

  const result = data as { success: boolean; error?: string; status: SlotAvailability };

  // Fire-and-forget email: only on successful online bookings
  if (result.success && appointment.source !== 'walkin') {
    sendBookingNotification(appointment);
  }

  return result;
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
