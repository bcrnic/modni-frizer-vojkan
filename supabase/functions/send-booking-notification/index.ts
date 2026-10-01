// Sends the "new booking" emails for an appointment that was just created.
//
// The caller only passes the appointment id. Everything that goes into the
// emails is read from the database with the service role, so this endpoint
// cannot be used to send arbitrary content to arbitrary addresses. Each
// appointment is notified at most once, and only shortly after it was created.
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const SALON_EMAIL = Deno.env.get("SALON_EMAIL") || "salon@example.com";
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "noreply@example.com";
const SALON_NAME = "Modni Frizer Vojkan";
const SALON_ADDRESS = Deno.env.get("SALON_ADDRESS") || "Uspenska 1, ulaz iz Pavla Papa, Novi Sad";
const SALON_PHONE = Deno.env.get("SALON_PHONE") || "+381 62 144 5958";
const SALON_TIMEZONE = "Europe/Belgrade";
const NOTIFY_WINDOW_MS = 10 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  start_time: string;
  service_type: string;
  notes: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function ownerEmailHtml(a: Appointment, date: string, time: string): string {
  const e = escapeHtml;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        Novi Zakazani Termin
      </h1>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #555; margin-top: 0;">Detalji termina</h2>
        <p><strong>Datum:</strong> ${e(date)}</p>
        <p><strong>Vreme:</strong> ${e(time)}h</p>
        <p><strong>Usluga:</strong> ${e(a.service_type)}</p>
      </div>
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #555; margin-top: 0;">Podaci o klijentu</h2>
        <p><strong>Ime:</strong> ${e(a.customer_name)}</p>
        <p><strong>Telefon:</strong> ${e(a.customer_phone)}</p>
        ${a.customer_email ? `<p><strong>Email:</strong> ${e(a.customer_email)}</p>` : ""}
        ${a.notes ? `<p><strong>Napomena:</strong> ${e(a.notes)}</p>` : ""}
      </div>
      <p style="color: #888; font-size: 12px; margin-top: 30px;">
        Ova poruka je automatski generisana od strane sistema za zakazivanje.
      </p>
    </div>
  `;
}

function customerEmailHtml(a: Appointment, date: string, time: string): string {
  const e = escapeHtml;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
        Vaš termin je uspešno zakazan!
      </h1>
      <p>Poštovani/a ${e(a.customer_name)},</p>
      <p>Hvala Vam što ste zakazali termin kod nas. Ovo su detalji Vašeg termina:</p>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>📅 Datum:</strong> ${e(date)}</p>
        <p><strong>🕐 Vreme:</strong> ${e(time)}h</p>
        <p><strong>💇 Usluga:</strong> ${e(a.service_type)}</p>
      </div>
      <p>Ako imate bilo kakvih pitanja ili želite da promenite termin, slobodno nas kontaktirajte telefonom.</p>
      <p>Radujemo se Vašoj poseti!</p>
      <p style="margin-top: 30px;">
        <strong>${e(SALON_NAME)}</strong><br>
        📍 ${e(SALON_ADDRESS)}<br>
        📞 ${e(SALON_PHONE)}
      </p>
      <p style="color: #888; font-size: 12px; margin-top: 30px;">
        Ova poruka je automatski generisana. Molimo ne odgovarajte na ovaj email.
      </p>
    </div>
  `;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => null);
    const appointmentId = body?.appointmentId;
    if (typeof appointmentId !== "string" || !UUID_RE.test(appointmentId)) {
      return json({ error: "Invalid request" }, 400);
    }

    // Claim the notification atomically: only a fresh, online, not yet notified
    // appointment matches, so repeated calls for the same id send nothing.
    const createdAfter = new Date(Date.now() - NOTIFY_WINDOW_MS).toISOString();
    const { data: appointment, error } = await supabase
      .from("appointments")
      .update({ notification_sent_at: new Date().toISOString() })
      .eq("id", appointmentId)
      .eq("source", "online")
      .is("notification_sent_at", null)
      .gte("created_at", createdAfter)
      .select("id, customer_name, customer_phone, customer_email, start_time, service_type, notes")
      .maybeSingle<Appointment>();

    if (error) throw error;
    if (!appointment) {
      return json({ error: "Nothing to notify" }, 404);
    }

    const start = new Date(appointment.start_time);
    const date = start.toLocaleDateString("sr-Latn-RS", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: SALON_TIMEZONE,
    });
    const time = start.toLocaleTimeString("sr-Latn-RS", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: SALON_TIMEZONE,
    });

    const owner = await resend.emails.send({
      from: `${SALON_NAME} <${SENDER_EMAIL}>`,
      to: [SALON_EMAIL],
      subject: `Novi termin: ${appointment.customer_name} - ${appointment.service_type}`,
      html: ownerEmailHtml(appointment, date, time),
    });
    if (owner.error) console.error("Owner notification failed:", owner.error);

    if (appointment.customer_email) {
      const customer = await resend.emails.send({
        from: `${SALON_NAME} <${SENDER_EMAIL}>`,
        to: [appointment.customer_email],
        subject: `Potvrda termina - ${SALON_NAME}`,
        html: customerEmailHtml(appointment, date, time),
      });
      if (customer.error) console.error("Customer confirmation failed:", customer.error);
    }

    return json({ success: true });
  } catch (error: unknown) {
    console.error("Error in send-booking-notification:", error);
    return json({ error: "Internal error" }, 500);
  }
});
