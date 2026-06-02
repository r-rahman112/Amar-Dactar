import React from 'react';
import { ShieldPlus } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  iconSize?: string;
  light?: boolean;
}

export default function BrandLogo({ className = "", iconSize = "h-6 w-6", light = false }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${light ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'} p-1.5 rounded-lg shadow-sm`}>
        <ShieldPlus className={iconSize} />
      </div>
      <span className={`font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight whitespace-nowrap ${light ? 'text-white' : 'text-slate-900'} font-brand`}>
        আমার ডাক্তার
      </span>
    </div>
  );
}
