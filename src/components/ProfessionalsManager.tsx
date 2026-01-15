import { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Users, 
  Stethoscope, 
  Heart, 
  Phone, 
  Mail, 
  FileText,
  Trash2,
  Edit2,
  Check,
  X,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Professional {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  professional_type: string;
  license_number: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

const PROFESSIONAL_TYPES = [
  { value: 'enfermeira', label: 'Enfermeira(o)', icon: Stethoscope },
  { value: 'cuidador', label: 'Cuidador(a)', icon: Heart },
  { value: 'terapeuta', label: 'Terapeuta', icon: Users },
  { value: 'outro', label: 'Outro', icon: Users }
];

const ProfessionalsManager = () => {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('cuidador');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      loadProfessionals();
    }
  }, [user]);

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('parent_user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setType('cuidador');
    setLicenseNumber('');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      toast.error('Digite o nome do profissional');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('professionals')
          .update({
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
            professional_type: type,
            license_number: licenseNumber.trim() || null,
            notes: notes.trim() || null
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Profissional atualizado!');
      } else {
        // Create new - we use parent_user_id to link to the parent
        // and user_id can be the same initially until the professional creates their own account
        const { error } = await supabase
          .from('professionals')
          .insert({
            parent_user_id: user.id,
            user_id: user.id, // Can be updated later when professional creates account
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
            professional_type: type,
            license_number: licenseNumber.trim() || null,
            notes: notes.trim() || null
          });

        if (error) throw error;
        toast.success('Profissional cadastrado!');
      }

      resetForm();
      loadProfessionals();
    } catch (error: any) {
      console.error('Error saving professional:', error);
      toast.error(error.message || 'Erro ao salvar profissional');
    } finally {
      setSubmitting(false);
    }
  };

  const editProfessional = (prof: Professional) => {
    setEditingId(prof.id);
    setName(prof.name);
    setEmail(prof.email || '');
    setPhone(prof.phone || '');
    setType(prof.professional_type);
    setLicenseNumber(prof.license_number || '');
    setNotes(prof.notes || '');
    setShowForm(true);
  };

  const deleteProfessional = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este profissional?')) return;

    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Profissional removido');
      loadProfessionals();
    } catch (error) {
      toast.error('Erro ao remover profissional');
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentState ? 'Profissional desativado' : 'Profissional ativado');
      loadProfessionals();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const getTypeInfo = (typeValue: string) => {
    return PROFESSIONAL_TYPES.find(t => t.value === typeValue) || PROFESSIONAL_TYPES[3];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-card p-6 rounded-b-[40px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/20 p-3 rounded-xl backdrop-blur-sm">
            <Users size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profissionais</h1>
            <p className="text-sm text-muted-foreground">Cadastre enfermeiras e cuidadores</p>
          </div>
        </div>

        <div className="bg-primary/10 backdrop-blur-sm p-4 rounded-2xl">
          <p className="text-sm text-muted-foreground">
            Cadastre profissionais que acompanham seu filho para que eles também possam 
            acompanhar a evolução e registrar atividades importantes.
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Add Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl py-6"
          >
            <UserPlus size={18} className="mr-2" />
            Cadastrar Profissional
          </Button>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card p-4 rounded-2xl border border-border/50 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-foreground">
                {editingId ? 'Editar Profissional' : 'Novo Profissional'}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo de Profissional</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONAL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <t.icon size={14} />
                          {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="license">Registro Profissional</Label>
                <Input
                  id="license"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="COREN, CREFITO, etc."
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais..."
                  rows={2}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  {editingId ? 'Atualizar' : 'Cadastrar'}
                </>
              )}
            </Button>
          </form>
        )}

        {/* List */}
        <div className="space-y-3">
          {professionals.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-2xl">
              <Users className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">Nenhum profissional cadastrado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cadastre enfermeiras ou cuidadores que acompanham seu filho
              </p>
            </div>
          ) : (
            professionals.map((prof) => {
              const typeInfo = getTypeInfo(prof.professional_type);
              const TypeIcon = typeInfo.icon;
              
              return (
                <div 
                  key={prof.id} 
                  className={`bg-card p-4 rounded-2xl border transition-all ${
                    prof.is_active 
                      ? 'border-border/50' 
                      : 'border-border/30 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      prof.is_active ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <TypeIcon size={20} className={prof.is_active ? 'text-primary' : 'text-muted-foreground'} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-foreground truncate">{prof.name}</h4>
                        <Badge variant={prof.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {typeInfo.label}
                        </Badge>
                      </div>
                      
                      {prof.email && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail size={10} />
                          {prof.email}
                        </div>
                      )}
                      
                      {prof.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone size={10} />
                          {prof.phone}
                        </div>
                      )}
                      
                      {prof.license_number && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Shield size={10} />
                          {prof.license_number}
                        </div>
                      )}
                      
                      {prof.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          "{prof.notes}"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editProfessional(prof)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(prof.id, prof.is_active)}
                        className={`h-8 w-8 p-0 ${prof.is_active ? 'text-success' : 'text-muted-foreground'}`}
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProfessional(prof.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info */}
        <div className="bg-muted/30 p-4 rounded-2xl border border-border/30">
          <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
            <Shield className="text-primary" size={16} /> Sobre os profissionais
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Profissionais cadastrados podem acompanhar a evolução</li>
            <li>• Eles terão acesso aos registros do seu filho</li>
            <li>• Você pode desativar o acesso a qualquer momento</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalsManager;
