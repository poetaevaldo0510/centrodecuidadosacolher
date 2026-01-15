import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink,
  ShoppingCart,
  Percent,
  BarChart3,
  Clock,
  CheckCircle2,
  Truck,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Sale {
  id: string;
  product_id: string;
  buyer_name: string;
  buyer_email: string | null;
  buyer_phone: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  platform_fee: number;
  seller_amount: number;
  status: string;
  created_at: string;
  product?: {
    title: string;
    image_url: string | null;
  };
}

interface Product {
  id: string;
  title: string;
  price: number | null;
  share_link: string | null;
  total_sales: number | null;
  total_revenue: number | null;
  image_url: string | null;
}

interface SellerDashboardProps {
  onBack: () => void;
}

const SellerDashboard = ({ onBack }: SellerDashboardProps) => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    platformFees: 0,
    netRevenue: 0,
    pendingSales: 0,
    completedSales: 0
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from('marketplace_items')
        .select('id, title, price, share_link, total_sales, total_revenue, image_url')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      setProducts(productsData || []);

      // Fetch sales
      const { data: salesData } = await supabase
        .from('marketplace_sales')
        .select('*')
        .eq('seller_id', user!.id)
        .order('created_at', { ascending: false });

      // Enrich sales with product info
      if (salesData) {
        const enrichedSales = await Promise.all(
          salesData.map(async (sale) => {
            const product = productsData?.find(p => p.id === sale.product_id);
            return {
              ...sale,
              product: product ? { title: product.title, image_url: product.image_url } : undefined
            };
          })
        );
        setSales(enrichedSales);

        // Calculate stats
        const totalSales = salesData.length;
        const totalRevenue = salesData.reduce((sum, s) => sum + Number(s.total_price), 0);
        const platformFees = salesData.reduce((sum, s) => sum + Number(s.platform_fee), 0);
        const netRevenue = salesData.reduce((sum, s) => sum + Number(s.seller_amount), 0);
        const pendingSales = salesData.filter(s => s.status === 'pending').length;
        const completedSales = salesData.filter(s => s.status === 'delivered').length;

        setStats({
          totalSales,
          totalRevenue,
          platformFees,
          netRevenue,
          pendingSales,
          completedSales
        });
      }
    } catch (error) {
      console.error('Error loading seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = async (product: Product) => {
    if (!product.share_link) return;
    
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/produto/${product.share_link}`;
    
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(product.id);
      toast.success('Link copiado!');
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const updateSaleStatus = async (saleId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_sales')
        .update({ status: newStatus })
        .eq('id', saleId);

      if (error) throw error;
      
      toast.success('Status atualizado!');
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/30';
      case 'confirmed': return 'bg-primary/10 text-primary border-primary/30';
      case 'shipped': return 'bg-info/10 text-info border-info/30';
      case 'delivered': return 'bg-success/10 text-success border-success/30';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle2;
      case 'shipped': return Truck;
      case 'delivered': return Check;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-success border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-success/15 via-success/5 to-card px-4 pt-10 pb-5 sticky top-0 z-10 border-b border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4"
        >
          ← Voltar ao Mercado
        </Button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-gradient-to-br from-success to-success/70 rounded-2xl shadow-lg shadow-success/25">
            <BarChart3 className="text-success-foreground" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Painel do Vendedor</h2>
            <p className="text-xs text-muted-foreground">Gerencie seus produtos e vendas</p>
          </div>
        </div>

        {/* Commission Notice */}
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 flex items-start gap-2">
          <Percent className="text-warning mt-0.5" size={16} />
          <div className="text-xs">
            <span className="font-semibold text-warning">Taxa da plataforma: 10%</span>
            <p className="text-muted-foreground mt-0.5">
              A cada venda, 10% do valor é retido pela plataforma para manutenção e suporte.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card p-4 rounded-2xl border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="text-primary" size={16} />
              <span className="text-xs text-muted-foreground">Total de Vendas</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.totalSales}</span>
          </div>
          
          <div className="bg-card p-4 rounded-2xl border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-success" size={16} />
              <span className="text-xs text-muted-foreground">Faturamento</span>
            </div>
            <span className="text-2xl font-bold text-success">
              R$ {stats.totalRevenue.toFixed(2)}
            </span>
          </div>
          
          <div className="bg-card p-4 rounded-2xl border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="text-warning" size={16} />
              <span className="text-xs text-muted-foreground">Taxa Plataforma</span>
            </div>
            <span className="text-2xl font-bold text-warning">
              R$ {stats.platformFees.toFixed(2)}
            </span>
          </div>
          
          <div className="bg-card p-4 rounded-2xl border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-success" size={16} />
              <span className="text-xs text-muted-foreground">Líquido</span>
            </div>
            <span className="text-2xl font-bold text-success">
              R$ {stats.netRevenue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Products with Share Links */}
        <div>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Package size={18} className="text-primary" />
            Seus Produtos ({products.length})
          </h3>
          
          {products.length === 0 ? (
            <div className="bg-muted/30 rounded-2xl p-6 text-center">
              <Package className="mx-auto text-muted-foreground mb-2" size={32} />
              <p className="text-sm text-muted-foreground">Você ainda não tem produtos cadastrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="bg-card rounded-2xl border border-border/50 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="text-muted-foreground" size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{product.title}</h4>
                      <p className="text-sm text-success font-bold">R$ {product.price?.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Share Link */}
                  <div className="bg-muted/30 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 size={14} className="text-primary" />
                      <span className="text-xs font-medium text-foreground">Link de Compartilhamento</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-background rounded-lg px-3 py-2 text-xs text-muted-foreground truncate">
                        {window.location.origin}/produto/{product.share_link}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyShareLink(product)}
                        className="flex-shrink-0"
                      >
                        {copiedLink === product.id ? (
                          <Check size={14} className="text-success" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Compartilhe este link para vender externamente. Ao vender, você receberá 90% do valor.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <ShoppingCart size={18} className="text-success" />
            Vendas Recentes
          </h3>
          
          {sales.length === 0 ? (
            <div className="bg-muted/30 rounded-2xl p-6 text-center">
              <ShoppingCart className="mx-auto text-muted-foreground mb-2" size={32} />
              <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => {
                const StatusIcon = getStatusIcon(sale.status);
                return (
                  <div key={sale.id} className="bg-card rounded-2xl border border-border/50 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{sale.product?.title || 'Produto'}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(sale.status)} flex items-center gap-1`}>
                        <StatusIcon size={12} />
                        {getStatusLabel(sale.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Comprador:</span>
                        <p className="font-medium text-foreground">{sale.buyer_name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quantidade:</span>
                        <p className="font-medium text-foreground">{sale.quantity}x</p>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor total:</span>
                        <span className="font-semibold">R$ {Number(sale.total_price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-warning">
                        <span>Taxa (10%):</span>
                        <span>-R$ {Number(sale.platform_fee).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-success font-bold border-t border-border pt-1">
                        <span>Você recebe:</span>
                        <span>R$ {Number(sale.seller_amount).toFixed(2)}</span>
                      </div>
                    </div>

                    {sale.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => updateSaleStatus(sale.id, 'confirmed')}
                          className="flex-1 bg-success hover:bg-success/90"
                        >
                          <CheckCircle2 size={14} className="mr-1" /> Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateSaleStatus(sale.id, 'cancelled')}
                        >
                          <XCircle size={14} />
                        </Button>
                      </div>
                    )}
                    
                    {sale.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => updateSaleStatus(sale.id, 'shipped')}
                        className="w-full mt-3"
                      >
                        <Truck size={14} className="mr-1" /> Marcar como Enviado
                      </Button>
                    )}
                    
                    {sale.status === 'shipped' && (
                      <Button
                        size="sm"
                        onClick={() => updateSaleStatus(sale.id, 'delivered')}
                        className="w-full mt-3 bg-success hover:bg-success/90"
                      >
                        <Check size={14} className="mr-1" /> Confirmar Entrega
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
