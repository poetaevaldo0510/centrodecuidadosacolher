import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      essential: true,
      performance: true,
      functionality: true,
      accepted_at: new Date().toISOString(),
    }));
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      essential: true,
      performance: false,
      functionality: false,
      accepted_at: new Date().toISOString(),
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-lg mx-auto bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cookie size={20} className="text-primary shrink-0" />
            <h3 className="font-semibold text-sm text-foreground">Cookies e Privacidade</h3>
          </div>
          <button onClick={handleAcceptEssential} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Utilizamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa{' '}
          <Link to="/privacidade" className="text-primary underline underline-offset-2">Política de Privacidade</Link> e{' '}
          <Link to="/termos" className="text-primary underline underline-offset-2">Termos de Uso</Link>, em conformidade com a LGPD.
        </p>

        {showDetails && (
          <div className="space-y-2 text-xs border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Essenciais</p>
                <p className="text-muted-foreground">Necessários para o funcionamento</p>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Sempre ativo</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Desempenho</p>
                <p className="text-muted-foreground">Análise de uso anônima</p>
              </div>
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Opcional</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Funcionalidade</p>
                <p className="text-muted-foreground">Preferências e personalizações</p>
              </div>
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Opcional</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button onClick={handleAcceptAll} size="sm" className="flex-1 text-xs h-8">
            Aceitar todos
          </Button>
          <Button onClick={handleAcceptEssential} variant="outline" size="sm" className="flex-1 text-xs h-8">
            Apenas essenciais
          </Button>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[10px] text-muted-foreground underline underline-offset-2 w-full text-center"
        >
          {showDetails ? 'Ocultar detalhes' : 'Ver detalhes dos cookies'}
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
