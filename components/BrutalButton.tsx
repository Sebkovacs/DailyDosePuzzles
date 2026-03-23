import React from 'react';

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function BrutalButton({ 
  children, 
  variant = 'secondary', 
  fullWidth = false,
  className = '',
  icon,
  ...props 
}: BrutalButtonProps) {
  // The core neo-brutalism interactive mechanics
  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2 font-black tracking-wider border-2 border-[#1A1A1A] rounded-md transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_#1A1A1A]";
  
  // Distinct color themes mapping to your app's current design system
  const variants = {
    primary: "bg-[#1A1A1A] text-white shadow-[4px_4px_0px_#1A1A1A] hover:bg-neutral-800",
    secondary: "bg-white text-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] hover:bg-neutral-100",
    success: "bg-[#00FF00] text-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] hover:bg-emerald-400",
    danger: "bg-red-500 text-white shadow-[4px_4px_0px_#1A1A1A] hover:bg-red-600",
    warning: "bg-[#F27D26] text-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] hover:bg-amber-500",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}