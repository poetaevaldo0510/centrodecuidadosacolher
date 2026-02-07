import { Heart, Star, Users, ExternalLink, Gift, Trophy, Handshake } from 'lucide-react';
import ModalBase from './ModalBase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PartnersModal = () => {
  const partners = [
    {
      name: 'Instituto Incluir',
      type: 'Apoiador Ouro',
      description: 'Apoio institucional e recursos para famílias atípicas',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Clínica Desenvolvimento',
      type: 'Parceiro Clínico',
      description: 'Terapias especializadas com desconto para usuários Acolher',
      icon: Heart,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
    },
    {
      name: 'Loja Sensorial Kids',
      type: 'Parceiro Comercial',
      description: 'Produtos sensoriais e materiais adaptativos',
      icon: Gift,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  const benefits = [
    'Visibilidade para milhares de famílias',
    'Badge exclusivo de apoiador',
    'Destaque no marketplace',
    'Networking com profissionais',
  ];

  return (
    <ModalBase
      title="Parceiros & Apoiadores"
      icon={<Handshake className="text-primary" size={20} />}
      variant="default"
      maxWidth="md"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Intro */}
        <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
          <Users className="mx-auto text-primary mb-2" size={32} />
          <h4 className="font-semibold text-foreground">
            Juntos somos mais fortes!
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Empresas e instituições que acreditam na nossa missão de acolher famílias atípicas.
          </p>
        </div>

        {/* Partners List */}
        <div className="space-y-3">
          <h5 className="font-medium text-sm text-foreground flex items-center gap-2">
            <Star className="text-yellow-500" size={16} />
            Nossos Parceiros
          </h5>
          
          {partners.map((partner, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border border-border ${partner.bgColor} transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-background ${partner.color}`}>
                  <partner.icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h6 className="font-semibold text-foreground">{partner.name}</h6>
                    <Badge variant="secondary" className="text-xs">
                      {partner.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {partner.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Become a Partner */}
        <div className="p-4 bg-muted/50 rounded-xl border border-border">
          <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Handshake className="text-primary" size={18} />
            Seja um Parceiro ou Apoiador
          </h5>
          
          <p className="text-sm text-muted-foreground mb-3">
            Quer fazer parte dessa rede de apoio? Confira os benefícios:
          </p>
          
          <ul className="space-y-2 mb-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              className="flex-1 gap-2"
              onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de ser parceiro do Acolher', '_blank')}
            >
              <Heart size={16} />
              Quero ser Apoiador
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Tenho interesse em parceria comercial com o Acolher', '_blank')}
            >
              <ExternalLink size={16} />
              Parceria Comercial
            </Button>
          </div>
        </div>

        {/* Gratitude Message */}
        <div className="text-center py-3">
          <p className="text-xs text-muted-foreground">
            💜 Agradecemos a todos que tornam o Acolher possível!
          </p>
        </div>
      </div>
    </ModalBase>
  );
};

export default PartnersModal;
