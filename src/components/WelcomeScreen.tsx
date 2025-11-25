import { Heart } from 'lucide-react';

interface WelcomeScreenProps {
  show: boolean;
}

const WelcomeScreen = ({ show }: WelcomeScreenProps) => {
  return (
    <div
      className={`fixed inset-0 z-[60] bg-primary text-primary-foreground flex flex-col items-center justify-center transition-all duration-1000 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-full max-w-sm p-8 flex flex-col items-center animate-zoom-in">
        <Heart size={80} className="animate-bounce-soft mb-6 text-accent fill-accent" />
        <h1 className="text-5xl font-bold mb-3 tracking-tight">Acolher</h1>
        <p className="text-primary-foreground/80 text-lg text-center font-medium">
          Sua memória, seu apoio, sua renda.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
