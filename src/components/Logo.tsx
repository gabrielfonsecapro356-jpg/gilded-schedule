import { Scissors } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 bg-gradient-gold rounded-full opacity-20 blur-lg" />
        <div className="relative w-full h-full bg-gradient-gold rounded-full flex items-center justify-center shadow-gold">
          <Scissors className="w-1/2 h-1/2 text-primary-foreground rotate-[-45deg]" />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-heading font-bold ${textSizeClasses[size]} text-gradient-gold`}>
            BarberPro
          </span>
          <span className="text-xs text-muted-foreground tracking-widest uppercase">
            Management System
          </span>
        </div>
      )}
    </div>
  );
}
