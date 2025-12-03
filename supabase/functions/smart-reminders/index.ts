import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { logs, routines, currentTime } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um assistente inteligente para famílias com crianças especiais. 
Analise os padrões de uso do aplicativo e sugira os melhores horários para cada atividade.

Baseado nos logs de atividades e rotinas do usuário:
- Identifique padrões de comportamento
- Sugira horários otimizados para cada atividade
- Considere o bem-estar da criança e da família
- Dê dicas personalizadas baseadas nos dados

Responda sempre em português brasileiro de forma acolhedora e empática.`;

    const userMessage = `
Hora atual: ${currentTime}

Logs de atividades recentes:
${JSON.stringify(logs, null, 2)}

Rotinas configuradas:
${JSON.stringify(routines, null, 2)}

Por favor:
1. Analise os padrões de uso
2. Identifique os melhores horários para cada tipo de atividade
3. Sugira lembretes personalizados
4. Dê uma dica rápida baseada nos padrões observados`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_reminders",
              description: "Sugere lembretes inteligentes baseados nos padrões de uso",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        activity: { type: "string" },
                        suggested_time: { type: "string" },
                        reason: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["activity", "suggested_time", "reason", "priority"],
                    },
                  },
                  daily_tip: { type: "string" },
                  pattern_insight: { type: "string" },
                },
                required: ["suggestions", "daily_tip", "pattern_insight"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_reminders" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "No suggestions generated" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Smart reminders error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
