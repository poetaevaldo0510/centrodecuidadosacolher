import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company_name, inquiry_type, message } = await req.json();

    // Log the inquiry for admin visibility
    console.log("New partnership inquiry received:", {
      name,
      email,
      company_name,
      inquiry_type,
      timestamp: new Date().toISOString(),
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all admin user IDs
    const { data: admins } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (admins && admins.length > 0) {
      // Create in-app notifications for all admins
      const notifications = admins.map((admin) => ({
        user_id: admin.user_id,
        type: "partnership_inquiry",
        title: "Nova solicitação de parceria! 🤝",
        message: `${name}${company_name ? ` (${company_name})` : ""} enviou uma solicitação de parceria do tipo "${inquiry_type}". Verifique na aba Parceiros do painel administrativo.`,
        data: { name, email, company_name, inquiry_type, message },
      }));

      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("Error creating notifications:", notifError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Admins notified" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in notify-partnership:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});