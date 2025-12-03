import { useState, useEffect } from 'react';
import { Brain, Clock, Lightbulb, Loader2, RefreshCw, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface Suggestion {
  activity: string;
  suggested_time: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIResponse {
  suggestions: Suggestion[];
  daily_tip: string;
  pattern_insight: string;
}

const priorityColors = {
  high: 'bg-destructive/10 border-destructive/30 text-destructive',
  medium: 'bg-warning/10 border-warning/30 text-warning',
  low: 'bg-success/10 border-success/30 text-success',
};

const SmartReminders = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);

  const loadSmartReminders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load user's recent logs
      const { data: logs } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Load user's routines
      const { data: routines } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id);

      const response = await supabase.functions.invoke('smart-reminders', {
        body: {
          logs: logs || [],
          routines: routines || [],
          currentTime: new Date().toISOString(),
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setAIResponse(response.data);
    } catch (error) {
      console.error('Error loading smart reminders:', error);
      toast.error('Erro ao carregar lembretes inteligentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load on first render if user is logged in
    if (user && !aiResponse) {
      loadSmartReminders();
    }
  }, [user]);

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-5 rounded-2xl border border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Brain className="text-primary" size={20} /> Lembretes Inteligentes
        </h3>
        <Button
          onClick={loadSmartReminders}
          variant="ghost"
          size="sm"
          disabled={loading}
          className="text-primary"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <RefreshCw size={16} />
          )}
        </Button>
      </div>

      {loading && !aiResponse && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Loader2 className="animate-spin text-primary mb-3" size={32} />
          <p className="text-sm text-muted-foreground">
            A IA está analisando seus padrões...
          </p>
        </div>
      )}

      {aiResponse && (
        <>
          {/* Pattern Insight */}
          <div className="bg-card p-4 rounded-xl border border-border">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Lightbulb size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase mb-1">Insight do Dia</p>
                <p className="text-sm text-foreground">{aiResponse.pattern_insight}</p>
              </div>
            </div>
          </div>

          {/* Daily Tip */}
          <div className="bg-warning/10 p-4 rounded-xl border border-warning/30">
            <p className="text-sm text-foreground">
              <span className="font-bold">💡 Dica:</span> {aiResponse.daily_tip}
            </p>
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-muted-foreground">
              Sugestões de Horários
            </p>
            {aiResponse.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border-2 ${priorityColors[suggestion.priority]}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{suggestion.activity}</span>
                  <span className="flex items-center gap-1 text-xs">
                    <Clock size={12} /> {suggestion.suggested_time}
                  </span>
                </div>
                <p className="text-xs opacity-80">{suggestion.reason}</p>
              </div>
            ))}
          </div>

          {/* Enable Notifications Prompt */}
          <div className="bg-accent/10 p-3 rounded-xl border border-accent/30 flex items-center gap-3">
            <Bell className="text-accent" size={20} />
            <div className="flex-1">
              <p className="text-xs font-bold text-accent">Ativar Notificações</p>
              <p className="text-xs text-muted-foreground">Receba lembretes no horário ideal</p>
            </div>
          </div>
        </>
      )}

      {!loading && !aiResponse && (
        <div className="text-center py-6">
          <Brain className="mx-auto text-muted-foreground mb-3 opacity-50" size={40} />
          <p className="text-sm text-muted-foreground mb-3">
            Clique para a IA analisar seus padrões
          </p>
          <Button onClick={loadSmartReminders} size="sm">
            <Brain size={16} className="mr-2" />
            Analisar Padrões
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartReminders;
