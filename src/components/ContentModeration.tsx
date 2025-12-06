import { useState, useEffect } from 'react';
import { Flag, Check, X, Eye, MessageSquare, FileText, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface Report {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string | null;
  status: string;
  moderator_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const reasonLabels: Record<string, string> = {
  spam: 'Spam',
  offensive: 'Conteúdo Ofensivo',
  harassment: 'Assédio',
  misinformation: 'Desinformação',
  other: 'Outro',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-warning text-warning-foreground' },
  reviewed: { label: 'Em Análise', color: 'bg-blue-500 text-white' },
  resolved: { label: 'Resolvido', color: 'bg-success text-white' },
  dismissed: { label: 'Rejeitado', color: 'bg-muted text-muted-foreground' },
};

const ContentModeration = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  useEffect(() => {
    loadReports();
  }, [filterStatus]);

  const loadReports = async () => {
    try {
      let query = supabase
        .from('content_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Erro ao carregar denúncias');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('content_reports')
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          moderator_notes: moderatorNotes.trim() || null,
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success(`Denúncia ${newStatus === 'resolved' ? 'resolvida' : newStatus === 'dismissed' ? 'rejeitada' : 'atualizada'}`);
      setSelectedReport(null);
      setModeratorNotes('');
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Erro ao atualizar denúncia');
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-destructive/10 rounded-xl">
          <Flag className="text-destructive" size={20} />
        </div>
        <div>
          <h2 className="font-bold text-foreground">Moderação de Conteúdo</h2>
          <p className="text-xs text-muted-foreground">{reports.length} denúncias</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['pending', 'reviewed', 'resolved', 'dismissed', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              filterStatus === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status === 'all' ? 'Todas' : statusLabels[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-card p-4 rounded-2xl border border-border shadow-sm"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${report.content_type === 'post' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                  {report.content_type === 'post' ? (
                    <FileText size={14} className="text-purple-600 dark:text-purple-400" />
                  ) : (
                    <MessageSquare size={14} className="text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {report.content_type === 'post' ? 'Publicação' : 'Comentário'}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusLabels[report.status]?.color || 'bg-muted'}`}>
                {statusLabels[report.status]?.label || report.status}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Motivo:</span>
                <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">
                  {reasonLabels[report.reason] || report.reason}
                </span>
              </div>
              {report.description && (
                <p className="text-sm text-foreground bg-muted/50 p-2 rounded-lg">
                  {report.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={12} />
                <span>{getTimeAgo(report.created_at)}</span>
              </div>
            </div>

            {report.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedReport(report)}
                >
                  <Eye size={14} className="mr-1" /> Revisar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => updateReportStatus(report.id, 'dismissed')}
                >
                  <X size={14} />
                </Button>
                <Button
                  size="sm"
                  className="bg-success hover:bg-success/90"
                  onClick={() => updateReportStatus(report.id, 'resolved')}
                >
                  <Check size={14} />
                </Button>
              </div>
            )}

            {report.moderator_notes && (
              <div className="mt-3 p-2 bg-primary/5 rounded-lg">
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <User size={10} /> Notas do moderador:
                </p>
                <p className="text-xs text-foreground">{report.moderator_notes}</p>
              </div>
            )}
          </div>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-12">
            <Flag className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">Nenhuma denúncia {filterStatus !== 'all' ? statusLabels[filterStatus]?.label.toLowerCase() : ''}</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl p-5">
            <h3 className="font-bold text-foreground mb-4">Revisar Denúncia</h3>
            
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Motivo</p>
                <p className="text-sm font-medium text-foreground">
                  {reasonLabels[selectedReport.reason]}
                </p>
              </div>
              {selectedReport.description && (
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Descrição</p>
                  <p className="text-sm text-foreground">{selectedReport.description}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Notas do moderador
              </label>
              <Textarea
                value={moderatorNotes}
                onChange={(e) => setModeratorNotes(e.target.value)}
                placeholder="Adicione suas observações sobre esta denúncia..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedReport(null);
                  setModeratorNotes('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                className="text-muted-foreground"
                onClick={() => updateReportStatus(selectedReport.id, 'dismissed')}
              >
                Rejeitar
              </Button>
              <Button
                className="bg-success hover:bg-success/90"
                onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
              >
                Resolver
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentModeration;
