import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      appointmentDate,
      appointmentTime,
      serviceType,
      notes,
    }: BookingNotificationRequest = await req.json();

    // Validate required fields
    if (!customerName || !customerPhone || !appointmentDate || !appointmentTime || !serviceType) {
      throw new Error("Missing required fields");
    }

    // Format date for display
    const dateObj = new Date(appointmentDate);
    const formattedDate = dateObj.toLocaleDateString("sr-Latn-RS", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send notification to salon owner
    const ownerEmailResponse = await resend.emails.send({
      from: "Modni Frizer Vojkan <noreply@YOUR-VERIFIED-DOMAIN.com>", // Replace with your verified domain
      to: ["salon@example.com"], // Replace with actual salon email
      subject: `Novi termin: ${customerName} - ${serviceType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
            Novi Zakazani Termin
          </h1>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #555; margin-top: 0;">Detalji termina</h2>
            <p><strong>Datum:</strong> ${formattedDate}</p>
            <p><strong>Vreme:</strong> ${appointmentTime}h</p>
            <p><strong>Usluga:</strong> ${serviceType}</p>
          </div>
          
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #555; margin-top: 0;">Podaci o klijentu</h2>
            <p><strong>Ime:</strong> ${customerName}</p>
            <p><strong>Telefon:</strong> ${customerPhone}</p>
            ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ""}
            ${notes ? `<p><strong>Napomena:</strong> ${notes}</p>` : ""}
          </div>
          
          <p style="color: #888; font-size: 12px; margin-top: 30px;">
            Ova poruka je automatski generisana od strane sistema za zakazivanje.
          </p>
        </div>
      `,
    });

    console.log("Owner notification sent:", ownerEmailResponse);

    // If customer provided email, send confirmation to them too
    let customerEmailResponse = null;
    if (customerEmail) {
      customerEmailResponse = await resend.emails.send({
        from: "Modni Frizer Vojkan <noreply@YOUR-VERIFIED-DOMAIN.com>", // Replace with your verified domain
        to: [customerEmail],
        subject: `Potvrda termina - Modni Frizer Vojkan`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
              Vaš termin je uspešno zakazan!
            </h1>
            
            <p>Poštovani/a ${customerName},</p>
            <p>Hvala Vam što ste zakazali termin kod nas. Ovo su detalji Vašeg termina:</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>📅 Datum:</strong> ${formattedDate}</p>
              <p><strong>🕐 Vreme:</strong> ${appointmentTime}h</p>
              <p><strong>💇 Usluga:</strong> ${serviceType}</p>
            </div>
            
            <p>Ako imate bilo kakvih pitanja ili želite da promenite termin, slobodno nas kontaktirajte telefonom.</p>
            
            <p>Radujemo se Vašoj poseti!</p>
            
            <p style="margin-top: 30px;">
              <strong>Modni Frizer Vojkan</strong><br>
              📍 Adresa salona<br>
              📞 Telefon salona
            </p>
            
            <p style="color: #888; font-size: 12px; margin-top: 30px;">
              Ova poruka je automatski generisana. Molimo ne odgovarajte na ovaj email.
            </p>
          </div>
        `,
      });

      console.log("Customer confirmation sent:", customerEmailResponse);
    }

    return new Response(
      JSON.stringify({
        success: true,
        ownerNotification: ownerEmailResponse,
        customerConfirmation: customerEmailResponse,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
