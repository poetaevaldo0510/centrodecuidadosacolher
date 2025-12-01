import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Home, BookOpen, Camera, Calendar, MessageCircle, Map, ShoppingBag, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  highlight: string;
}

const steps: OnboardingStep[] = [
  {
    title: 'Bem-vindo ao Acolher!',
    description: 'Seu app para organizar a rotina, conectar com outras famílias e encontrar recursos para seu filho.',
    icon: Home,
    highlight: 'bg-gradient-hero',
  },
  {
    title: 'Recursos',
    description: 'Acesse artigos, vídeos e dicas sobre cuidados especiais, terapias e desenvolvimento infantil.',
    icon: BookOpen,
    highlight: 'bg-primary',
  },
  {
    title: 'Galeria de Fotos',
    description: 'Registre o progresso do seu filho com fotos antes/depois e celebre conquistas importantes.',
    icon: Camera,
    highlight: 'bg-accent',
  },
  {
    title: 'Calendário',
    description: 'Organize consultas, medicações e terapias. Receba lembretes para não perder nada.',
    icon: Calendar,
    highlight: 'bg-blue-500',
  },
  {
    title: 'Tribo',
    description: 'Conecte-se com outras famílias, compartilhe experiências e troque mensagens.',
    icon: MessageCircle,
    highlight: 'bg-purple-500',
  },
  {
    title: 'Explorar',
    description: 'Encontre profissionais, clínicas e serviços especializados perto de você.',
    icon: Map,
    highlight: 'bg-success',
  },
  {
    title: 'Mercado',
    description: 'Compre e venda produtos adaptados e equipamentos usados com outras famílias.',
    icon: ShoppingBag,
    highlight: 'bg-warning',
  },
  {
    title: 'Perfil',
    description: 'Gerencie suas informações, exporte relatórios para compartilhar com profissionais de saúde.',
    icon: User,
    highlight: 'bg-muted',
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const OnboardingTutorial = ({ onComplete }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [show, setShow] = useState(true);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setShow(false);
    setTimeout(() => {
      onComplete();
      localStorage.setItem('onboarding_completed', 'true');
    }, 300);
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-16 h-16 rounded-2xl ${step.highlight} flex items-center justify-center mb-4`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleComplete}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
        <p className="text-muted-foreground mb-6">{step.description}</p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Passo {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handlePrev}
              className="flex-1 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 flex items-center gap-2 justify-center"
          >
            {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Skip option */}
        {currentStep < steps.length - 1 && (
          <button
            onClick={handleComplete}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
          >
            Pular tutorial
          </button>
        )}
      </Card>
    </div>
  );
};

export default OnboardingTutorial;