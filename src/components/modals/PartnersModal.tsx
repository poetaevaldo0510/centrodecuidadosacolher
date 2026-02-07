import { useState } from 'react';
import { Heart, Star, Users, ExternalLink, Gift, Trophy, Handshake, Send, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ModalBase from './ModalBase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const typeIcons: Record<string, { icon: typeof Trophy; color: string; bgColor: string; label: string }> = {
  apoiador_ouro: { icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-50', label: 'Apoiador Ouro' },
  parceiro_clinico: { icon: Heart, color: 'text-rose-500', bgColor: 'bg-rose-50', label: 'Parceiro Clínico' },
  parceiro_comercial: { icon: Gift, color: 'text-purple-500', bgColor: 'bg-purple-50', label: 'Parceiro Comercial' },
  apoiador: { icon: Heart, color: 'text-primary', bgColor: 'bg-primary/10', label: 'Apoiador' },
};

const PartnersModal = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    inquiry_type: '',
    message: '',
  });
  const queryClient = useQueryClient();

  // Fetch partners from database
  const { data: partners, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Submit partnership inquiry
  const submitInquiry = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('partnership_inquiries')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Solicitação enviada com sucesso! Entraremos em contato em breve.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        inquiry_type: '',
        message: '',
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['partnership_inquiries'] });
    },
    onError: () => {
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.inquiry_type) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }
    submitInquiry.mutate(formData);
  };

  const benefits = [
    'Visibilidade para milhares de famílias',
    'Badge exclusivo de apoiador',
    'Destaque no marketplace',
    'Networking com profissionais',
  ];

  const getTypeInfo = (type: string) => {
    return typeIcons[type] || typeIcons.apoiador;
  };

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
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : partners && partners.length > 0 ? (
            partners.map((partner) => {
              const typeInfo = getTypeInfo(partner.type);
              const Icon = typeInfo.icon;
              return (
                <div
                  key={partner.id}
                  className={`p-4 rounded-xl border border-border ${typeInfo.bgColor} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    {partner.logo_url ? (
                      <img 
                        src={partner.logo_url} 
                        alt={partner.name} 
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className={`p-2 rounded-lg bg-background ${typeInfo.color}`}>
                        <Icon size={20} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h6 className="font-semibold text-foreground">{partner.name}</h6>
                        <Badge variant="secondary" className="text-xs">
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {partner.description}
                      </p>
                      {partner.website_url && (
                        <a 
                          href={partner.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
                        >
                          <ExternalLink size={12} />
                          Visitar site
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum parceiro cadastrado ainda.
            </p>
          )}
        </div>

        {/* Contact Form Section */}
        {!showForm ? (
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

            <Button 
              className="w-full gap-2"
              onClick={() => setShowForm(true)}
            >
              <Send size={16} />
              Quero ser Parceiro
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 bg-muted/50 rounded-xl border border-border space-y-4">
            <h5 className="font-medium text-foreground flex items-center gap-2">
              <Send className="text-primary" size={18} />
              Formulário de Interesse
            </h5>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa/Instituição</Label>
                <Input
                  id="company"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Parceria *</Label>
                <Select
                  value={formData.inquiry_type}
                  onValueChange={(value) => setFormData({ ...formData, inquiry_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apoiador">Apoiador</SelectItem>
                    <SelectItem value="parceiro_comercial">Parceiro Comercial</SelectItem>
                    <SelectItem value="parceiro_clinico">Parceiro Clínico</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Conte-nos mais sobre você e seu interesse..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 gap-2"
                disabled={submitInquiry.isPending}
              >
                {submitInquiry.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Send size={16} />
                )}
                Enviar
              </Button>
            </div>
          </form>
        )}

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
