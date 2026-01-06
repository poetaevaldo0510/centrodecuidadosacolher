import { Link } from 'react-router-dom';
import { Heart, Users, Target, Sparkles, ArrowLeft, MessageCircle, Shield, Lightbulb } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

const About = () => {
  const heroSection = useIntersectionObserver();
  const missionSection = useIntersectionObserver();
  const teamSection = useIntersectionObserver();
  const philosophySection = useIntersectionObserver();

  const team = [
    {
      name: 'Dra. Maria Santos',
      role: 'Fundadora & Psicóloga',
      bio: 'Especialista em desenvolvimento infantil atípico com 15 anos de experiência. Mãe de um filho autista, entende a jornada de dentro para fora.',
      image: 'https://i.pravatar.cc/300?img=48',
    },
    {
      name: 'Ana Oliveira',
      role: 'Terapeuta Ocupacional',
      bio: 'Formada em escuta ativa e abordagem centrada na família. Acredita que cada mãe é a maior especialista no seu filho.',
      image: 'https://i.pravatar.cc/300?img=45',
    },
    {
      name: 'Carla Mendes',
      role: 'Assistente Social',
      bio: 'Especialista em direitos e benefícios para famílias atípicas. Luta diariamente para que nenhuma mãe fique sem informação.',
      image: 'https://i.pravatar.cc/300?img=47',
    },
    {
      name: 'Juliana Costa',
      role: 'Coordenadora de Comunidade',
      bio: 'Mãe de três, sendo dois neurodivergentes. Cria pontes entre mães para que ninguém caminhe sozinha.',
      image: 'https://i.pravatar.cc/300?img=44',
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
              href="https://wa.me/5511961226754?text=Olá!%20Sou%20mãe%20atípica%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20acolhimento%20do%20Centro."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20BA5C] text-white px-6 py-2.5 rounded-full font-bold transition shadow-lg flex items-center gap-2"
            >
              <MessageCircle size={18} />
              <span className="hidden sm:inline">Fale Conosco</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-primary/5 to-background"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div 
            ref={heroSection.ref}
            className={`text-center transition-all duration-1000 ${
              heroSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent text-xs font-bold tracking-wide mb-6 border border-accent/20">
              Conheça o Acolher
            </span>
            <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight">
              Sobre Nós
            </h1>
            <p className="font-lora text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Somos mais do que um centro de cuidados. Somos um refúgio para mães que precisam ser vistas, ouvidas e acolhidas.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={missionSection.ref}
            className={`transition-all duration-1000 ${
              missionSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="bg-card rounded-3xl p-8 md:p-12 lg:p-16 shadow-xl border border-border/50">
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target size={32} className="text-primary" />
                </div>
              </div>
              
              <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-center text-foreground mb-8">
                Nossa Missão
              </h2>
              
              <p className="font-lora text-xl md:text-2xl text-center text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                "Transformar a jornada da maternidade atípica através do suporte emocional, técnico e humano, garantindo que <span className="text-primary font-semibold">nenhuma mãe precise caminhar sozinha</span>."
              </p>

              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart size={24} className="text-accent" />
                  </div>
                  <h3 className="font-cormorant text-lg font-semibold text-foreground mb-2">Suporte Emocional</h3>
                  <p className="font-lora text-sm text-muted-foreground">
                    Escuta ativa e acolhimento sem julgamentos para as dores que só uma mãe atípica conhece.
                  </p>
                </div>
                
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb size={24} className="text-primary" />
                  </div>
                  <h3 className="font-cormorant text-lg font-semibold text-foreground mb-2">Suporte Técnico</h3>
                  <p className="font-lora text-sm text-muted-foreground">
                    Orientação especializada sobre terapias, direitos, benefícios e estratégias do dia a dia.
                  </p>
                </div>
                
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={24} className="text-success" />
                  </div>
                  <h3 className="font-cormorant text-lg font-semibold text-foreground mb-2">Suporte Humano</h3>
                  <p className="font-lora text-sm text-muted-foreground">
                    Uma comunidade de mães que entendem, apoiam e celebram cada pequena vitória juntas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={teamSection.ref}
            className={`transition-all duration-1000 ${
              teamSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center mb-12">
              <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-foreground mb-4">
                A Nossa Equipe
              </h2>
              <p className="font-lora text-lg text-muted-foreground max-w-2xl mx-auto">
                Uma equipe não apenas técnica, mas treinada em <span className="text-primary font-medium">escuta ativa e empatia</span>. Profissionais que entendem a jornada porque muitas também a vivem.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <div 
                  key={index}
                  className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 text-center hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-primary/20">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-cormorant text-xl font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="font-lora text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={philosophySection.ref}
            className={`transition-all duration-1000 ${
              philosophySection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-background rounded-3xl p-8 md:p-12 lg:p-16 border border-border/50">
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <Sparkles size={32} className="text-accent" />
                </div>
              </div>
              
              <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-center text-foreground mb-8">
                Filosofia do Acolhimento
              </h2>
              
              <div className="space-y-6 font-lora text-lg text-muted-foreground leading-relaxed">
                <p>
                  No Centro de Cuidados Acolher, acreditamos que <span className="text-foreground font-medium">a saúde mental da mãe é inseparável do bem-estar da família</span>. Por isso, integramos o suporte emocional com o apoio prático ao dia a dia.
                </p>
                
                <p>
                  Não oferecemos apenas informações ou terapias. Oferecemos <span className="text-primary font-medium">um espaço onde a mãe pode ser vulnerável sem medo</span>, onde pode admitir que está cansada sem culpa, e onde pode buscar ajuda sem vergonha.
                </p>
                
                <p>
                  Cada atendimento, cada grupo de apoio, cada recurso que criamos parte de uma mesma pergunta: <span className="text-accent font-medium">"Isso vai ajudar essa mãe a respirar mais leve hoje?"</span>
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 mt-10 pt-8 border-t border-border/30">
                <Shield size={24} className="text-primary" />
                <p className="font-lora text-sm text-muted-foreground">
                  Todos os nossos profissionais seguem protocolos de confidencialidade e ética
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Pronta para ser acolhida?
          </h2>
          <p className="font-lora text-lg text-muted-foreground mb-8">
            Dê o primeiro passo. Estamos aqui para ouvir você.
          </p>
          
          <a 
            href="https://wa.me/5511961226754?text=Olá!%20Sou%20mãe%20atípica%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20acolhimento%20do%20Centro."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5C] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <MessageCircle size={24} />
            Fale Conosco no WhatsApp
          </a>

          {/* Poetic Closing */}
          <div className="mt-16 pt-8 border-t border-border/30">
            <p className="font-cormorant text-xl md:text-2xl italic text-accent/80">
              "Onde o cuidado encontra o coração."
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

export default About;
