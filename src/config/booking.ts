/**
 * Online booking on/off. While it is off, the booking buttons become
 * "Pozovite nas" links and the booking dialog is never loaded.
 * Keep it in sync with salon_settings.online_booking_enabled in the database
 * (see supabase/migrations/20261103120000_online_booking_switch.sql).
 */
export const ONLINE_BOOKING_ENABLED = false;
