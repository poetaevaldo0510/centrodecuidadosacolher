import { X, Heart } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const AboutModal = () => {
  const { setActiveModal } = useAppStore();

  return (
    <div className="fixed inset-0 z-[60] bg-primary/90 flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 p-2 bg-muted rounded-full hover:bg-muted/80"
        >
          <X size={20} />
        </button>
        <div className="text-center mb-6">
          <Heart size={48} className="text-accent fill-accent mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-primary">Sobre o Acolher</h2>
          <p className="text-sm text-muted-foreground">Cuidando de quem cuida.</p>
        </div>
        <div className="space-y-6 text-sm leading-relaxed text-foreground h-64 overflow-y-auto pr-2">
          <div>
            <h3 className="font-bold text-primary uppercase text-xs mb-1">Nossa Missão</h3>
            <p>Desonerar a carga mental da maternidade atípica através da tecnologia.</p>
          </div>
          <div>
            <h3 className="font-bold text-primary uppercase text-xs mb-1">Nossa Visão</h3>
            <p>Ser a plataforma global de referência para famílias neurodivergentes até 2026.</p>
          </div>
          <div>
            <h3 className="font-bold text-primary uppercase text-xs mb-1">Nossos Valores</h3>
            <ul className="list-disc ml-4 space-y-1">
              <li>A Mãe no Centro</li>
              <li>Dados com Coração</li>
              <li>Independência Financeira</li>
              <li>Acessibilidade Radical</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">Versão 12.0 - Feito com ❤️ para Mães Atípicas</p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
