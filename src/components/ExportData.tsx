import { useState, useEffect } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Log {
  id: string;
  title: string;
  type: string;
  description: string | null;
  date: string;
  created_at: string;
}

interface Routine {
  id: string;
  title: string;
  time: string;
  description: string | null;
  completed: boolean | null;
}

const ExportData = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [logsResult, routinesResult] = await Promise.all([
        supabase
          .from('logs')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase
          .from('routines')
          .select('*')
          .eq('user_id', user.id)
          .order('time', { ascending: true }),
      ]);

      if (logsResult.error) throw logsResult.error;
      if (routinesResult.error) throw routinesResult.error;

      setLogs(logsResult.data || []);
      setRoutines(routinesResult.data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Relatório Acolher', 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

    // Logs section
    doc.setFontSize(14);
    doc.text('Registros de Atividades', 14, 40);
    
    if (logs.length > 0) {
      autoTable(doc, {
        startY: 45,
        head: [['Data', 'Tipo', 'Título', 'Observações']],
        body: logs.map(log => [
          new Date(log.date).toLocaleDateString('pt-BR'),
          log.type,
          log.title,
          log.description || '-',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [99, 102, 241] },
      });
    }

    // Routines section
    const finalY = (doc as any).lastAutoTable?.finalY || 50;
    doc.setFontSize(14);
    doc.text('Rotinas Configuradas', 14, finalY + 15);
    
    if (routines.length > 0) {
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Horário', 'Atividade', 'Descrição', 'Status']],
        body: routines.map(routine => [
          routine.time,
          routine.title,
          routine.description || '-',
          routine.completed ? 'Concluída' : 'Pendente',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [99, 102, 241] },
      });
    }

    doc.save(`acolher-relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF exportado com sucesso!');
  };

  const exportToCSV = () => {
    // Create logs CSV
    const logsHeaders = ['Data', 'Tipo', 'Título', 'Observações'];
    const logsRows = logs.map(log => [
      new Date(log.date).toLocaleDateString('pt-BR'),
      log.type,
      log.title,
      log.description || '',
    ]);
    
    const logsCSV = [
      logsHeaders.join(','),
      ...logsRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create routines CSV
    const routinesHeaders = ['Horário', 'Atividade', 'Descrição', 'Status'];
    const routinesRows = routines.map(routine => [
      routine.time,
      routine.title,
      routine.description || '',
      routine.completed ? 'Concluída' : 'Pendente',
    ]);
    
    const routinesCSV = [
      routinesHeaders.join(','),
      ...routinesRows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Download logs CSV
    const logsBlob = new Blob(['\ufeff' + logsCSV], { type: 'text/csv;charset=utf-8;' });
    const logsUrl = URL.createObjectURL(logsBlob);
    const logsLink = document.createElement('a');
    logsLink.href = logsUrl;
    logsLink.download = `acolher-registros-${new Date().toISOString().split('T')[0]}.csv`;
    logsLink.click();

    // Download routines CSV
    const routinesBlob = new Blob(['\ufeff' + routinesCSV], { type: 'text/csv;charset=utf-8;' });
    const routinesUrl = URL.createObjectURL(routinesBlob);
    const routinesLink = document.createElement('a');
    routinesLink.href = routinesUrl;
    routinesLink.download = `acolher-rotinas-${new Date().toISOString().split('T')[0]}.csv`;
    routinesLink.click();

    toast.success('Arquivos CSV exportados com sucesso!');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-success/10 p-6 rounded-2xl border border-border">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Download size={20} className="text-primary" />
          Exportar Dados
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Compartilhe seus registros e rotinas com profissionais de saúde
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={exportToPDF}
            disabled={logs.length === 0 && routines.length === 0}
            className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={18} />
            Exportar PDF
          </button>
          
          <button
            onClick={exportToCSV}
            disabled={logs.length === 0 && routines.length === 0}
            className="flex-1 bg-success text-success-foreground py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Table size={18} />
            Exportar CSV
          </button>
        </div>

        {logs.length === 0 && routines.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Ainda não há dados para exportar
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-primary">{logs.length}</p>
          <p className="text-xs text-muted-foreground">Registros</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-2xl font-bold text-success">{routines.length}</p>
          <p className="text-xs text-muted-foreground">Rotinas</p>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
