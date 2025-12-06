import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  eventTitle: string;
  eventTime: string;
  eventType: string;
  eventDescription?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured - email notifications disabled");
      return new Response(
        JSON.stringify({ success: false, message: "Email notifications not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const { to, subject, eventTitle, eventTime, eventType, eventDescription }: EmailRequest = await req.json();

    console.log(`Sending calendar email to ${to} for event: ${eventTitle}`);

    const eventTypeLabels: Record<string, string> = {
      medication: '💊 Medicação',
      appointment: '🏥 Consulta',
      therapy: '🧠 Terapia',
      other: '📅 Evento',
    };

    const eventLabel = eventTypeLabels[eventType] || eventTypeLabels.other;

    const emailResponse = await resend.emails.send({
      from: "Acolher <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 20px; padding: 30px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Lembrete Acolher</h1>
            </div>
            
            <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                  ${eventLabel}
                </span>
              </div>
              
              <h2 style="color: #1f2937; text-align: center; margin: 0 0 20px 0; font-size: 22px;">
                ${eventTitle}
              </h2>
              
              <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
                  ⏰ <strong>Horário:</strong> ${eventTime}
                </p>
                ${eventDescription ? `
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                  📝 <strong>Descrição:</strong> ${eventDescription}
                </p>
                ` : ''}
              </div>
              
              <p style="color: #6b7280; text-align: center; margin: 0; font-size: 14px;">
                Este é um lembrete automático do aplicativo Acolher.
              </p>
            </div>
            
            <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 20px;">
              Acolher - Cuidando de famílias especiais 💜
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
