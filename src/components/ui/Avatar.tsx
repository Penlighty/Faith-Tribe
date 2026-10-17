import React from 'react';
import { Crown } from 'lucide-react';

export interface AvatarProps {
  name: string;
  avatarSeed?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isHost?: boolean;
  teamColor?: string;
  className?: string;
}

const PASTEL_BG_COLORS = [
  '#EDE58C', // butter
  '#CFEFD2', // mint
  '#E9E5F4', // lavender
  '#F9D6DB', // blush
  '#FCE3C8', // peach
  '#D7EAF7', // sky
];

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarSeed,
  size = 'md',
  isHost = false,
  teamColor,
  className = '',
}) => {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Deterministic pastel color from name or seed
  const hash = (avatarSeed || name || 'A')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgColor = teamColor || PASTEL_BG_COLORS[hash % PASTEL_BG_COLORS.length];

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-extrabold',
  }[size];

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        style={{ backgroundColor: bgColor }}
        className={`rounded-full flex items-center justify-center font-bold text-gray-900 border-2 border-white/80 dark:border-white/20 shadow-sm ${sizeClasses}`}
      >
        {initials}
      </div>
      {isHost && (
        <span
          title="Session Host"
          className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-sm"
        >
          <Crown size={size === 'sm' ? 8 : 12} className="fill-amber-950" />
        </span>
      )}
    </div>
  );
};
