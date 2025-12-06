import { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'post' | 'comment';
}

const reportReasons = [
  { value: 'spam', label: 'Spam', icon: '🚫' },
  { value: 'offensive', label: 'Conteúdo Ofensivo', icon: '😤' },
  { value: 'harassment', label: 'Assédio', icon: '⚠️' },
  { value: 'misinformation', label: 'Desinformação', icon: '❌' },
  { value: 'other', label: 'Outro', icon: '📋' },
];

const ReportContentModal = ({ isOpen, onClose, contentId, contentType }: ReportContentModalProps) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!user || !selectedReason) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('content_reports')
        .insert({
          reporter_id: user.id,
          content_id: contentId,
          content_type: contentType,
          reason: selectedReason,
          description: description.trim() || null,
        });

      if (error) throw error;

      toast.success('Denúncia enviada com sucesso. Nossa equipe irá analisar.');
      onClose();
      setSelectedReason('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Erro ao enviar denúncia');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-xl">
              <Flag className="text-destructive" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Denunciar Conteúdo</h2>
              <p className="text-xs text-muted-foreground">
                {contentType === 'post' ? 'Publicação' : 'Comentário'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-xl">
            <AlertTriangle className="text-warning shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-foreground">
              Denúncias falsas podem resultar em penalizações. Use este recurso com responsabilidade.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Motivo da denúncia
            </label>
            <div className="grid gap-2">
              {reportReasons.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setSelectedReason(reason.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selectedReason === reason.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-lg">{reason.icon}</span>
                  <span className="text-sm font-medium text-foreground">{reason.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Detalhes adicionais (opcional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva mais detalhes sobre o problema..."
              className="min-h-[80px]"
              maxLength={500}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || submitting}
            className="flex-1 bg-destructive hover:bg-destructive/90"
          >
            {submitting ? 'Enviando...' : 'Enviar Denúncia'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportContentModal;
