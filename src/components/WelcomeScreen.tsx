import Logo from '@/components/Logo';

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
        <Logo variant="icon" size="xl" className="mb-6 animate-bounce-soft drop-shadow-2xl brightness-0 invert" />
        <h1 className="text-5xl font-bold mb-3 tracking-tight">Acolher</h1>
        <p className="text-primary-foreground/80 text-lg text-center font-medium">
          Sua memória, seu apoio, sua renda.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
