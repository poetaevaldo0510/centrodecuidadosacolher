import { useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const ChatModal = () => {
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([
    { from: 'them', text: `Olá! Vi que temos filhos com a mesma idade.` },
  ]);
  const { chatUser, setActiveModal, setChatUser } = useAppStore();

  if (!chatUser) return null;

  const send = () => {
    if (!msg) return;
    setMsgs([...msgs, { from: 'me', text: msg }]);
    setMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-card flex flex-col animate-slide-in-from-right">
      <div className="p-4 bg-primary text-primary-foreground flex items-center gap-3 shadow-md">
        <button
          onClick={() => {
            setActiveModal(null);
            setChatUser(null);
          }}
        >
          <ChevronLeft />
        </button>
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
          {chatUser?.name.charAt(0)}
        </div>
        <h3 className="font-bold text-sm">{chatUser?.name}</h3>
      </div>
      <div className="flex-1 bg-muted p-4 space-y-4 overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                m.from === 'me' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t bg-card flex gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && send()}
          placeholder="Digite..."
          className="flex-1 bg-muted rounded-full px-4 py-2 outline-none"
        />
        <button onClick={send} className="bg-primary text-primary-foreground p-2 rounded-full">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatModal;
