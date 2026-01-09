import { Link } from 'react-router-dom';
import { 
  Heart, 
  ArrowLeft, 
  MessageCircle, 
  Eye, 
  Smile, 
  Utensils, 
  Home, 
  Users, 
  Sparkles,
  Shield,
  Phone
} from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

const Services = () => {
  const heroSection = useIntersectionObserver();
  const servicesSection = useIntersectionObserver();
  const ctaSection = useIntersectionObserver();

  const services = [
    {
      icon: Eye,
      title: "Olhos Sentinelas",
      subtitle: "Enfermagem 24 Horas",
      description: "Nossa vigília não dorme, para que a sua família possa, finalmente, descansar com a certeza de que nada faltará.",
      feeling: "Segurança absoluta",
      color: "primary",
    },
    {
      icon: Smile,
      title: "O Resgate do Sorriso",
      subtitle: "Atividades Terapêuticas",
      description: "Não ocupamos apenas o tempo; ocupamos a mente com propósito, arte e movimento, celebrando cada pequena vitória do dia.",
      feeling: "Alegria restaurada",
      color: "accent",
    },
    {
      icon: Utensils,
      title: "Nutrição de Corpo e Alma",
      subtitle: "Alimentação Balanceada",
      description: "Sabores que trazem memórias de casa, preparados com a ciência da saúde e o tempero do afeto.",
      feeling: "Conforto familiar",
      color: "success",
    },
    {
      icon: Home,
      title: "O Lar que Abraça",
      subtitle: "Ambiente Acolhedor",
      description: "Cada espaço foi pensado para transmitir paz. Aqui, seu ente querido não é paciente — é família.",
      feeling: "Pertencimento",
      color: "warning",
    },
    {
      icon: Users,
      title: "A Ponte da Conexão",
      subtitle: "Acompanhamento Familiar",
      description: "Mantemos você presente, mesmo à distância. Cada progresso, cada sorriso, compartilhado em tempo real.",
      feeling: "União preservada",
      color: "primary",
    },
    {
      icon: Heart,
      title: "O Colo que Cura",
      subtitle: "Suporte Emocional",
      description: "Profissionais treinados não apenas em técnica, mas em humanidade. Porque o cuidado começa com o coração.",
      feeling: "Dignidade restaurada",
      color: "accent",
    },
  ];

  return (
    <div className="font-sans text-foreground antialiased bg-background min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <ArrowLeft size={20} className="text-muted-foreground group-hover:text-primary transition" />
              <div className="bg-primary p-2 rounded-xl text-primary-foreground">
                <Heart size={24} fill="currentColor" />
              </div>
              <span className="text-2xl font-bold text-primary tracking-tight">Acolher</span>
            </Link>
            
            <a 
              href="https://wa.me/5511961226754?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20os%20serviços%20do%20Centro%20Acolher."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20BA5C] text-white px-6 py-2.5 rounded-full font-bold transition shadow-lg flex items-center gap-2"
            >
              <MessageCircle size={18} />
              <span className="hidden sm:inline">Conversar</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section - PCH Style */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop")`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-accent/5 to-background"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div 
            ref={heroSection.ref}
            className={`text-center transition-all duration-1000 ${
              heroSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide mb-6 border border-primary/20">
              ✨ O Espelho da Dignidade
            </span>
            
            <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight">
              Mais do que um lugar para estar.<br />
              <span className="text-primary">Um braço para segurar.</span>
            </h1>
            
            <p className="font-lora text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Transformamos a necessidade de cuidado em uma rotina de <span className="text-accent font-medium">carinho</span>, <span className="text-primary font-medium">segurança</span> e <span className="text-success font-medium">vida continuada</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/5511961226754?text=Olá!%20Quero%20paz%20de%20espírito%20para%20minha%20família.%20Podem%20me%20ajudar?"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:-translate-y-1 transition flex items-center justify-center gap-2"
              >
                <Heart size={20} fill="currentColor" />
                Quero paz de espírito para minha família
              </a>
              <a 
                href="https://wa.me/5511961226754?text=Olá!%20Gostaria%20de%20agendar%20uma%20conversa%20de%20acolhimento."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card text-primary border-2 border-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/5 transition flex items-center justify-center gap-2"
              >
                <Phone size={20} />
                Agendar conversa de acolhimento
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - PCH Reframing */}
      <section className="py-16 lg:py-24 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={servicesSection.ref}
            className={`transition-all duration-1000 ${
              servicesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center mb-16">
              <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Não vendemos serviços.<br />
                <span className="text-primary">Entregamos sentimentos.</span>
              </h2>
              <p className="font-lora text-lg text-muted-foreground max-w-2xl mx-auto">
                Cada aspecto do cuidado foi desenhado pensando em como você e seu ente querido vão se <span className="italic">sentir</span>.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => {
                const Icon = service.icon;
                const colorClasses = {
                  primary: 'bg-primary/10 text-primary border-primary/20',
                  accent: 'bg-accent/10 text-accent border-accent/20',
                  success: 'bg-success/10 text-success border-success/20',
                  warning: 'bg-warning/10 text-warning border-warning/20',
                };
                
                return (
                  <div 
                    key={index}
                    className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorClasses[service.color as keyof typeof colorClasses]}`}>
                      <Icon size={28} />
                    </div>
                    
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                      {service.subtitle}
                    </p>
                    
                    <h3 className="font-cormorant text-2xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    
                    <p className="font-lora text-muted-foreground leading-relaxed mb-6">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                      <Sparkles size={16} className="text-accent" />
                      <span className="text-sm font-medium text-accent">
                        {service.feeling}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Understanding Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-background rounded-3xl p-8 md:p-12 lg:p-16 border border-border/50">
            <div className="text-center mb-10">
              <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Por que famílias nos escolhem?
              </h2>
              <p className="font-lora text-lg text-muted-foreground">
                Porque entendemos a <span className="text-primary font-medium">dor silenciosa</span> de quem busca ajuda.
              </p>
            </div>

            <div className="space-y-6 font-lora text-lg text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border/30">
                <Shield size={24} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-foreground mb-2">Nós entendemos a culpa</p>
                  <p className="text-base">
                    Sabemos que a decisão de buscar cuidado profissional carrega peso emocional. Aqui, você não está "se livrando" de ninguém — está proporcionando a melhor qualidade de vida possível.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border/30">
                <Heart size={24} className="text-accent flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-foreground mb-2">Nós entendemos o medo</p>
                  <p className="text-base">
                    O receio de que seu ente querido não seja bem tratado é natural. Por isso, cada detalhe aqui é pensado para transmitir amor — do aroma dos ambientes à gentileza de cada interação.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border/30">
                <Users size={24} className="text-success flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-foreground mb-2">Nós carregamos o peso com você</p>
                  <p className="text-base">
                    Não dizemos "somos profissionais" — isso é o mínimo. Dizemos: <span className="text-primary font-medium">"Nós entendemos a sua dor e vamos carregar esse peso com você."</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary/5">
        <div 
          ref={ctaSection.ref}
          className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${
            ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-foreground mb-6">
            O primeiro passo é o mais difícil.<br />
            <span className="text-primary">Deixe-nos dar a mão.</span>
          </h2>
          <p className="font-lora text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Uma conversa sem compromisso. Apenas para você sentir se somos o lugar certo para a sua família.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/5511961226754?text=Olá!%20Quero%20paz%20de%20espírito%20para%20minha%20família.%20Podem%20me%20ajudar?"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5C] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <MessageCircle size={24} />
              Quero paz de espírito para minha família
            </a>
          </div>

          {/* Poetic Closing */}
          <div className="mt-16 pt-8 border-t border-border/30">
            <p className="font-cormorant text-xl md:text-2xl italic text-accent/80">
              "Cuidado é técnico. Acolhimento é emocional.<br />Aqui, entregamos os dois."
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground">
              <Heart size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-primary">Acolher</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Centro de Cuidados Acolher. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Services;
