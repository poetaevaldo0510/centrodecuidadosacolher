import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  report_id: string;
  content_type: string;
  reason: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { report_id, content_type, reason }: NotifyRequest = await req.json();

    console.log(`New report notification: ${report_id}, type: ${content_type}, reason: ${reason}`);

    // Get all admins and moderators
    const { data: moderators, error: moderatorsError } = await supabaseClient
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "moderator"]);

    if (moderatorsError) {
      console.error("Error fetching moderators:", moderatorsError);
      throw moderatorsError;
    }

    console.log(`Found ${moderators?.length || 0} moderators to notify`);

    // Get reason label
    const reasonLabels: Record<string, string> = {
      spam: "Spam",
      offensive: "Conteúdo Ofensivo",
      harassment: "Assédio",
      misinformation: "Desinformação",
      other: "Outro",
    };

    const contentTypeLabel = content_type === "post" ? "publicação" : "comentário";
    const reasonLabel = reasonLabels[reason] || reason;

    // Try to send browser push notifications if available
    // This is a placeholder - in production you'd integrate with a push service
    const notification = {
      title: "Nova Denúncia",
      body: `Uma ${contentTypeLabel} foi denunciada por: ${reasonLabel}`,
      data: {
        report_id,
        content_type,
        reason,
        url: "/admin?tab=moderation",
      },
    };

    console.log("Notification payload:", notification);

    // Log the notification for tracking
    const { error: logError } = await supabaseClient.from("activity_logs").insert(
      moderators?.map((mod) => ({
        user_id: mod.user_id,
        activity_type: "moderation_notification",
        description: `Nova denúncia: ${contentTypeLabel} - ${reasonLabel}`,
        metadata: {
          report_id,
          content_type,
          reason,
        },
      })) || []
    );

    if (logError) {
      console.error("Error logging notifications:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        notified_count: moderators?.length || 0,
        notification,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in notify-moderators:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});