import React from 'react';

interface ServiceLogoProps {
  name: string;
  logoKey?: string;
  customLogoUrl?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ServiceLogo: React.FC<ServiceLogoProps> = ({
  name,
  logoKey,
  customLogoUrl,
  color,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs rounded-lg',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-xl',
    xl: 'w-14 h-14 text-lg rounded-2xl',
  }[size];

  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt={`${name} logo`}
        className={`${sizeClasses} object-cover border border-slate-200 bg-white shadow-xs`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  // Generate a deterministic soft background if not provided
  const getInitial = (str: string) => {
    if (!str) return 'S';
    return str.slice(0, 2).toUpperCase();
  };

  const serviceColors: Record<string, { bg: string; text: string; iconText?: string }> = {
    netflix: { bg: 'bg-red-600', text: 'text-white', iconText: 'N' },
    spotify: { bg: 'bg-emerald-500', text: 'text-white', iconText: 'S' },
    chatgpt: { bg: 'bg-emerald-700', text: 'text-white', iconText: 'AI' },
    github: { bg: 'bg-slate-900', text: 'text-white', iconText: 'GH' },
    figma: { bg: 'bg-orange-500', text: 'text-white', iconText: 'Fg' },
    notion: { bg: 'bg-stone-900', text: 'text-white', iconText: 'N' },
    youtube: { bg: 'bg-rose-600', text: 'text-white', iconText: 'YT' },
    google: { bg: 'bg-blue-600', text: 'text-white', iconText: 'G' },
    canva: { bg: 'bg-cyan-600', text: 'text-white', iconText: 'Cv' },
    adobe: { bg: 'bg-red-600', text: 'text-white', iconText: 'Ps' },
    claude: { bg: 'bg-amber-600', text: 'text-white', iconText: 'Cl' },
    slack: { bg: 'bg-purple-800', text: 'text-white', iconText: 'Sl' },
    disney: { bg: 'bg-blue-800', text: 'text-white', iconText: 'D+' },
    apple: { bg: 'bg-slate-800', text: 'text-white', iconText: '' },
    vercel: { bg: 'bg-black', text: 'text-white', iconText: '▲' },
    microsoft: { bg: 'bg-blue-700', text: 'text-white', iconText: 'MS' },
  };

  const key = (logoKey || name.toLowerCase().replace(/[^a-z0-9]/g, '')).toLowerCase();
  const matched = Object.entries(serviceColors).find(([k]) => key.includes(k));

  if (matched) {
    const config = matched[1];
    return (
      <div
        className={`${sizeClasses} ${config.bg} ${config.text} font-bold flex items-center justify-center shrink-0 shadow-xs tracking-wider`}
      >
        {config.iconText || getInitial(name)}
      </div>
    );
  }

  // Fallback with custom color or pleasant slate
  const style = color ? { backgroundColor: color, color: '#ffffff' } : undefined;

  return (
    <div
      style={style}
      className={`${sizeClasses} ${
        !color ? 'bg-slate-800 text-white' : ''
      } font-semibold flex items-center justify-center shrink-0 shadow-xs`}
    >
      {getInitial(name)}
    </div>
  );
};
