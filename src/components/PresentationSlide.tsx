import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PresentationSlideProps {
  children: ReactNode;
  className?: string;
  isActive: boolean;
}

export const PresentationSlide = ({ children, className, isActive }: PresentationSlideProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center px-12 py-16 transition-all duration-600 ease-out",
        isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none",
        className
      )}
    >
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
        {children}
      </div>
    </div>
  );
};
