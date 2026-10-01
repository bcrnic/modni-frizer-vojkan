import { SATURDAY_TIME_SLOTS, TIME_SLOTS } from "@/config/constants";

/**
 * Client-side mirror of the rules enforced by the database
 * (validate_appointment_input / create_appointment). The database is the
 * source of truth; these only give the visitor instant feedback.
 */

export const SALON_TIMEZONE = "Europe/Belgrade";
export const MAX_DAYS_AHEAD = 60;

export const LIMITS = {
  nameMin: 2,
  nameMax: 100,
  phoneMax: 25,
  emailMax: 254,
  notesMax: 500,
} as const;

const PHONE_RE = /^\+?[0-9 ()/.-]{6,25}$/;
const EMAIL_RE = /^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/;

export interface CustomerInput {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export type CustomerErrors = Partial<Record<keyof CustomerInput, string>>;

export function validateCustomer(input: CustomerInput): CustomerErrors {
  const errors: CustomerErrors = {};
  const name = input.name.trim();
  const phone = input.phone.trim();
  const email = input.email?.trim() ?? "";
  const notes = input.notes?.trim() ?? "";

  if (name.length < LIMITS.nameMin || name.length > LIMITS.nameMax) {
    errors.name = `Ime mora imati između ${LIMITS.nameMin} i ${LIMITS.nameMax} karaktera.`;
  }

  const digits = phone.replace(/\D/g, "");
  if (!PHONE_RE.test(phone) || digits.length < 6 || digits.length > 15) {
    errors.phone = "Unesite ispravan broj telefona.";
  }

  if (email && (email.length > LIMITS.emailMax || !EMAIL_RE.test(email))) {
    errors.email = "Unesite ispravnu email adresu.";
  }

  if (notes.length > LIMITS.notesMax) {
    errors.notes = `Napomena može imati najviše ${LIMITS.notesMax} karaktera.`;
  }

  return errors;
}

/** Offset of the salon's timezone from UTC at the given instant, in minutes. */
function salonOffsetMinutes(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SALON_TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/**
 * The instant at which it is `time` ("HH:mm") on the calendar day of `day`
 * in the salon's timezone, regardless of the visitor's own timezone.
 * Only the year/month/day of `day` (as picked in the calendar) are used.
 */
export function salonSlotToDate(day: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const naiveUtc = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
  // Two passes handle the DST switch correctly.
  let instant = naiveUtc - salonOffsetMinutes(new Date(naiveUtc)) * 60000;
  instant = naiveUtc - salonOffsetMinutes(new Date(instant)) * 60000;
  return new Date(instant);
}

export function getTimeSlotsForDay(day: Date): string[] {
  if (day.getDay() === 0) return [];
  return day.getDay() === 6 ? SATURDAY_TIME_SLOTS : TIME_SLOTS;
}

/** Slots of `day` that have not started yet. */
export function getUpcomingTimeSlots(day: Date, now: Date = new Date()): string[] {
  return getTimeSlotsForDay(day).filter((time) => salonSlotToDate(day, time) > now);
}
