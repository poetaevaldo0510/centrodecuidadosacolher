import logoFull from '@/assets/logo-acolher.png';
import logoIcon from '@/assets/logo-icon.png';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { full: 'h-8', icon: 'h-8 w-8' },
  md: { full: 'h-10', icon: 'h-10 w-10' },
  lg: { full: 'h-14', icon: 'h-14 w-14' },
  xl: { full: 'h-20', icon: 'h-20 w-20' },
};

const Logo = ({ variant = 'full', size = 'md', className = '' }: LogoProps) => {
  const src = variant === 'full' ? logoFull : logoIcon;
  const sizeClass = sizeMap[size][variant];

  return (
    <img
      src={src}
      alt="Acolher - Centro de Cuidados"
      className={`${sizeClass} object-contain ${className}`}
    />
  );
};

export default Logo;
