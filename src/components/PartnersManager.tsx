import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Loader2, Upload, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Partner {
  id: string;
  name: string;
  type: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  inquiry_type: string;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const partnerTypes = [
  { value: 'apoiador_ouro', label: 'Apoiador Ouro' },
  { value: 'parceiro_clinico', label: 'Parceiro Clínico' },
  { value: 'parceiro_comercial', label: 'Parceiro Comercial' },
  { value: 'apoiador', label: 'Apoiador' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const PartnersManager = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'apoiador',
    description: '',
    logo_url: '',
    website_url: '',
    is_active: true,
    display_order: 0,
  });

  // Fetch partners
  const { data: partners, isLoading: loadingPartners } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Partner[];
    },
  });

  // Fetch inquiries
  const { data: inquiries, isLoading: loadingInquiries } = useQuery({
    queryKey: ['partnership-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partnership_inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Inquiry[];
    },
  });

  // Create/Update partner mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingPartner) {
        const { error } = await supabase
          .from('partners')
          .update(data)
          .eq('id', editingPartner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('partners')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingPartner ? 'Parceiro atualizado!' : 'Parceiro criado!');
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      resetForm();
    },
    onError: () => toast.error('Erro ao salvar parceiro'),
  });

  // Delete partner mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Parceiro removido!');
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
    onError: () => toast.error('Erro ao remover parceiro'),
  });

  // Update inquiry status mutation
  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { error } = await supabase
        .from('partnership_inquiries')
        .update({ status, admin_notes })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status atualizado!');
      queryClient.invalidateQueries({ queryKey: ['partnership-inquiries'] });
    },
    onError: () => toast.error('Erro ao atualizar status'),
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('partner-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('partner-logos')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success('Logo carregado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar logo');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'apoiador',
      description: '',
      logo_url: '',
      website_url: '',
      is_active: true,
      display_order: 0,
    });
    setEditingPartner(null);
    setShowForm(false);
  };

  const openEditForm = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      type: partner.type,
      description: partner.description || '',
      logo_url: partner.logo_url || '',
      website_url: partner.website_url || '',
      is_active: partner.is_active,
      display_order: partner.display_order,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    saveMutation.mutate(formData);
  };

  const pendingCount = inquiries?.filter(i => i.status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="partners" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="partners">Parceiros</TabsTrigger>
          <TabsTrigger value="inquiries" className="relative">
            Solicitações
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">
              Gerenciar Parceiros ({partners?.length || 0})
            </h3>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus size={16} />
              Novo Parceiro
            </Button>
          </div>

          {loadingPartners ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : partners && partners.length > 0 ? (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        {partner.logo_url ? (
                          <img src={partner.logo_url} alt={partner.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xs font-bold">
                            {partner.name.charAt(0)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {partnerTypes.find(t => t.value === partner.type)?.label || partner.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={partner.is_active ? "default" : "secondary"}>
                          {partner.is_active ? <><Eye size={12} className="mr-1" /> Ativo</> : <><EyeOff size={12} className="mr-1" /> Inativo</>}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditForm(partner)}>
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(partner.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum parceiro cadastrado. Clique em "Novo Parceiro" para começar.
            </div>
          )}
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Solicitações de Parceria ({inquiries?.length || 0})
          </h3>

          {loadingInquiries ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : inquiries && inquiries.length > 0 ? (
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-card p-4 rounded-xl border border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{inquiry.name}</span>
                        <Badge className={statusColors[inquiry.status]}>
                          {inquiry.status === 'pending' ? 'Pendente' : 
                           inquiry.status === 'contacted' ? 'Contatado' :
                           inquiry.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                      {inquiry.company_name && (
                        <p className="text-sm text-foreground">Empresa: {inquiry.company_name}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Tipo: {inquiry.inquiry_type}</p>
                      {inquiry.message && (
                        <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded-lg">
                          {inquiry.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(inquiry.created_at).toLocaleDateString('pt-BR', { 
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <Select
                      value={inquiry.status}
                      onValueChange={(value) => updateInquiryMutation.mutate({ id: inquiry.id, status: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="contacted">Contatado</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma solicitação recebida ainda.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Partner Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do parceiro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {partnerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição breve do parceiro"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="text-muted-foreground" size={20} />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Ordem de Exibição</Label>
              <Input
                id="order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="is_active">Parceiro ativo (visível no app)</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={saveMutation.isPending || uploading}>
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnersManager;
