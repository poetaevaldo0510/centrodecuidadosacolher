import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  Phone,
  Quote,
  Star,
  Clock,
  Send,
  Calendar,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const Services = () => {
  useEffect(() => {
    document.title = 'Serviços - Acolher | Cuidado com Dignidade';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Conheça os serviços do Centro Acolher: enfermagem 24h, atividades terapêuticas, alimentação balanceada, acompanhamento familiar e suporte emocional.');
    return () => { document.title = 'Acolher - Cuidando de Quem Cuida'; };
  }, []);
  const heroSection = useIntersectionObserver();
  const servicesSection = useIntersectionObserver();
  const testimonialsSection = useIntersectionObserver();
  const formSection = useIntersectionObserver();
  const faqSection = useIntersectionObserver();
  const ctaSection = useIntersectionObserver();

  const [openFaqItem, setOpenFaqItem] = useState<string | undefined>(undefined);

  const faqs = [
    {
      id: "faq-1",
      question: "Estou me sentindo culpado por considerar essa opção. Isso é normal?",
      answer: "Esse sentimento que você carrega não é fraqueza — é a prova mais pura do seu amor. A culpa nasce do cuidado profundo que você sente. Buscar ajuda profissional não significa abandonar; significa proporcionar a melhor qualidade de vida possível. Aqui, você não está \"se livrando\" de ninguém. Está estendendo os braços da sua família com os nossos.",
      emotion: "Validação do amor"
    },
    {
      id: "faq-2",
      question: "Como sei se meu familiar será tratado com dignidade?",
      answer: "A dignidade aqui não é um protocolo — é nossa razão de existir. Cada profissional é selecionado não apenas pela técnica, mas pela capacidade de ver a pessoa por trás do cuidado. Convidamos você a nos visitar, sentir o ambiente, observar as interações. A paz que você busca para seu familiar começa quando você sente que encontrou o lugar certo.",
      emotion: "Confiança restaurada"
    },
    {
      id: "faq-3",
      question: "Posso visitar a qualquer momento?",
      answer: "Sua presença não é apenas permitida — é celebrada. Entendemos que a distância física pode pesar, por isso mantemos nossas portas sempre abertas. Além das visitas presenciais, oferecemos atualizações regulares para que você se sinta conectado, mesmo quando não pode estar aqui. Você nunca estará distante demais.",
      emotion: "Conexão preservada"
    },
    {
      id: "faq-4",
      question: "E se meu familiar não se adaptar?",
      answer: "A adaptação é uma jornada, não um destino. Nossa equipe é treinada para esse acolhimento gradual, respeitando o tempo e as emoções de cada pessoa. Muitos familiares que chegaram resistentes hoje nos chamam de 'segundo lar'. E se, mesmo assim, não for o caminho certo, estaremos ao seu lado para encontrar a melhor solução — porque nosso compromisso é com o bem-estar, não com contratos.",
      emotion: "Segurança garantida"
    },
    {
      id: "faq-5",
      question: "Qual o diferencial do Acolher?",
      answer: "Não vendemos serviços de saúde. Entregamos paz de espírito para famílias e dignidade para quem amamos. Enquanto outros lugares falam de 'enfermagem 24h', nós oferecemos 'Olhos Sentinelas' — uma vigília que não dorme para que você possa, finalmente, descansar. Cada detalhe, do aroma dos ambientes à gentileza de cada interação, foi pensado para transmitir um único sentimento: amor.",
      emotion: "Propósito único"
    },
    {
      id: "faq-6",
      question: "Como funciona o primeiro contato?",
      answer: "O primeiro passo é uma conversa — sem compromisso, sem pressão. Queremos ouvir sua história, entender suas preocupações e mostrar quem somos. Você pode nos chamar pelo WhatsApp ou agendar uma visita. Não há formulários frios ou processos burocráticos. Há apenas pessoas dispostas a carregar esse peso com você.",
      emotion: "Acolhimento imediato"
    }
  ];

  const [formData, setFormData] = useState({
    name: '',
    need: '',
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const testimonials = [
    {
      name: "Maria Helena S.",
      relation: "Filha de paciente",
      text: "Encontrar o Acolher foi como encontrar paz depois de meses de angústia. Minha mãe não é tratada como paciente — ela é tratada como a pessoa especial que sempre foi. A culpa que eu sentia se transformou em gratidão.",
      rating: 5,
      avatar: "MH"
    },
    {
      name: "Roberto C.",
      relation: "Filho de paciente",
      text: "A equipe não cuida apenas do meu pai — cuida de mim também. Cada ligação, cada atualização, me faz sentir que tomei a decisão certa. Finalmente, consigo dormir em paz.",
      rating: 5,
      avatar: "RC"
    },
    {
      name: "Ana Paula M.",
      relation: "Neta de paciente",
      text: "Minha avó sempre teve medo de 'asilos'. Aqui, ela encontrou um segundo lar. O sorriso dela voltou, e com ele, o nosso também. Obrigada por devolverem a dignidade dela.",
      rating: 5,
      avatar: "AP"
    },
    {
      name: "Carlos Eduardo F.",
      relation: "Filho de paciente",
      text: "Depois de anos tentando cuidar sozinho, achei que estava falhando. O Acolher me mostrou que pedir ajuda é um ato de amor, não de fraqueza. Minha mãe está mais feliz do que estava em casa.",
      rating: 5,
      avatar: "CE"
    }
  ];

  const timeSlots = [
    "Manhã (8h - 12h)",
    "Tarde (12h - 18h)",
    "Noite (18h - 20h)",
    "Qualquer horário"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.need.trim() || !formData.time.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (formData.name.trim().length > 100) {
      toast.error('Nome deve ter no máximo 100 caracteres');
      return;
    }

    if (formData.need.trim().length > 500) {
      toast.error('Necessidade deve ter no máximo 500 caracteres');
      return;
    }

    setIsSubmitting(true);

    const message = `Olá! Gostaria de agendar uma visita de acolhimento.

*Nome:* ${formData.name.trim()}

*O que estou buscando:* ${formData.need.trim()}

*Melhor horário para visita:* ${formData.time}`;

    const whatsappUrl = `https://wa.me/5511961226754?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast.success('Redirecionando para o WhatsApp...');
    
    setFormData({ name: '', need: '', time: '' });
    setIsSubmitting(false);
  };

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
                href="#agendamento"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:-translate-y-1 transition flex items-center justify-center gap-2"
              >
                <Calendar size={20} />
                Agendar visita de acolhimento
              </a>
              <a 
                href="https://wa.me/5511961226754?text=Olá!%20Gostaria%20de%20agendar%20uma%20conversa%20de%20acolhimento."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card text-primary border-2 border-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/5 transition flex items-center justify-center gap-2"
              >
                <Phone size={20} />
                Conversar agora
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

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={testimonialsSection.ref}
            className={`transition-all duration-1000 ${
              testimonialsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center mb-16">
              <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent text-xs font-bold tracking-wide mb-4 border border-accent/20">
                💬 Vozes de Famílias
              </span>
              <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Histórias reais de<br />
                <span className="text-primary">paz reencontrada.</span>
              </h2>
              <p className="font-lora text-lg text-muted-foreground max-w-2xl mx-auto">
                Cada depoimento é um reflexo do amor que construímos todos os dias.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  <Quote size={48} className="absolute top-4 right-4 text-primary/10 group-hover:text-primary/20 transition-colors" />
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.relation}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-warning text-warning" />
                    ))}
                  </div>
                  
                  <p className="font-lora text-muted-foreground leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scheduling Form Section */}
      <section id="agendamento" className="py-16 lg:py-24 bg-muted/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={formSection.ref}
            className={`transition-all duration-1000 ${
              formSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center mb-12">
              <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide mb-4 border border-primary/20">
                📅 Agende sua Visita
              </span>
              <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Venha conhecer nosso<br />
                <span className="text-primary">espaço de acolhimento.</span>
              </h2>
              <p className="font-lora text-lg text-muted-foreground max-w-xl mx-auto">
                Preencha o formulário e entraremos em contato para combinar o melhor momento.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 md:p-10 shadow-xl border border-border/50">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-foreground font-medium mb-2 block">
                    Seu nome
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Como podemos te chamar?"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl border-border/50 focus:border-primary h-12"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="need" className="text-foreground font-medium mb-2 block">
                    O que você está buscando?
                  </Label>
                  <Textarea
                    id="need"
                    placeholder="Conte-nos um pouco sobre a situação da sua família e como podemos ajudar..."
                    value={formData.need}
                    onChange={(e) => setFormData({ ...formData, need: e.target.value })}
                    className="rounded-xl border-border/50 focus:border-primary min-h-[120px] resize-none"
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {formData.need.length}/500 caracteres
                  </p>
                </div>

                <div>
                  <Label className="text-foreground font-medium mb-3 block">
                    <Clock size={16} className="inline mr-2" />
                    Melhor horário para visita
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({ ...formData, time: slot })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                          formData.time === slot
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/50 bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#25D366] hover:bg-[#20BA5C] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                  {isSubmitting ? 'Enviando...' : 'Enviar pelo WhatsApp'}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                  Ao enviar, você será redirecionado para o WhatsApp com sua mensagem pronta.
                </p>
              </div>
            </form>
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

      {/* FAQ Section - PCH Style */}
      <section className="py-16 lg:py-24 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={faqSection.ref}
            className={`transition-all duration-1000 ${
              faqSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="text-center mb-12">
              <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent text-xs font-bold tracking-wide mb-4 border border-accent/20">
                <HelpCircle size={12} className="inline mr-1" /> Dúvidas do Coração
              </span>
              <h2 className="font-cormorant text-3xl md:text-4xl font-semibold text-foreground mb-4">
                As perguntas que você tem medo de fazer<br />
                <span className="text-primary">(e as respostas que você precisa ouvir)</span>
              </h2>
              <p className="font-lora text-lg text-muted-foreground max-w-2xl mx-auto">
                Sabemos que por trás de cada dúvida técnica existe uma preocupação emocional. 
                Aqui, respondemos às duas.
              </p>
            </div>

            <Accordion 
              type="single" 
              collapsible 
              value={openFaqItem}
              onValueChange={setOpenFaqItem}
              className="space-y-4"
            >
              {faqs.map((faq) => (
                <AccordionItem 
                  key={faq.id} 
                  value={faq.id}
                  className="bg-card rounded-2xl border border-border/50 px-6 overflow-hidden data-[state=open]:shadow-lg transition-shadow duration-300"
                >
                  <AccordionTrigger className="py-6 hover:no-underline group">
                    <div className="flex items-start gap-4 text-left">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <HelpCircle size={20} className="text-primary" />
                      </div>
                      <span className="font-lora text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="pl-14">
                      <p className="font-lora text-muted-foreground leading-relaxed mb-4">
                        {faq.answer}
                      </p>
                      <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                        <Sparkles size={14} className="text-accent" />
                        <span className="text-sm font-medium text-accent">
                          {faq.emotion}
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center">
              <p className="font-lora text-muted-foreground mb-4">
                Ainda tem perguntas? Estamos aqui para ouvir.
              </p>
              <a 
                href="https://wa.me/5511961226754?text=Olá!%20Tenho%20algumas%20dúvidas%20sobre%20o%20Centro%20Acolher.%20Podem%20me%20ajudar?"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5C] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <MessageCircle size={18} />
                Conversar sobre suas dúvidas
              </a>
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
