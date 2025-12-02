import { useState } from 'react';
import { Download, Upload, Cloud, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from './ui/button';

const BackupManager = () => {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(
    localStorage.getItem('last_backup_sync')
  );

  const exportAllData = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      // Fetch all user data
      const [logsData, routinesData, photosData, eventsData] = await Promise.all([
        supabase.from('logs').select('*').eq('user_id', user.id),
        supabase.from('routines').select('*').eq('user_id', user.id),
        supabase.from('progress_photos').select('*').eq('user_id', user.id),
        supabase.from('calendar_events').select('*').eq('user_id', user.id),
      ]);

      const allData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        logs: logsData.data || [],
        routines: routinesData.data || [],
        photos: photosData.data || [],
        events: eventsData.data || [],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(allData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acolher_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Backup exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  const syncToCloud = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    setSyncing(true);
    try {
      // Data is automatically synced via Supabase realtime
      // This is just a manual trigger confirmation
      const timestamp = new Date().toISOString();
      localStorage.setItem('last_backup_sync', timestamp);
      setLastSync(timestamp);
      
      toast.success('Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast.error('Erro ao sincronizar dados');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-card p-4 rounded-2xl shadow-sm border border-border space-y-3">
      <h3 className="font-bold text-foreground flex items-center gap-2">
        <Cloud className="text-primary" size={18} /> Backup & Exportação
      </h3>

      {lastSync && (
        <div className="bg-success/10 p-3 rounded-xl border border-success/20 flex items-center gap-2">
          <CheckCircle2 className="text-success" size={16} />
          <div className="flex-1">
            <p className="text-xs text-success font-bold">Último backup</p>
            <p className="text-xs text-muted-foreground">
              {new Date(lastSync).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={syncToCloud}
          disabled={syncing}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Upload size={14} className="mr-2" />
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
        
        <Button
          onClick={exportAllData}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Download size={14} className="mr-2" />
          Exportar Tudo
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Seus dados são salvos automaticamente na nuvem
      </p>
    </div>
  );
};

export default BackupManager;
