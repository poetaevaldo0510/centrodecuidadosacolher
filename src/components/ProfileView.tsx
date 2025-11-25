import { useState } from 'react';
import { User, CheckCircle, BookHeart, Edit3, Info, Brain, File, Lock, Smile, Sun, Moon, CloudRain } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const ProfileView = () => {
  const {
    userName,
    childName,
    childDiagnosis,
    childCID,
    childBirthDate,
    childMeds,
    userCep,
    logs,
    setUserData,
    setActiveModal,
    triggerReward,
  } = useAppStore();

  const [isEditing, setIsEditing] = useState(!userName);

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setUserData({
      userName: formData.get('name') as string,
      userCep: formData.get('cep') as string,
      childName: formData.get('childName') as string,
      childDiagnosis: formData.get('diagnosis') as string,
      childCID: formData.get('cid') as string,
      childBirthDate: formData.get('birth') as string,
      childMeds: formData.get('meds') as string,
    });
    triggerReward("Prontuário atualizado! A IA agradece.", 30);
    setIsEditing(false);
  };

  const getMoodIcon = (mood: string | null | undefined) => {
    if (mood === 'good') return <Smile size={14} className="text-success" />;
    if (mood === 'neutral') return <Sun size={14} className="text-warning" />;
    if (mood === 'tired') return <Moon size={14} className="text-blue-500" />;
    return <CloudRain size={14} className="text-destructive" />;
  };

  return (
    <div className="flex flex-col h-screen bg-background pb-20 animate-slide-in-from-right">
      <div className="bg-card p-6 pb-8 rounded-b-[40px] shadow-sm text-center relative z-10">
        <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 border-4 border-card shadow-lg flex items-center justify-center text-3xl font-bold text-primary relative">
          {userName ? userName.charAt(0) : <User size={32} />}
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-success border-4 border-card rounded-full flex items-center justify-center">
            <CheckCircle size={14} className="text-white" />
          </div>
        </div>

        {!isEditing ? (
          <>
            <h2 className="text-xl font-bold text-foreground">{userName || "Mãe"}</h2>
            <p className="text-sm text-muted-foreground mb-4">Mãe do {childName}</p>
            <div className="flex justify-center gap-2 flex-wrap">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">Mãe Guardiã</span>
              <button
                onClick={() => setActiveModal('about')}
                className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-accent/20"
              >
                <Info size={12} /> Sobre o Acolher
              </button>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="block mx-auto mt-4 text-xs text-muted-foreground underline flex items-center justify-center gap-1"
            >
              <Edit3 size={12} /> Editar Prontuário
            </button>
          </>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-3 animate-fade-in text-left">
            <div className="bg-primary/10 p-3 rounded-xl mb-4">
              <p className="text-xs text-primary font-bold flex items-center gap-1 mb-1">
                <Brain size={12} /> Nota da IA:
              </p>
              <p className="text-[10px] text-primary/80 leading-tight">
                "Quanto mais detalhes você preencher aqui (CID, medicamentos), mais precisos serão os meus alertas de
                saúde para o seu filho."
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Seus Dados</label>
              <input
                name="name"
                defaultValue={userName}
                placeholder="Seu Nome"
                className="w-full text-sm bg-muted border border-border rounded-lg p-2 outline-none focus:border-primary mb-2"
                required
              />
              <input
                name="cep"
                defaultValue={userCep}
                placeholder="Seu CEP"
                className="w-full text-sm bg-muted border border-border rounded-lg p-2 outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Dados da Criança (Prontuário)</label>
              <input
                name="childName"
                defaultValue={childName}
                placeholder="Nome da Criança"
                className="w-full text-sm bg-muted border border-border rounded-lg p-2 outline-none focus:border-primary mb-2"
                required
              />
              <input
                name="birth"
                type="date"
                defaultValue={childBirthDate}
                className="w-full text-sm bg-muted border border-border rounded-lg p-2 outline-none focus:border-primary mb-2"
                required
              />
              <input
                name="diagnosis"
                defaultValue={childDiagnosis}
                placeholder="Diagnóstico (ex: TEA, TDAH)"
                className="w-full text-sm bg-muted border border-border rounded-lg p-2 outline-none focus:border-primary mb-2"
              />
              <input
                name="cid"
                defaultValue={childCID}
                placeholder="CID (ex: F84.0)"
                className="w-full text-sm bg-muted border border-border rounded-lg p-2 outline-none focus:border-primary mb-2"
              />
              <textarea
                name="meds"
                rows={2}
                defaultValue={childMeds}
                placeholder="Medicamentos em uso (ex: Risperidona 1mg)"
                className="w-full text-sm bg-muted border border-border rounded-lg p-2 outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground text-xs font-bold px-6 py-3 rounded-xl shadow-md hover:bg-primary/90 transition-colors"
            >
              Salvar Prontuário Completo
            </button>
          </form>
        )}
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Journal */}
        <div>
          <h3 className="font-bold text-foreground mb-3 ml-1 flex items-center gap-2">
            <BookHeart className="text-purple-600" size={18} /> Meu Diário
          </h3>
          <div className="space-y-3">
            {logs.filter((l) => l.type === 'mom_journal').length === 0 ? (
              <div className="bg-purple-50 border border-dashed border-purple-200 p-4 rounded-xl text-center text-sm text-purple-600 italic">
                Seu espaço seguro. Escreva seu primeiro desabafo hoje.
              </div>
            ) : (
              logs
                .filter((l) => l.type === 'mom_journal')
                .map((log) => (
                  <div key={log.id} className="bg-card p-4 rounded-xl border-l-4 border-purple-400 shadow-sm">
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-600">{log.date}</span>
                        {getMoodIcon(log.mood)}
                      </div>
                      <Lock size={12} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm text-foreground italic">"{log.note}"</p>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Child Info */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                {childName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{childName}</h3>
                <p className="text-xs text-muted-foreground">Criança especial</p>
              </div>
            </div>
          </div>
          <div className="bg-muted p-3 rounded-lg border border-border mb-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Resumo Clínico</p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-card border border-border px-2 py-1 rounded text-foreground">
                {childDiagnosis}
              </span>
              <span className="text-xs bg-card border border-border px-2 py-1 rounded text-foreground">
                CID: {childCID}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('report')}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary/20 transition-colors"
          >
            <File size={16} /> Ver Prontuário & Relatório
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
