export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const isGeminiConfigured = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY !== 'PLACEHOLDER_API_KEY';
};

export async function generateInsight(logs: any[]): Promise<string> {
  if (!isGeminiConfigured()) {
    return "Configure a API do Gemini para insights personalizados.";
  }
  
  // Placeholder para integração real com Gemini
  return "Insight gerado pela IA baseado nos seus registros.";
}
