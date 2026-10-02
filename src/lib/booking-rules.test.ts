import { describe, it, expect } from "vitest";
import {
  getTimeSlotsForDay,
  getUpcomingTimeSlots,
  salonSlotToDate,
  validateCustomer,
} from "./booking-rules";

const valid = { name: "Ana Anić", phone: "+381 60 123 4567" };

describe("validateCustomer", () => {
  it("accepts a normal booking", () => {
    expect(validateCustomer(valid)).toEqual({});
    expect(validateCustomer({ ...valid, phone: "060/123-4567", email: "ana@example.com" })).toEqual({});
  });

  it("rejects bad names", () => {
    expect(validateCustomer({ ...valid, name: " A " }).name).toBeDefined();
    expect(validateCustomer({ ...valid, name: "x".repeat(101) }).name).toBeDefined();
  });

  it("rejects bad phone numbers", () => {
    for (const phone of ["", "abc", "12345", "+381 60 abc", "1".repeat(16)]) {
      expect(validateCustomer({ ...valid, phone }).phone, phone).toBeDefined();
    }
  });

  it("validates optional email and notes", () => {
    expect(validateCustomer({ ...valid, email: "" }).email).toBeUndefined();
    expect(validateCustomer({ ...valid, email: "not-an-email" }).email).toBeDefined();
    expect(validateCustomer({ ...valid, email: "<script>@x.rs" }).email).toBeDefined();
    expect(validateCustomer({ ...valid, notes: "x".repeat(501) }).notes).toBeDefined();
  });
});

describe("salonSlotToDate", () => {
  // Calendar days are created the way react-day-picker does: local midnight.
  it("uses Belgrade winter time (UTC+1)", () => {
    expect(salonSlotToDate(new Date(2026, 0, 15), "11:00").toISOString()).toBe("2026-01-15T10:00:00.000Z");
  });

  it("uses Belgrade summer time (UTC+2)", () => {
    expect(salonSlotToDate(new Date(2026, 6, 15), "11:00").toISOString()).toBe("2026-07-15T09:00:00.000Z");
  });

  it("handles the days of the DST switch", () => {
    // 2026-03-29 and 2026-10-25 are the switch days in Europe.
    expect(salonSlotToDate(new Date(2026, 2, 29), "08:00").toISOString()).toBe("2026-03-29T06:00:00.000Z");
    expect(salonSlotToDate(new Date(2026, 9, 25), "08:00").toISOString()).toBe("2026-10-25T07:00:00.000Z");
  });

  it("returns salon midnight for day boundaries", () => {
    expect(salonSlotToDate(new Date(2026, 6, 15), "00:00").toISOString()).toBe("2026-07-14T22:00:00.000Z");
  });
});

describe("time slots", () => {
  it("has no slots on Sunday and the Saturday schedule on Saturday", () => {
    expect(getTimeSlotsForDay(new Date(2026, 9, 4))).toEqual([]); // Sunday
    expect(getTimeSlotsForDay(new Date(2026, 9, 3))[0]).toBe("08:00"); // Saturday
    expect(getTimeSlotsForDay(new Date(2026, 9, 5))[0]).toBe("11:00"); // Monday
  });

  it("hides slots that already started", () => {
    const monday = new Date(2026, 9, 5);
    const now = salonSlotToDate(monday, "15:10");
    const upcoming = getUpcomingTimeSlots(monday, now);
    expect(upcoming[0]).toBe("15:30");
    expect(upcoming).not.toContain("15:00");
    expect(getUpcomingTimeSlots(monday, salonSlotToDate(monday, "18:00"))).toEqual([]);
  });
});
