import { useState, useEffect, useMemo } from 'react';
import { 
  Link2, 
  TrendingUp, 
  DollarSign, 
  Copy, 
  Check, 
  Users, 
  MousePointerClick,
  Share2,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AffiliatePerformanceChart from './AffiliatePerformanceChart';
import AffiliateRanking from './AffiliateRanking';
import AffiliateLevelCard from './AffiliateLevelCard';
import AffiliateMonthlyGoals from './AffiliateMonthlyGoals';

interface AffiliateLink {
  id: string;
  product_id: string;
  affiliate_code: string;
  clicks: number;
  conversions: number;
  total_earnings: number;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  product?: {
    title: string;
    price: number | null;
    image_url: string | null;
  };
}

interface AffiliateSale {
  id: string;
  sale_amount: number;
  affiliate_commission: number;
  status: string;
  created_at: string;
  affiliate_link_id: string;
}

interface AffiliateDashboardProps {
  onBack: () => void;
}

const AffiliateDashboard = ({ onBack }: AffiliateDashboardProps) => {
  const { user } = useAuth();
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [affiliateSales, setAffiliateSales] = useState<AffiliateSale[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'links' | 'ranking'>('dashboard');
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
  });

  // Calculate monthly earnings from affiliate sales
  const monthlyEarnings = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return affiliateSales
      .filter(sale => new Date(sale.created_at) >= startOfMonth)
      .reduce((sum, sale) => sum + Number(sale.affiliate_commission), 0);
  }, [affiliateSales]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Fetch affiliate links with product info
      const { data: linksData, error: linksError } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;

      // Enrich with product info
      const enrichedLinks = await Promise.all(
        (linksData || []).map(async (link) => {
          const { data: productData } = await supabase
            .from('marketplace_items')
            .select('title, price, image_url')
            .eq('id', link.product_id)
            .single();
          return { ...link, product: productData };
        })
      );

      setAffiliateLinks(enrichedLinks);

      // Fetch affiliate sales
      const { data: salesData } = await supabase
        .from('affiliate_sales')
        .select('*')
        .eq('affiliate_id', user!.id)
        .order('created_at', { ascending: false });

      setAffiliateSales(salesData || []);

      // Calculate stats
      const totalLinks = enrichedLinks.length;
      const totalClicks = enrichedLinks.reduce((sum, l) => sum + (l.clicks || 0), 0);
      const totalConversions = enrichedLinks.reduce((sum, l) => sum + (l.conversions || 0), 0);
      const totalEarnings = enrichedLinks.reduce((sum, l) => sum + Number(l.total_earnings || 0), 0);

      setStats({ totalLinks, totalClicks, totalConversions, totalEarnings });

      // Fetch available products for affiliation (not own products)
      const { data: productsData } = await supabase
        .from('marketplace_items')
        .select('id, title, price, image_url, user_id')
        .neq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Filter out products already affiliated
      const linkedProductIds = new Set(enrichedLinks.map(l => l.product_id));
      const available = (productsData || []).filter(p => !linkedProductIds.has(p.id));
      setAvailableProducts(available);

    } catch (error) {
      console.error('Error loading affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAffiliateLink = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_links')
        .insert({
          user_id: user!.id,
          product_id: productId,
        });

      if (error) throw error;

      toast.success('Link de afiliado criado!');
      setShowProductSelector(false);
      loadData();
    } catch (error) {
      console.error('Error creating affiliate link:', error);
      toast.error('Erro ao criar link de afiliado');
    }
  };

  const deleteAffiliateLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      toast.success('Link removido!');
      loadData();
    } catch (error) {
      toast.error('Erro ao remover link');
    }
  };

  const copyAffiliateLink = async (link: AffiliateLink) => {
    const baseUrl = window.location.origin;
    const affiliateUrl = `${baseUrl}/produto/${link.affiliate_code}?ref=affiliate`;
    
    try {
      await navigator.clipboard.writeText(affiliateUrl);
      setCopiedLink(link.id);
      toast.success('Link copiado!');
      
      // Track click
      await supabase
        .from('affiliate_links')
        .update({ clicks: (link.clicks || 0) + 1 })
        .eq('id', link.id);

      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-card px-4 pt-10 pb-5 sticky top-0 z-10 border-b border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4"
        >
          ← Voltar ao Mercado
        </Button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-gradient-to-br from-primary to-primary/70 rounded-2xl shadow-lg shadow-primary/25">
            <Link2 className="text-primary-foreground" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Programa de Afiliados</h2>
            <p className="text-xs text-muted-foreground">Indique produtos e ganhe comissões</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'links'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🔗 Meus Links
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'ranking'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🏆 Ranking
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Affiliate Level Card */}
            <AffiliateLevelCard totalEarnings={stats.totalEarnings} />

            {/* Monthly Goals */}
            <AffiliateMonthlyGoals monthlyEarnings={monthlyEarnings} />

            {/* Commission Info */}
            <div className="bg-gradient-to-r from-success/10 via-success/5 to-transparent border border-success/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-success/20 rounded-xl">
                  <Sparkles className="text-success" size={20} />
                </div>
                <div>
                  <span className="font-bold text-success text-lg">Comissão de 5% por venda!</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    A cada venda realizada através do seu link, você recebe 5% do valor automaticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card p-4 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Link2 className="text-primary" size={14} />
                  </div>
                  <span className="text-xs text-muted-foreground">Links Ativos</span>
                </div>
                <span className="text-2xl font-bold text-foreground">{stats.totalLinks}</span>
              </div>
              
              <div className="bg-card p-4 rounded-2xl border border-border/50 hover:border-info/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-info/10 rounded-lg">
                    <MousePointerClick className="text-info" size={14} />
                  </div>
                  <span className="text-xs text-muted-foreground">Cliques</span>
                </div>
                <span className="text-2xl font-bold text-info">{stats.totalClicks}</span>
              </div>
              
              <div className="bg-card p-4 rounded-2xl border border-border/50 hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-accent/10 rounded-lg">
                    <Users className="text-accent" size={14} />
                  </div>
                  <span className="text-xs text-muted-foreground">Conversões</span>
                </div>
                <span className="text-2xl font-bold text-accent">{stats.totalConversions}</span>
              </div>
              
              <div className="bg-card p-4 rounded-2xl border border-border/50 hover:border-success/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-success/10 rounded-lg">
                    <TrendingUp className="text-success" size={14} />
                  </div>
                  <span className="text-xs text-muted-foreground">Ganhos</span>
                </div>
                <span className="text-2xl font-bold text-success">
                  R$ {stats.totalEarnings.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Performance Chart */}
            <AffiliatePerformanceChart 
              affiliateLinks={affiliateLinks} 
              affiliateSales={affiliateSales} 
            />

            {/* Recent Affiliate Sales */}
            {affiliateSales.length > 0 && (
              <div>
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <DollarSign size={18} className="text-success" />
                  Comissões Recentes
                </h3>
                
                <div className="space-y-2">
                  {affiliateSales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="bg-card rounded-xl border border-border/50 p-3 flex items-center justify-between hover:border-success/30 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Venda de R$ {Number(sale.sale_amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge className="bg-success/10 text-success border-success/30">
                        +R$ {Number(sale.affiliate_commission).toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Share2 size={18} className="text-primary" />
                Seus Links de Afiliado
              </h3>
              <Button
                size="sm"
                onClick={() => setShowProductSelector(!showProductSelector)}
                className="gap-1"
              >
                <Plus size={14} />
                Novo Link
              </Button>
            </div>

            {/* Product Selector */}
            {showProductSelector && (
              <div className="bg-card rounded-2xl border border-primary/30 p-4 mb-4 animate-fade-in">
                <h4 className="font-semibold text-foreground mb-3">Escolha um produto para divulgar:</h4>
                {availableProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum produto disponível para afiliação
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => createAffiliateLink(product.id)}
                        className="w-full flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{product.title}</p>
                          <p className="text-sm text-success font-bold">R$ {product.price?.toFixed(2)}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          +5%
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Affiliate Links List */}
            {affiliateLinks.length === 0 ? (
              <div className="bg-muted/30 rounded-2xl p-6 text-center">
                <Link2 className="mx-auto text-muted-foreground mb-2" size={32} />
                <p className="text-sm text-muted-foreground">Você ainda não tem links de afiliado</p>
                <p className="text-xs text-muted-foreground mt-1">Clique em "Novo Link" para começar a divulgar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {affiliateLinks.map((link) => (
                  <div key={link.id} className="bg-card rounded-2xl border border-border/50 p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                        {link.product?.image_url ? (
                          <img src={link.product.image_url} alt={link.product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{link.product?.title}</h4>
                        <p className="text-sm text-success font-bold">R$ {link.product?.price?.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAffiliateLink(link.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                      <div className="bg-muted/30 rounded-lg p-2">
                        <p className="text-lg font-bold text-foreground">{link.clicks || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Cliques</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2">
                        <p className="text-lg font-bold text-foreground">{link.conversions || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Vendas</p>
                      </div>
                      <div className="bg-success/10 rounded-lg p-2">
                        <p className="text-lg font-bold text-success">R$ {Number(link.total_earnings || 0).toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">Ganhos</p>
                      </div>
                    </div>

                    {/* Copy Link Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyAffiliateLink(link)}
                      className="w-full gap-2"
                    >
                      {copiedLink === link.id ? (
                        <>
                          <Check size={14} className="text-success" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copiar Link de Afiliado
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ranking Tab */}
        {activeTab === 'ranking' && (
          <AffiliateRanking />
        )}
      </div>
    </div>
  );
};

export default AffiliateDashboard;
