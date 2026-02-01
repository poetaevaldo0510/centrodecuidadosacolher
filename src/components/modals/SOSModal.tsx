import { useState } from 'react';
import { Phone, Video, MessageCircle, Heart, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import ModalBase from './ModalBase';
import VideoCallModal from './VideoCallModal';
import { Button } from '@/components/ui/button';

const SOSModal = () => {
  const { setActiveModal } = useAppStore();
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const supportOptions = [
    {
      id: 'video',
      icon: Video,
      title: 'Videochamada Terapêutica',
      description: 'Conecte-se com uma psicóloga por videochamada',
      action: () => setShowVideoCall(true),
      color: 'bg-primary',
    },
    {
      id: 'cvv',
      icon: Phone,
      title: 'CVV - Centro de Valorização da Vida',
      description: 'Ligue 188 - Atendimento 24h',
      action: () => window.open('tel:188'),
      color: 'bg-success',
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      title: 'Chat de Apoio WhatsApp',
      description: 'Conversar com alguém agora',
      action: () => window.open('https://wa.me/5511999999999?text=Olá,%20preciso%20de%20apoio%20emocional', '_blank'),
      color: 'bg-success',
    },
    {
      id: 'caps',
      icon: Heart,
      title: 'CAPS - Apoio em Saúde Mental',
      description: 'Encontre o CAPS mais próximo',
      action: () => window.open('https://www.gov.br/saude/pt-br/composicao/saes/caps', '_blank'),
      color: 'bg-accent',
    },
  ];

  if (showVideoCall) {
    return (
      <VideoCallModal
        roomName={`acolher-sos-${Date.now()}`}
        displayName="Mãe Acolher"
        onClose={() => {
          setShowVideoCall(false);
          setActiveModal(null);
        }}
      />
    );
  }

  return (
    <ModalBase variant="fullscreen" title="" showCloseButton={false}>
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <div className="text-center py-8 px-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse mx-auto">
            <Heart size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">SOS Acolher</h2>
          <p className="text-white/80 max-w-xs mx-auto">
            Você não está sozinha. Escolha como deseja receber apoio agora.
          </p>
        </div>

        {/* Support Options */}
        <div className="flex-1 bg-background rounded-t-3xl p-6 space-y-4">
          <h3 className="font-bold text-foreground text-lg mb-4">
            Opções de Acolhimento
          </h3>
          
          {supportOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all text-left group"
            >
              <div className={`p-3 ${option.color} rounded-xl`}>
                <option.icon size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {option.title}
                </h4>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              {option.id === 'video' && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  Novo
                </span>
              )}
            </button>
          ))}

          {/* Emergency Notice */}
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mt-6">
            <p className="text-sm text-destructive font-medium mb-1">
              ⚠️ Em caso de emergência
            </p>
            <p className="text-xs text-muted-foreground">
              Ligue imediatamente para o SAMU (192) ou vá ao pronto-socorro mais próximo.
            </p>
          </div>

          {/* Cancel Button */}
          <Button
            variant="outline"
            onClick={() => setActiveModal(null)}
            className="w-full mt-4"
          >
            Fechar
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

export default SOSModal;
