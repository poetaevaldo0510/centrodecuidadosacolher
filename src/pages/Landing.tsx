import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Zap,
  Users,
  ShoppingBag,
  Star,
  Menu,
  X,
  Smartphone,
  Mail,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronDown,
  Shield,
  MessageCircle,
  Quote,
  Handshake,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Obrigado! O e-mail ${email} foi inscrito na lista de espera VIP.`);
    setEmail("");
  };

  const heroSection = useIntersectionObserver();
  const featuresSection = useIntersectionObserver();
  const testimonialSection = useIntersectionObserver();
  const videoSection = useIntersectionObserver();
  const faqSection = useIntersectionObserver();
  const manifestoSection = useIntersectionObserver();
  const marketSection = useIntersectionObserver();
  const ctaSection = useIntersectionObserver();

  return (
    <div className="font-sans text-foreground antialiased bg-background">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl text-primary-foreground">
                <Heart size={24} fill="currentColor" />
              </div>
              <span className="text-2xl font-bold text-primary tracking-tight">Acolher</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#manifesto" className="text-sm font-medium text-muted-foreground hover:text-primary transition">
                Manifesto
              </a>
              <Link to="/sobre" className="text-sm font-medium text-muted-foreground hover:text-primary transition">
                Sobre Nós
              </Link>
              <Link to="/servicos" className="text-sm font-medium text-muted-foreground hover:text-primary transition">
                Serviços
              </Link>
              <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition">
                FAQ
              </a>
              <Link
                to="/app"
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition shadow-lg"
              >
                Acessar App Grátis
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-muted-foreground">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-card border-t border-border p-4 space-y-4 animate-slide-in-from-bottom">
            <a
              href="#manifesto"
              className="block text-muted-foreground font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Manifesto
            </a>
            <Link
              to="/sobre"
              className="block text-muted-foreground font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre Nós
            </Link>
            <Link
              to="/servicos"
              className="block text-muted-foreground font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Serviços
            </Link>
            <a href="#faq" className="block text-muted-foreground font-medium" onClick={() => setIsMenuOpen(false)}>
              FAQ
            </a>
            <Link
              to="/app"
              className="block w-full bg-primary text-primary-foreground text-center py-3 rounded-xl font-bold"
            >
              Acessar App
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div 
            ref={heroSection.ref}
            className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
              heroSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Text */}
            <div className="max-w-2xl">
              <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent text-xs font-bold tracking-wide mb-6 border border-accent/20">
                ❤️ O App da Mãe Atípica
              </span>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
                Quem cuida de <br />
                <span className="text-transparent bg-clip-text bg-gradient-hero">quem cuida?</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                O primeiro ecossistema que organiza a saúde do seu filho, conecta você a outras mães e ajuda a gerar
                renda extra. Tudo num só lugar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/auth"
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:-translate-y-1 transition flex items-center justify-center gap-2"
                >
                  <Smartphone size={20} /> Começar Agora
                </Link>
                <button className="bg-card text-primary border border-border px-8 py-4 rounded-full font-bold text-lg hover:bg-muted transition flex items-center justify-center gap-2">
                  Ver como funciona
                </button>
              </div>

              <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold bg-cover"
                      style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})` }}
                    ></div>
                  ))}
                </div>
                <p>Usado por +5.000 mães atípicas no Brasil</p>
              </div>
            </div>

            {/* App Mockup */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
              <div className="relative z-10 bg-card rounded-[3rem] border-8 border-foreground shadow-2xl w-[300px] h-[600px] overflow-hidden">
                <div className="h-full w-full bg-background flex flex-col">
                  <div className="bg-gradient-morning h-32 rounded-b-[30px] p-6 text-white pt-12">
                    <p className="text-xs opacity-80">Bom dia, Ana</p>
                    <h3 className="text-lg font-bold mt-1">Vamos cuidar?</h3>
                  </div>
                  <div className="p-4 -mt-6 space-y-3">
                    <div className="bg-card p-3 rounded-xl shadow-sm flex items-center gap-3 border border-border">
                      <div className="bg-destructive/10 p-2 rounded-full text-destructive">
                        <Zap size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Alerta de Padrão</p>
                        <p className="text-[10px] text-muted-foreground">Agitação pós-remédio detectada.</p>
                      </div>
                    </div>
                    <div className="bg-card p-3 rounded-xl shadow-sm flex items-center gap-3 border border-border">
                      <div className="bg-success/10 p-2 rounded-full text-success">
                        <ShoppingBag size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Você vendeu!</p>
                        <p className="text-[10px] text-muted-foreground">+ R$ 45,00 (Kit Visual)</p>
                      </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-dashed border-border text-center text-muted-foreground text-xs mt-4">
                      Gráfico de evolução aqui...
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute top-20 -right-4 bg-card p-4 rounded-2xl shadow-xl border border-border animate-bounce-soft">
                <div className="flex items-center gap-2">
                  <div className="bg-success/10 p-2 rounded-full text-success">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Tribo Encontrada</p>
                    <p className="text-[10px] text-muted-foreground">Carla (filho 6 anos) está online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section id="manifesto" className="py-24 lg:py-32 relative overflow-hidden">
        {/* Background with soft image overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=2070&auto=format&fit=crop")`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-primary/5 to-background"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div 
            ref={manifestoSection.ref}
            className={`transition-all duration-1000 ${
              manifestoSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Decorative Quote Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Quote size={32} className="text-accent" />
              </div>
            </div>

            {/* Title */}
            <h2 className="font-cormorant text-3xl md:text-4xl lg:text-5xl font-semibold text-center text-foreground mb-4 leading-tight">
              Manifesto: O Nosso Acolhimento à Mãe Atípica
            </h2>
            
            <p className="font-lora text-xl md:text-2xl text-center text-accent italic mb-12">
              "Porque antes de ser 'mãe de...', você é você."
            </p>

            {/* Main Content */}
            <div className="bg-card/90 backdrop-blur-md rounded-3xl p-10 md:p-14 lg:p-20 shadow-2xl border border-border/30 space-y-10">
              <p className="font-lora text-lg md:text-xl text-muted-foreground leading-relaxed text-center">
                A jornada de uma mãe atípica é feita de silêncios que poucos ouvem e de uma força que ninguém deveria ter que sustentar sozinha.
              </p>

              <p className="font-lora text-base md:text-lg text-muted-foreground leading-relaxed">
                Nós sabemos que o seu dia não termina quando o sol se põe. Sabemos que a sua mente é um arquivo vivo de laudos, horários de terapias, lutas por direitos e a busca incessante pelo bem-estar do seu filho. Mas aqui, no Centro de Cuidados Acolher, a nossa pergunta é outra:
              </p>

              <p className="font-cormorant text-2xl md:text-3xl text-primary font-semibold text-center py-4">
                "E como está você, mãe?"
              </p>

              {/* Understanding Section */}
              <div className="space-y-4">
                <h3 className="font-cormorant text-xl md:text-2xl font-semibold text-foreground">
                  Nós entendemos que:
                </h3>
                <ul className="font-lora text-base md:text-lg text-muted-foreground space-y-3">
                  <li className="flex items-start gap-3">
                    <Heart size={20} className="text-accent mt-1 flex-shrink-0" fill="currentColor" />
                    <span>O diagnóstico não veio só para o seu filho, ele mudou o seu mundo.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart size={20} className="text-accent mt-1 flex-shrink-0" fill="currentColor" />
                    <span>A exaustão física é real, mas a exaustão emocional de ser "a fortaleza" o tempo todo é ainda maior.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart size={20} className="text-accent mt-1 flex-shrink-0" fill="currentColor" />
                    <span>A solidão pode aparecer mesmo rodeada de médicos e terapeutas.</span>
                  </li>
                </ul>
              </div>

              {/* Commitment Section */}
              <div className="space-y-4">
                <h3 className="font-cormorant text-xl md:text-2xl font-semibold text-foreground">
                  O nosso compromisso com você:
                </h3>
                <p className="font-lora text-base md:text-lg text-muted-foreground leading-relaxed">
                  Aqui, não olhamos apenas para a patologia ou para a deficiência. Olhamos para a mulher que sustenta essa jornada. Oferecemos um porto seguro para que você possa:
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-background/50 rounded-2xl p-6 text-center border border-border/30">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart size={24} className="text-primary" />
                    </div>
                    <h4 className="font-cormorant text-lg font-semibold text-foreground mb-2">Validar as suas emoções</h4>
                    <p className="font-lora text-sm text-muted-foreground">
                      Onde o cansaço não é pecado e a sua dor é respeitada.
                    </p>
                  </div>
                  
                  <div className="bg-background/50 rounded-2xl p-6 text-center border border-border/30">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users size={24} className="text-accent" />
                    </div>
                    <h4 className="font-cormorant text-lg font-semibold text-foreground mb-2">Encontrar Comunidade</h4>
                    <p className="font-lora text-sm text-muted-foreground">
                      Porque a jornada atípica é pesada demais para um par de ombros só.
                    </p>
                  </div>
                  
                  <div className="bg-background/50 rounded-2xl p-6 text-center border border-border/30">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star size={24} className="text-success" />
                    </div>
                    <h4 className="font-cormorant text-lg font-semibold text-foreground mb-2">Resgatar a sua Identidade</h4>
                    <p className="font-lora text-sm text-muted-foreground">
                      Para que você se lembre que, além de cuidadora, você tem sonhos, voz e merece ser cuidada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Closing Message */}
              <div className="text-center pt-6 border-t border-border/30">
                <p className="font-lora text-lg md:text-xl text-foreground font-medium mb-8">
                  Você não precisa dar conta de tudo sozinha.<br />
                  <span className="text-primary">Deixe-nos acolher quem sempre acolhe todos os outros.</span>
                </p>

                {/* WhatsApp CTA Button */}
                <a 
                  href="https://wa.me/5511961226754?text=Olá!%20Sou%20mãe%20atípica%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20acolhimento%20do%20Centro."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5C] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <MessageCircle size={24} />
                  Preciso de apoio. Vamos conversar?
                </a>
              </div>

              {/* Poetic Closing */}
              <div className="pt-8 text-center">
                <p className="font-cormorant text-xl md:text-2xl italic text-accent/80">
                  "A tipicidade do amor é saber florescer no terreno que a vida nos deu."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - PCH Style */}
      <section id="funcionalidades" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={featuresSection.ref}
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
              featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Não oferecemos ferramentas.<br />
              <span className="text-primary">Oferecemos paz de espírito.</span>
            </h2>
            <p className="text-muted-foreground">
              A maternidade atípica exige a gestão de uma empresa multinacional. O Acolher simplifica o caos para que
              você possa ser <span className="italic">apenas</span> mãe.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Olhos Sentinelas */}
            <div className="bg-card p-8 rounded-3xl shadow-sm hover:shadow-md transition border border-border group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <Zap size={32} />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Inteligência de Saúde</p>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                Olhos Sentinelas
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nossa IA não dorme, para que você possa. Ela cruza dados, detecta padrões e gera relatórios prontos — você só precisa mostrar ao médico.
              </p>
            </div>

            {/* Feature 2 - Tribo de Apoio */}
            <div className="bg-card p-8 rounded-3xl shadow-sm hover:shadow-md transition border border-border group">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
                <Heart size={32} />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Tribo & SOS</p>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                O Fim da Solidão
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sentir-se sozinha é a maior dor invisível. O algoritmo "Twin Mom" encontra mães com filhos do mesmo perfil. Você nunca mais caminha só.
              </p>
            </div>

            {/* Feature 3 - Marketplace */}
            <div className="bg-card p-8 rounded-3xl shadow-sm hover:shadow-md transition border border-border relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-success text-success-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                NOVIDADE
              </div>
              <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center text-success mb-6">
                <ShoppingBag size={32} />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Economia Circular</p>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-success transition-colors">
                Sua Experiência Vale Ouro
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Transforme anos de adaptações em renda. Venda materiais, consultorias ou artesanato. Sua dor vira propósito — e retorno financeiro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="video" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={videoSection.ref}
            className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-1000 ${
              videoSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Veja o Acolher em Ação</h2>
            <p className="text-muted-foreground">Descubra como o app funciona na prática e como pode transformar sua rotina.</p>
          </div>

          <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-200 ${
            videoSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
              {/* Video Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-black/20"></div>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="relative z-10 w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                >
                  {isPlaying ? <Pause className="text-primary" size={32} /> : <Play className="text-primary ml-1" size={32} />}
                </button>
                
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between text-white">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-primary transition">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div className="flex-1 mx-4 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-1/3"></div>
                    </div>
                    <button onClick={() => setIsMuted(!isMuted)} className="hover:text-primary transition">
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Transcript */}
              <div className="bg-muted/50 p-6 border-t border-border">
                <details className="group">
                  <summary className="font-bold text-foreground cursor-pointer list-none flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Shield size={16} className="text-primary" />
                      Transcrição (Acessibilidade)
                    </span>
                    <ChevronDown className="text-muted-foreground group-open:rotate-180 transition-transform" size={20} />
                  </summary>
                  <div className="mt-4 text-sm text-muted-foreground space-y-2 leading-relaxed">
                    <p><strong>00:00 - 00:15:</strong> Olá, sou Ana, mãe do Lucas. Vou mostrar como o Acolher transformou nossa rotina.</p>
                    <p><strong>00:15 - 00:35:</strong> Todo dia, registro as atividades do Lucas com um clique: medicação, humor, terapias. Leva segundos.</p>
                    <p><strong>00:35 - 00:55:</strong> A IA detectou que ele fica agitado após o remédio da manhã. Mostrei isso ao médico e ajustamos a dose.</p>
                    <p><strong>00:55 - 01:15:</strong> Também conectei com outras mães na comunidade. Encontrei a Carla, que tem um filho da mesma idade. Nos apoiamos diariamente.</p>
                    <p><strong>01:15 - 01:30:</strong> E ainda vendo meus materiais adaptados no marketplace. Já ganhei R$ 450 esse mês!</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={faqSection.ref}
            className={`text-center mb-12 transition-all duration-1000 ${
              faqSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Perguntas Frequentes</h2>
            <p className="text-muted-foreground">Tudo que você precisa saber sobre o Acolher.</p>
          </div>

          <div className={`transition-all duration-1000 delay-200 ${
            faqSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-card rounded-xl border border-border px-6">
                <AccordionTrigger className="text-left font-bold text-foreground hover:text-primary">
                  O app é realmente gratuito?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Sim! O Acolher é 100% gratuito para funcionalidades essenciais: registro de atividades, relatórios básicos e acesso à comunidade. 
                  Temos um plano Premium opcional (R$ 19,90/mês) com IA avançada, relatórios PDF ilimitados e prioridade no SOS.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-card rounded-xl border border-border px-6">
                <AccordionTrigger className="text-left font-bold text-foreground hover:text-primary">
                  Meus dados médicos estão seguros?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Absolutamente. Somos certificados pela LGPD e usamos criptografia de ponta a ponta. Seus dados nunca são vendidos e você pode exportar ou deletar tudo a qualquer momento. 
                  Os relatórios médicos são privados e só você decide com quem compartilhar.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-card rounded-xl border border-border px-6">
                <AccordionTrigger className="text-left font-bold text-foreground hover:text-primary">
                  Como funciona o Marketplace?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Você pode vender produtos físicos (materiais adaptados, artesanato) ou digitais (PDFs, consultorias) para outras mães. 
                  Cobramos apenas 12% de taxa por venda (incluindo pagamento seguro). Você recebe o dinheiro direto na sua conta em até 14 dias.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-card rounded-xl border border-border px-6">
                <AccordionTrigger className="text-left font-bold text-foreground hover:text-primary">
                  A IA realmente funciona? Como ela detecta padrões?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Sim! Nossa IA analisa seus registros diários (medicação, humor, crises, sono) e identifica correlações. Por exemplo: "agitação sempre 40min após remédio X". 
                  Quanto mais você registra, mais precisa ela fica. Mas lembre-se: a IA sugere, o médico decide.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-card rounded-xl border border-border px-6">
                <AccordionTrigger className="text-left font-bold text-foreground hover:text-primary">
                  Funciona offline?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Sim! Você pode registrar atividades sem internet. Assim que reconectar, tudo sincroniza automaticamente na nuvem. 
                  Perfeito para quem passa muito tempo em hospitais ou clínicas com sinal ruim.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-card rounded-xl border border-border px-6">
                <AccordionTrigger className="text-left font-bold text-foreground hover:text-primary">
                  Posso cadastrar mais de um filho?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Sim! Você pode adicionar perfis ilimitados de filhos, cada um com seu próprio histórico, medicações e relatórios. 
                  Ideal para mães de múltiplos ou para profissionais que atendem várias crianças.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section id="depoimentos" className="py-20 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={testimonialSection.ref}
            className={`bg-primary rounded-[3rem] p-8 md:p-16 relative overflow-hidden transition-all duration-1000 ${
              testimonialSection.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
              <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#FFFFFF"
                  d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,31.3C59,41.1,47.1,47.8,35.6,55.4C24.1,63,13,71.5,-0.2,71.8C-13.4,72.1,-25.6,64.2,-37.5,56.9C-49.4,49.6,-61,42.9,-69.7,33.3C-78.4,23.7,-84.2,11.2,-83.2,-0.9C-82.2,-13,-74.4,-24.7,-65.1,-34.8C-55.8,-44.9,-45,-53.4,-33.5,-62.3C-22,-71.2,-9.8,-80.5,3.2,-86.1C16.3,-91.6,30.5,-83.6,44.7,-76.4Z"
                  transform="translate(100 100)"
                />
              </svg>
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={20} className="text-warning fill-warning" />
                  ))}
                </div>
                <h3 className="text-3xl font-bold text-primary-foreground mb-6">
                  "O Acolher salvou a consulta médica do Lucas."
                </h3>
                <p className="text-primary-foreground/90 text-lg leading-relaxed mb-8 italic">
                  "Eu sempre esquecia de contar ao médico que o Lucas ficava agitado depois do remédio. O App não só me
                  lembrou de anotar, como a IA detectou o padrão sozinha. Mostrei o relatório PDF e o médico ajustou a
                  dose na hora. Finalmente sinto que estou no controle."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                    A
                  </div>
                  <div>
                    <p className="text-primary-foreground font-bold">Ana M.</p>
                    <p className="text-primary-foreground/70 text-sm">Mãe do Lucas (7 anos, Síndrome de Down)</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-2xl p-6 text-center">
                  <p className="text-primary-foreground/80 text-sm mb-2">Insight Gerado pelo App:</p>
                  <div className="bg-card rounded-xl p-4 text-foreground shadow-lg text-left">
                    <div className="flex gap-2 items-center mb-2 text-destructive font-bold text-xs uppercase">
                      <Zap size={14} /> Padrão Detectado
                    </div>
                    <p className="text-sm">
                      A agitação aumenta 40min após a medicação matinal em 85% dos dias registrados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="mercado" className="py-20 bg-gradient-to-b from-success/10 to-background">
        <div 
          ref={marketSection.ref}
          className={`max-w-7xl mx-auto px-4 text-center transition-all duration-1000 ${
            marketSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="text-success font-bold text-sm uppercase tracking-wider">Economia Circular</span>
          <h2 className="text-3xl font-bold text-foreground mt-2 mb-6">Sua experiência vale dinheiro</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Você cria materiais adaptados para o seu filho? Venda para quem precisa.
            <br />O Acolher é a vitrine da mãe empreendedora.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { t: "Kit Visual", p: "R$ 45" },
              { t: "Mordedor", p: "R$ 28" },
              { t: "Mentoria BPC", p: "R$ 90" },
              { t: "Agenda", p: "R$ 35" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card p-4 rounded-2xl shadow-sm hover:-translate-y-2 transition duration-300 border border-border"
              >
                <div className="h-32 bg-muted rounded-xl mb-4 flex items-center justify-center text-muted-foreground">
                  <ShoppingBag size={32} />
                </div>
                <h4 className="font-bold text-foreground">{item.t}</h4>
                <p className="text-success font-bold">{item.p}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              to="/app"
              className="inline-block bg-success text-success-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:bg-success/90 transition"
            >
              Quero vender meus produtos
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - PCH Style */}
      <section className="py-20 bg-background">
        <div 
          ref={ctaSection.ref}
          className={`max-w-4xl mx-auto px-4 text-center transition-all duration-1000 ${
            ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl font-bold text-foreground mb-6">
            O primeiro passo é o mais difícil.<br />
            <span className="text-primary">Deixe-nos dar a mão.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Junte-se a milhares de mães que trocaram a solidão pela comunidade. <br />
            Grátis para começar. Essencial para respirar mais leve.
          </p>

          <form
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-8"
            onSubmit={handleSubscribe}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              className="flex-1 px-6 py-4 rounded-full border border-border bg-muted outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition shadow-lg"
            >
              Quero Paz de Espírito
            </button>
          </form>

          <p className="text-xs text-muted-foreground">
            Disponível em breve para iOS e Android. <br />
            Ao se inscrever, você ganha 6 meses de Premium no lançamento.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-muted-foreground py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-background mb-4">
              <Heart size={20} fill="currentColor" className="text-primary" />
              <span className="font-bold text-xl">Acolher</span>
            </div>
            <p className="text-sm mb-6 max-w-xs">
              A plataforma de empoderamento para a maternidade atípica. Saúde, renda e comunidade.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary cursor-pointer transition text-xs font-bold">
                IG
              </div>
              <div className="w-8 h-8 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary cursor-pointer transition text-xs font-bold">
                LI
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-background font-bold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#funcionalidades" className="hover:text-background">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background">
                  Para Clínicas (B2B)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background">
                  Planos e Preços
                </a>
              </li>
              <li>
                <Link to="/app?openPartners=true" className="hover:text-background flex items-center gap-1">
                  <Handshake size={14} />
                  Parceiros & Apoiadores
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-background font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-background">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background">
                  LGPD
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-background/10 text-center text-xs">
          <p>© 2025 Acolher Tecnologia Ltda. Todos os direitos reservados. Feito com ❤️ no Brasil.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
