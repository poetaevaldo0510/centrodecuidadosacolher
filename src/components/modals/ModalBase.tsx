import { X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ReactNode } from 'react';

interface ModalBaseProps {
  children: ReactNode;
  title: string;
  icon?: ReactNode;
  variant?: 'default' | 'accent' | 'purple' | 'fullscreen';
  maxWidth?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  onClose?: () => void;
}

const ModalBase = ({
  children,
  title,
  icon,
  variant = 'default',
  maxWidth = 'sm',
  showCloseButton = true,
  onClose,
}: ModalBaseProps) => {
  const { setActiveModal } = useAppStore();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setActiveModal(null);
    }
  };

  const overlayClasses = {
    default: 'bg-black/50',
    accent: 'bg-accent/50',
    purple: 'bg-primary/50',
    fullscreen: 'bg-accent',
  };

  const containerClasses = {
    default: 'bg-card border-t-4 border-primary',
    accent: 'bg-card border-t-4 border-accent',
    purple: 'bg-card border-t-4 border-purple-500',
    fullscreen: '',
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  // Fullscreen variant has different structure
  if (variant === 'fullscreen') {
    return (
      <div className={`fixed inset-0 z-[80] ${overlayClasses[variant]} flex flex-col items-center justify-center p-8 text-center animate-fade-in`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[60] ${overlayClasses[variant]} flex items-end sm:items-center justify-center p-4 animate-fade-in`}>
      <div className={`${containerClasses[variant]} w-full ${maxWidthClasses[maxWidth]} rounded-2xl p-6 shadow-2xl animate-slide-in-from-bottom`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            {icon}
            {title}
          </h3>
          {showCloseButton && (
            <button 
              onClick={handleClose} 
              className="p-1 bg-muted rounded-full hover:bg-muted/80 transition-colors"
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default ModalBase;
