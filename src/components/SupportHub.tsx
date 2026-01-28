import { useState, useEffect } from 'react';
import { 
  Heart, Phone, MessageCircle, Star, MapPin, Globe, Instagram, 
  Plus, Search, Filter, ChevronDown, ExternalLink, Stethoscope,
  Brain, Baby, Smile, Users, HeartHandshake, Sparkles, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface Recommendation {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  description: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  is_online: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

const SPECIALTIES = [
  { value: 'terapeuta_ocupacional', label: 'Terapeuta Ocupacional', icon: Baby },
  { value: 'fonoaudiologo', label: 'Fonoaudiólogo(a)', icon: MessageCircle },
  { value: 'psicologo', label: 'Psicólogo(a)', icon: Brain },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta', icon: Stethoscope },
  { value: 'neuropediatra', label: 'Neuropediatra', icon: Brain },
  { value: 'psiquiatra', label: 'Psiquiatra Infantil', icon: Smile },
  { value: 'pedagogo', label: 'Pedagogo(a) Especializado', icon: Users },
  { value: 'musicoterapeuta', label: 'Musicoterapeuta', icon: Sparkles },
  { value: 'equoterapeuta', label: 'Equoterapeuta', icon: HeartHandshake },
  { value: 'outro', label: 'Outro', icon: Heart },
];

const THERAPEUTIC_RESOURCES = [
  {
    title: 'CVV - Centro de Valorização da Vida',
    description: 'Apoio emocional e prevenção do suicídio por telefone, chat e email. 24 horas.',
    phone: '188',
    website: 'https://www.cvv.org.br',
    color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  },
  {
    title: 'CAPS - Centro de Atenção Psicossocial',
    description: 'Atendimento público de saúde mental. Procure o CAPS mais próximo.',
    website: 'https://www.gov.br/saude/pt-br/composicao/saps/caps',
    color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  },
  {
    title: 'Instituto Jô Clemente (APAE-SP)',
    description: 'Referência no atendimento de pessoas com deficiência intelectual.',
    website: 'https://www.ijc.org.br',
    color: 'bg-green-500/20 text-green-700 dark:text-green-300',
  },
  {
    title: 'Associação Brasileira de Autismo (ABRA)',
    description: 'Apoio, informação e orientação para famílias de pessoas com autismo.',
    website: 'https://www.autismo.org.br',
    color: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  },
];

const SELF_CARE_TIPS = [
  {
    title: 'Respire fundo',
    description: 'Reserve 5 minutos para praticar respiração profunda. Inspire por 4 segundos, segure por 4, expire por 6.',
    icon: '🧘',
  },
  {
    title: 'Você não está sozinha',
    description: 'Conecte-se com outras mães que entendem sua jornada. Compartilhar alivia o peso.',
    icon: '💜',
  },
  {
    title: 'Pequenas pausas importam',
    description: 'Um café quente, uma música que você gosta, 10 minutos de silêncio. Cuide de você também.',
    icon: '☕',
  },
  {
    title: 'Celebre as pequenas vitórias',
    description: 'Cada passo do seu filho é uma conquista. Cada dia que você atravessa também é.',
    icon: '🌟',
  },
];

const SupportHub = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    description: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    is_online: false,
  });

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('community_recommendations')
        .select('*')
        .order('rating_avg', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRecommendation = async () => {
    if (!user || !formData.name || !formData.specialty) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('community_recommendations')
        .insert({
          user_id: user.id,
          ...formData,
        });

      if (error) throw error;
      
      toast.success('Indicação adicionada com sucesso!');
      setAddDialogOpen(false);
      setFormData({
        name: '',
        specialty: '',
        description: '',
        city: '',
        state: '',
        phone: '',
        email: '',
        website: '',
        instagram: '',
        is_online: false,
      });
      loadRecommendations();
    } catch (error: any) {
      toast.error('Erro ao adicionar indicação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!user || !selectedRecommendation || userRating === 0) {
      toast.error('Selecione uma avaliação');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('recommendation_reviews')
        .upsert({
          recommendation_id: selectedRecommendation.id,
          user_id: user.id,
          rating: userRating,
          comment: userComment.trim() || null,
        }, { onConflict: 'recommendation_id,user_id' });

      if (error) throw error;
      
      toast.success('Avaliação enviada!');
      setRatingDialogOpen(false);
      setSelectedRecommendation(null);
      setUserRating(0);
      setUserComment('');
      loadRecommendations();
    } catch (error: any) {
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesSearch = 
      rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || rec.specialty === selectedSpecialty;
    const matchesOnline = !showOnlineOnly || rec.is_online;
    
    return matchesSearch && matchesSpecialty && matchesOnline;
  });

  const getSpecialtyLabel = (value: string) => {
    return SPECIALTIES.find(s => s.value === value)?.label || value;
  };

  const getSpecialtyIcon = (value: string) => {
    const spec = SPECIALTIES.find(s => s.value === value);
    return spec?.icon || Heart;
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onSelect?.(star)}
            className={cn(
              "transition-colors",
              interactive && "hover:scale-110 cursor-pointer"
            )}
          >
            <Star
              size={interactive ? 24 : 14}
              className={cn(
                star <= rating 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-card p-5 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-pink-500/20 p-3 rounded-xl">
            <HeartHandshake size={24} className="text-pink-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Apoio & Indicações</h2>
            <p className="text-xs text-muted-foreground">Profissionais e recursos para você e seu filho</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Encontre profissionais indicados por outras mães e recursos de apoio emocional para sua jornada.
        </p>
      </div>

      <Tabs defaultValue="profissionais" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="profissionais" className="text-xs">
            <Users size={14} className="mr-1" />
            Profissionais
          </TabsTrigger>
          <TabsTrigger value="recursos" className="text-xs">
            <Phone size={14} className="mr-1" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="autocuidado" className="text-xs">
            <Heart size={14} className="mr-1" />
            Autocuidado
          </TabsTrigger>
        </TabsList>

        {/* Profissionais Tab */}
        <TabsContent value="profissionais" className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar profissional ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Filter size={14} />
                  Filtros
                </span>
                <ChevronDown size={14} className={cn("transition-transform", filtersOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as especialidades</SelectItem>
                  {SPECIALTIES.map((spec) => (
                    <SelectItem key={spec.value} value={spec.value}>
                      {spec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                <span className="text-sm">Apenas atendimento online</span>
                <Switch checked={showOnlineOnly} onCheckedChange={setShowOnlineOnly} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Add Button */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="sm">
                <Plus size={16} className="mr-2" />
                Indicar um profissional
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Indicar Profissional</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome do profissional *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. João Silva"
                  />
                </div>
                <div>
                  <Label>Especialidade *</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(v) => setFormData({ ...formData, specialty: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map((spec) => (
                        <SelectItem key={spec.value} value={spec.value}>
                          {spec.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descrição / Por que você indica?</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Conte sua experiência com este profissional..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@usuario"
                  />
                </div>
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                  <span className="text-sm">Atende online?</span>
                  <Switch
                    checked={formData.is_online}
                    onCheckedChange={(v) => setFormData({ ...formData, is_online: v })}
                  />
                </div>
                <Button 
                  onClick={handleSubmitRecommendation} 
                  disabled={submitting} 
                  className="w-full"
                >
                  {submitting ? 'Enviando...' : 'Adicionar Indicação'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Results count */}
          <p className="text-xs text-muted-foreground">
            {filteredRecommendations.length} profissionais encontrados
          </p>

          {/* Recommendations List */}
          {filteredRecommendations.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-xl">
              <Users className="mx-auto mb-3 text-muted-foreground" size={32} />
              <h3 className="font-semibold text-foreground mb-1">Nenhum profissional encontrado</h3>
              <p className="text-xs text-muted-foreground">
                Seja a primeira a indicar um profissional!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecommendations.map((rec) => {
                const Icon = getSpecialtyIcon(rec.specialty);
                return (
                  <div key={rec.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{rec.name}</h3>
                          {rec.is_online && (
                            <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                              <Globe size={10} className="mr-1" />
                              Online
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-primary font-medium mb-1">
                          {getSpecialtyLabel(rec.specialty)}
                        </p>
                        {(rec.city || rec.state) && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                            <MapPin size={12} />
                            {rec.city}{rec.city && rec.state && ', '}{rec.state}
                          </p>
                        )}
                        {rec.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {rec.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mb-3">
                          {renderStars(Math.round(rec.rating_avg))}
                          <span className="text-xs text-muted-foreground">
                            ({rec.rating_count} {rec.rating_count === 1 ? 'avaliação' : 'avaliações'})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rec.phone && (
                            <a
                              href={`tel:${rec.phone}`}
                              className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1 hover:bg-muted/80"
                            >
                              <Phone size={12} />
                              Ligar
                            </a>
                          )}
                          {rec.website && (
                            <a
                              href={rec.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1 hover:bg-muted/80"
                            >
                              <ExternalLink size={12} />
                              Site
                            </a>
                          )}
                          {rec.instagram && (
                            <a
                              href={`https://instagram.com/${rec.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1 hover:bg-muted/80"
                            >
                              <Instagram size={12} />
                              Instagram
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setSelectedRecommendation(rec);
                              setRatingDialogOpen(true);
                            }}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1 hover:bg-primary/20"
                          >
                            <Star size={12} />
                            Avaliar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Recursos Tab */}
        <TabsContent value="recursos" className="space-y-3">
          <div className="bg-muted/50 p-4 rounded-xl mb-4">
            <p className="text-sm text-muted-foreground">
              Se você está passando por um momento difícil, lembre-se: pedir ajuda é um ato de coragem. 💜
            </p>
          </div>
          {THERAPEUTIC_RESOURCES.map((resource, index) => (
            <div key={index} className={cn("p-4 rounded-xl", resource.color)}>
              <h3 className="font-bold text-sm mb-1">{resource.title}</h3>
              <p className="text-xs opacity-80 mb-3">{resource.description}</p>
              <div className="flex flex-wrap gap-2">
                {resource.phone && (
                  <a
                    href={`tel:${resource.phone}`}
                    className="bg-white/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"
                  >
                    <Phone size={12} />
                    {resource.phone}
                  </a>
                )}
                {resource.website && (
                  <a
                    href={resource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    Acessar
                  </a>
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Autocuidado Tab */}
        <TabsContent value="autocuidado" className="space-y-3">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl mb-4">
            <p className="text-sm text-foreground font-medium">
              Mãe, você é incrível. 💜
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Cuidar de você também é cuidar do seu filho. Reserve um momento para respirar.
            </p>
          </div>
          <div className="grid gap-3">
            {SELF_CARE_TIPS.map((tip, index) => (
              <div key={index} className="bg-card border border-border p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{tip.title}</h3>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar {selectedRecommendation?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Como foi sua experiência?</p>
              <div className="flex justify-center">
                {renderStars(userRating, true, setUserRating)}
              </div>
            </div>
            <div>
              <Label>Comentário (opcional)</Label>
              <Textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Conte como foi sua experiência..."
              />
            </div>
            <Button onClick={handleSubmitRating} disabled={submitting || userRating === 0} className="w-full">
              {submitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportHub;