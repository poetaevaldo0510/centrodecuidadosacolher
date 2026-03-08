import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermosDeUso = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Termos de Uso</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">Última atualização: 08 de março de 2026</p>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar a plataforma Acolher ("Plataforma"), você concorda integralmente com estes Termos de Uso.
            Caso não concorde com qualquer disposição, recomendamos que não utilize nossos serviços.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Descrição da Plataforma</h2>
          <p>
            A Acolher é um ecossistema digital voltado para famílias de crianças com necessidades especiais, oferecendo
            funcionalidades como rastreamento de rotinas, comunidade de apoio, marketplace de produtos e serviços,
            biblioteca de recursos educacionais, calendário inteligente e diretório de profissionais.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">3. Cadastro e Conta</h2>
          <p>
            Para utilizar a Plataforma, é necessário criar uma conta fornecendo informações verdadeiras, completas e atualizadas.
            Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
          </p>
          <p>
            A Acolher reserva-se o direito de suspender ou encerrar contas que violem estes Termos, conforme previsto na
            Lei nº 12.965/2014 (Marco Civil da Internet).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">4. Uso Aceitável</h2>
          <p>Ao utilizar a Plataforma, você se compromete a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Não publicar conteúdo ilegal, ofensivo, discriminatório ou que viole direitos de terceiros;</li>
            <li>Não utilizar a Plataforma para fins comerciais não autorizados;</li>
            <li>Respeitar a privacidade e dignidade de outros usuários;</li>
            <li>Não tentar acessar áreas restritas ou comprometer a segurança da Plataforma;</li>
            <li>Não compartilhar informações médicas de terceiros sem consentimento.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">5. Marketplace</h2>
          <p>
            A Plataforma disponibiliza um marketplace onde usuários podem comercializar produtos e serviços.
            A Acolher retém uma comissão de 10% sobre cada transação realizada. Os vendedores são integralmente
            responsáveis pela qualidade, entrega e garantia de seus produtos e serviços.
          </p>
          <p>
            A Acolher não se responsabiliza por disputas entre compradores e vendedores, mas oferece mecanismos
            de mediação e moderação de conteúdo.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">6. Programa de Afiliados</h2>
          <p>
            O programa de afiliados oferece comissões progressivas de 5% a 8%, calculadas automaticamente
            com base no volume de vendas geradas. A Acolher reserva-se o direito de alterar as taxas de
            comissão mediante aviso prévio de 30 dias.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">7. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo da Plataforma (textos, imagens, logos, software) é protegido por direitos autorais
            conforme a Lei nº 9.610/1998. O conteúdo gerado por usuários permanece de propriedade de seus autores,
            sendo concedida à Acolher uma licença não exclusiva para exibição dentro da Plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">8. Limitação de Responsabilidade</h2>
          <p>
            A Acolher não oferece aconselhamento médico, terapêutico ou jurídico. As informações disponibilizadas
            na biblioteca de recursos têm caráter educacional e informativo. Sempre consulte profissionais qualificados
            para orientações específicas sobre a saúde e desenvolvimento de seu filho.
          </p>
          <p>
            A Plataforma é fornecida "como está", sem garantias de disponibilidade ininterrupta ou ausência de erros.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">9. Moderação de Conteúdo</h2>
          <p>
            A Acolher utiliza sistemas de moderação para manter um ambiente seguro e acolhedor. Conteúdos que violem
            estes Termos podem ser removidos sem aviso prévio. Usuários reincidentes podem ter suas contas suspensas
            temporária ou permanentemente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">10. Alterações nos Termos</h2>
          <p>
            A Acolher pode alterar estes Termos a qualquer momento, notificando os usuários por meio da Plataforma
            ou por e-mail. O uso continuado após a notificação constitui aceitação das alterações.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">11. Lei Aplicável e Foro</h2>
          <p>
            Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca do domicílio do usuário
            para dirimir quaisquer controvérsias, conforme o art. 101, I, do Código de Defesa do Consumidor
            (Lei nº 8.078/1990).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">12. Contato</h2>
          <p>
            Para dúvidas, sugestões ou solicitações relacionadas a estes Termos, entre em contato através dos
            canais de suporte disponíveis na Plataforma.
          </p>
        </section>
      </main>
    </div>
  );
};

export default TermosDeUso;
