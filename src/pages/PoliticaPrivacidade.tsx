import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PoliticaPrivacidade = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Política de Privacidade</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">Última atualização: 08 de março de 2026</p>

        <p>
          A Acolher ("nós") valoriza a privacidade dos seus usuários e está comprometida com a proteção de dados
          pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).
        </p>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. Dados que Coletamos</h2>
          <p>Coletamos os seguintes tipos de dados pessoais:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Dados de identificação:</strong> nome, e-mail, foto de perfil (quando fornecida);</li>
            <li><strong>Dados de uso:</strong> rotinas cadastradas, registros de evolução, eventos do calendário;</li>
            <li><strong>Dados de navegação:</strong> páginas acessadas, tempo de uso, tipo de dispositivo;</li>
            <li><strong>Dados de comunicação:</strong> mensagens trocadas no chat da plataforma;</li>
            <li><strong>Dados de transação:</strong> informações de compras e vendas no marketplace;</li>
            <li><strong>Dados sensíveis:</strong> informações sobre saúde e desenvolvimento de crianças, coletados apenas com consentimento expresso do titular ou responsável legal.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Base Legal para Tratamento</h2>
          <p>Tratamos seus dados com base nas seguintes hipóteses legais (art. 7º da LGPD):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Consentimento:</strong> para dados sensíveis e comunicações de marketing;</li>
            <li><strong>Execução de contrato:</strong> para prestação dos serviços da plataforma;</li>
            <li><strong>Legítimo interesse:</strong> para melhoria dos serviços e segurança da plataforma;</li>
            <li><strong>Cumprimento de obrigação legal:</strong> quando exigido por lei ou regulamentação.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">3. Finalidade do Tratamento</h2>
          <p>Utilizamos seus dados para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fornecer e melhorar os serviços da plataforma;</li>
            <li>Personalizar sua experiência de uso;</li>
            <li>Processar transações no marketplace;</li>
            <li>Enviar notificações e lembretes configurados por você;</li>
            <li>Garantir a segurança e integridade da plataforma;</li>
            <li>Cumprir obrigações legais e regulatórias.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">4. Compartilhamento de Dados</h2>
          <p>Seus dados podem ser compartilhados com:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Provedores de infraestrutura:</strong> serviços de hospedagem e banco de dados para funcionamento da plataforma;</li>
            <li><strong>Processadores de pagamento:</strong> para viabilizar transações no marketplace;</li>
            <li><strong>Autoridades competentes:</strong> quando exigido por lei ou ordem judicial.</li>
          </ul>
          <p>
            <strong>Não vendemos seus dados pessoais.</strong> A comunidade da plataforma utiliza nomes anônimos
            para proteger a identidade dos usuários.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">5. Seus Direitos (Art. 18 da LGPD)</h2>
          <p>Você tem direito a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Confirmar a existência de tratamento de seus dados;</li>
            <li>Acessar seus dados pessoais;</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
            <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>Solicitar portabilidade dos dados;</li>
            <li>Revogar o consentimento a qualquer momento;</li>
            <li>Solicitar a eliminação dos dados tratados com base no consentimento.</li>
          </ul>
          <p>
            Para exercer seus direitos, utilize os canais de suporte disponíveis na plataforma ou envie uma
            solicitação através das configurações do seu perfil.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">6. Cookies e Tecnologias de Rastreamento</h2>
          <p>Utilizamos cookies e tecnologias similares para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Cookies essenciais:</strong> necessários para o funcionamento da plataforma (autenticação, sessão);</li>
            <li><strong>Cookies de desempenho:</strong> para analisar o uso e melhorar a experiência;</li>
            <li><strong>Cookies de funcionalidade:</strong> para lembrar suas preferências (tema, configurações).</li>
          </ul>
          <p>
            Você pode gerenciar suas preferências de cookies através do banner de consentimento exibido no primeiro
            acesso ou nas configurações do seu navegador.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">7. Segurança dos Dados</h2>
          <p>
            Adotamos medidas técnicas e administrativas para proteger seus dados, incluindo criptografia em trânsito (TLS),
            controle de acesso baseado em funções (RLS), autenticação segura e monitoramento de atividades suspeitas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">8. Retenção de Dados</h2>
          <p>
            Seus dados são armazenados enquanto sua conta estiver ativa ou pelo período necessário para cumprir as
            finalidades descritas nesta Política. Após a exclusão da conta, seus dados serão eliminados ou anonimizados
            em até 30 dias, exceto quando a retenção for necessária por obrigação legal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">9. Dados de Menores</h2>
          <p>
            A plataforma trata dados de crianças e adolescentes exclusivamente com o consentimento expresso de pelo
            menos um dos pais ou responsável legal, conforme o art. 14 da LGPD. Esses dados são tratados com
            proteção reforçada e utilizados exclusivamente no melhor interesse da criança.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">10. Encarregado de Proteção de Dados (DPO)</h2>
          <p>
            Para questões relacionadas à proteção de dados pessoais, entre em contato com nosso Encarregado
            de Proteção de Dados através dos canais de suporte da plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">11. Alterações nesta Política</h2>
          <p>
            Esta Política pode ser atualizada periodicamente. Notificaremos sobre alterações significativas por
            meio da plataforma ou por e-mail. Recomendamos a revisão periódica deste documento.
          </p>
        </section>
      </main>
    </div>
  );
};

export default PoliticaPrivacidade;
