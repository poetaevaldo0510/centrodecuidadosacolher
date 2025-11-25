import { X, Printer, AlertTriangle, FileText } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const ReportModal = () => {
  const { childName, childDiagnosis, childCID, childBirthDate, childMeds, logs, setActiveModal, triggerReward } = useAppStore();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card w-full max-w-md h-[80vh] rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-muted">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText /> Relatório Médico
          </h3>
          <button onClick={() => setActiveModal(null)}>
            <X />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto font-mono text-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold uppercase text-foreground">Relatório de Evolução</h2>
            <p className="text-muted-foreground">Paciente: {childName}</p>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="block">CID: {childCID}</span>
              <span className="block">Diagnóstico: {childDiagnosis}</span>
              <span className="block">Nasc: {childBirthDate}</span>
            </div>
          </div>
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
            <h4 className="font-bold text-destructive mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> Alerta de Padrão (IA)
            </h4>
            <p className="text-xs">Correlação identificada: Medicação ({childMeds}) x Agitação.</p>
          </div>
          <h4 className="font-bold border-b mb-2 mt-4">Histórico</h4>
          {logs
            .filter((l) => l.type !== 'mom_journal')
            .map((log) => (
              <div key={log.id} className="py-2 border-b border-dashed">
                <div className="flex justify-between">
                  <span className="font-bold">{log.action}</span>
                  <span className="text-muted-foreground text-xs">{log.time}</span>
                </div>
                {log.note && <p className="text-xs text-muted-foreground mt-1 italic">"{log.note}"</p>}
              </div>
            ))}
        </div>
        <div className="p-4 border-t bg-muted">
          <button
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            onClick={() => {
              triggerReward("PDF Enviado!", 10);
              setActiveModal(null);
            }}
          >
            <Printer size={18} /> Imprimir / Salvar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
