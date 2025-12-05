import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, userId } = await req.json();
    console.log(`Push notification action: ${action} for user: ${userId}`);

    if (action === "check_reminders") {
      // Get upcoming calendar events within the next 30 minutes
      const now = new Date();
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

      const { data: events, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", userId)
        .eq("completed", false)
        .gte("start_time", now.toISOString())
        .lte("start_time", thirtyMinutesLater.toISOString());

      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }

      const notifications = events?.map((event) => {
        const eventTime = new Date(event.start_time);
        const minutesUntil = Math.round((eventTime.getTime() - now.getTime()) / 60000);
        
        let title = "";
        let body = "";
        
        if (event.event_type === "medication") {
          title = "💊 Lembrete de Medicação";
          body = `${event.title} em ${minutesUntil} minutos`;
        } else if (event.event_type === "therapy") {
          title = "🧩 Sessão de Terapia";
          body = `${event.title} em ${minutesUntil} minutos`;
        } else if (event.event_type === "appointment") {
          title = "📅 Compromisso";
          body = `${event.title} em ${minutesUntil} minutos`;
        } else {
          title = "⏰ Lembrete";
          body = `${event.title} em ${minutesUntil} minutos`;
        }

        return {
          id: event.id,
          title,
          body,
          eventType: event.event_type,
          startTime: event.start_time,
          minutesUntil,
        };
      }) || [];

      console.log(`Found ${notifications.length} upcoming notifications`);

      return new Response(
        JSON.stringify({ notifications }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_daily_reminders") {
      // Get all events for today that need reminders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: events, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", userId)
        .eq("completed", false)
        .gte("start_time", today.toISOString())
        .lt("start_time", tomorrow.toISOString())
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching daily events:", error);
        throw error;
      }

      const reminders = events?.map((event) => ({
        id: event.id,
        title: event.title,
        eventType: event.event_type,
        startTime: event.start_time,
        remindBeforeMinutes: event.remind_before_minutes || 30,
        location: event.location,
      })) || [];

      console.log(`Found ${reminders.length} daily reminders`);

      return new Response(
        JSON.stringify({ reminders }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Push notification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
