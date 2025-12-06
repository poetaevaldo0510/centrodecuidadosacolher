import { useState, useEffect } from 'react';
import { Ban, Clock, AlertTriangle, UserX, Check, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface BlockedUser {
  id: string;
  user_id: string;
  blocked_by: string;
  reason: string;
  blocked_at: string;
  expires_at: string | null;
  is_permanent: boolean;
  report_count: number;
}

interface UserWithReports {
  user_id: string;
  report_count: number;
  resolved_count: number;
}

const BlockedUsersManager = () => {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [reincidentUsers, setReincidentUsers] = useState<UserWithReports[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState<'7' | '30' | '90' | 'permanent'>('7');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load blocked users
      const { data: blocked, error: blockedError } = await supabase
        .from('blocked_users')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (blockedError) throw blockedError;
      setBlockedUsers(blocked || []);

      // Load users with multiple resolved reports (reincidentes)
      const { data: reports, error: reportsError } = await supabase
        .from('content_reports')
        .select('reported_user_id, status')
        .not('reported_user_id', 'is', null);

      if (reportsError) throw reportsError;

      // Group by user and count resolved reports
      const userReportsMap: Record<string, { total: number; resolved: number }> = {};
      reports?.forEach((report) => {
        if (report.reported_user_id) {
          if (!userReportsMap[report.reported_user_id]) {
            userReportsMap[report.reported_user_id] = { total: 0, resolved: 0 };
          }
          userReportsMap[report.reported_user_id].total++;
          if (report.status === 'resolved') {
            userReportsMap[report.reported_user_id].resolved++;
          }
        }
      });

      // Filter users with 2+ resolved reports (reincidentes)
      const reincidents = Object.entries(userReportsMap)
        .filter(([_, counts]) => counts.resolved >= 2)
        .map(([userId, counts]) => ({
          user_id: userId,
          report_count: counts.total,
          resolved_count: counts.resolved,
        }))
        .sort((a, b) => b.resolved_count - a.resolved_count);

      setReincidentUsers(reincidents);
    } catch (error) {
      console.error('Error loading blocked users:', error);
      toast.error('Erro ao carregar usuários bloqueados');
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async () => {
    if (!user || !selectedUser || !blockReason.trim()) {
      toast.error('Preencha o motivo do bloqueio');
      return;
    }

    try {
      const expiresAt =
        blockDuration === 'permanent'
          ? null
          : new Date(Date.now() + parseInt(blockDuration) * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase.from('blocked_users').insert({
        user_id: selectedUser,
        blocked_by: user.id,
        reason: blockReason.trim(),
        expires_at: expiresAt,
        is_permanent: blockDuration === 'permanent',
        report_count: reincidentUsers.find((u) => u.user_id === selectedUser)?.resolved_count || 1,
      });

      if (error) throw error;

      toast.success('Usuário bloqueado com sucesso');
      setShowBlockModal(false);
      setSelectedUser(null);
      setBlockReason('');
      setBlockDuration('7');
      loadData();
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Erro ao bloquear usuário');
    }
  };

  const unblockUser = async (blockId: string) => {
    try {
      const { error } = await supabase.from('blocked_users').delete().eq('id', blockId);

      if (error) throw error;

      toast.success('Usuário desbloqueado');
      loadData();
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Erro ao desbloquear usuário');
    }
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return 'Permanente';
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return 'Expirado';
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    if (days > 0) return `${days} dias`;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    return `${hours} horas`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-destructive/10 rounded-xl">
          <Ban className="text-destructive" size={20} />
        </div>
        <div>
          <h2 className="font-bold text-foreground">Bloqueio de Usuários</h2>
          <p className="text-xs text-muted-foreground">
            {blockedUsers.length} usuário(s) bloqueado(s)
          </p>
        </div>
      </div>

      {/* Reincident Users Section */}
      {reincidentUsers.length > 0 && (
        <div className="bg-warning/10 p-4 rounded-2xl border border-warning/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-warning" size={18} />
            <h3 className="font-bold text-foreground text-sm">Usuários Reincidentes</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Usuários com 2+ denúncias confirmadas
          </p>
          <div className="space-y-2">
            {reincidentUsers
              .filter((u) => !blockedUsers.some((b) => b.user_id === u.user_id))
              .slice(0, 5)
              .map((reincident) => (
                <div
                  key={reincident.user_id}
                  className="bg-card p-3 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                      <UserX size={16} className="text-destructive" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        ID: {reincident.user_id.slice(0, 8)}...
                      </p>
                      <p className="text-[10px] text-destructive">
                        {reincident.resolved_count} denúncias confirmadas
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedUser(reincident.user_id);
                      setShowBlockModal(true);
                    }}
                  >
                    <Ban size={14} className="mr-1" /> Bloquear
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Blocked Users List */}
      <div>
        <h3 className="font-bold text-foreground mb-3 text-sm">Usuários Bloqueados</h3>
        {blockedUsers.length === 0 ? (
          <div className="text-center py-8 bg-card rounded-2xl border border-border">
            <Ban className="mx-auto text-muted-foreground mb-3" size={40} />
            <p className="text-muted-foreground text-sm">Nenhum usuário bloqueado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map((blocked) => (
              <div
                key={blocked.id}
                className="bg-card p-4 rounded-2xl border border-border flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                    <UserX size={18} className="text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      ID: {blocked.user_id.slice(0, 12)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{blocked.reason}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          blocked.is_permanent
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-warning/20 text-warning'
                        }`}
                      >
                        <Clock size={10} className="inline mr-1" />
                        {getTimeRemaining(blocked.expires_at)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {blocked.report_count} denúncia(s)
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unblockUser(blocked.id)}
                  className="text-success hover:bg-success/10"
                >
                  <Check size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Block User Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-destructive/10 rounded-xl">
                <Ban className="text-destructive" size={20} />
              </div>
              <h3 className="font-bold text-foreground">Bloquear Usuário</h3>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Motivo do bloqueio *
                </label>
                <Textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Descreva o motivo do bloqueio..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Duração do bloqueio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['7', '30', '90', 'permanent'] as const).map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setBlockDuration(duration)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        blockDuration === duration
                          ? 'bg-destructive text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {duration === 'permanent' ? 'Permanente' : `${duration} dias`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedUser(null);
                  setBlockReason('');
                }}
              >
                Cancelar
              </Button>
              <Button variant="destructive" className="flex-1" onClick={blockUser}>
                <Ban size={16} className="mr-1" /> Bloquear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockedUsersManager;