import { MessageCircle } from 'lucide-react';

const FloatingWhatsApp = () => {
  const phoneNumber = '5511961226754';
  const message = 'Olá! Sou mãe atípica e gostaria de saber mais sobre o acolhimento do Centro.';
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5C] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
      aria-label="Conversar no WhatsApp"
    >
      <MessageCircle size={28} className="group-hover:animate-pulse" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card text-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-border">
        Fale conosco no WhatsApp
      </span>
      
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25"></span>
    </a>
  );
};

export default FloatingWhatsApp;
