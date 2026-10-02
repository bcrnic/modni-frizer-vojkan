import { describe, it, expect, vi, beforeEach } from "vitest";

const rpc = vi.fn();
const invoke = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: (...args: unknown[]) => rpc(...args), functions: { invoke: (...args: unknown[]) => invoke(...args) } },
  isSupabaseConfigured: true,
}));

const { createAppointment, getSlotsAvailability } = await import("./booking");

const available = { state: "ONLINE_AVAILABLE", online_count: 0, total_count: 0, max_online: 4, total_capacity: 7 };

beforeEach(() => {
  rpc.mockReset();
  invoke.mockReset();
  invoke.mockResolvedValue({ data: null, error: null });
});

describe("getSlotsAvailability", () => {
  it("maps results back to slot keys by instant, regardless of timestamp format", async () => {
    const a = new Date("2026-10-05T09:00:00Z");
    const b = new Date("2026-10-05T09:30:00Z");
    rpc.mockResolvedValue({
      data: [
        { start: "2026-10-05T11:00:00+02:00", availability: available },
        { start: "2026-10-05T09:30:00+00:00", availability: { ...available, state: "FULL" } },
      ],
      error: null,
    });

    const result = await getSlotsAvailability([{ key: "11:00", start: a }, { key: "11:30", start: b }]);

    expect(rpc).toHaveBeenCalledWith("get_slots_availability", {
      p_starts: [a.toISOString(), b.toISOString()],
      p_duration_minutes: 60,
      p_exclude_id: null,
    });
    expect(result["11:00"].state).toBe("ONLINE_AVAILABLE");
    expect(result["11:30"].state).toBe("FULL");
  });

  it("throws when the request fails so callers never show unknown slots as free", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(getSlotsAvailability([{ key: "11:00", start: new Date() }])).rejects.toBeTruthy();
  });
});

describe("createAppointment", () => {
  const booking = {
    customerName: "Ana",
    customerPhone: "0601234567",
    serviceType: "Šišanje",
    startTime: new Date("2026-10-05T09:00:00Z"),
  };

  it("sends only the appointment id to the email function", async () => {
    rpc.mockResolvedValue({ data: { success: true, appointment_id: "abc" }, error: null });
    await createAppointment(booking);
    expect(rpc.mock.calls[0][1]).toMatchObject({
      p_start_time: "2026-10-05T09:00:00.000Z",
      p_end_time: "2026-10-05T10:00:00.000Z",
      p_source: "online",
    });
    expect(invoke).toHaveBeenCalledWith("send-booking-notification", { body: { appointmentId: "abc" } });
  });

  it("does not notify for walk-ins or failed bookings", async () => {
    rpc.mockResolvedValue({ data: { success: true, appointment_id: "abc" }, error: null });
    await createAppointment({ ...booking, source: "walkin" });
    rpc.mockResolvedValue({ data: { success: false, error: "Termin je popunjen." }, error: null });
    const result = await createAppointment(booking);
    expect(result).toEqual({ success: false, error: "Termin je popunjen." });
    expect(invoke).not.toHaveBeenCalled();
  });
});
