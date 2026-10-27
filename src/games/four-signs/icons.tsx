import React from 'react';
import {
  Sun,
  Moon,
  Star,
  Cloud,
  CloudRain,
  Zap,
  Wind,
  Flame,
  Droplet,
  Waves,
  Mountain,
  Trees,
  Leaf,
  Flower2,
  Apple,
  Gift,
  Coins,
  Wine,
  Lamp,
  MessageSquare,
  Scroll,
  Landmark,
  Tent,
  Bird,
  Fish,
  Eye,
  Hand,
  Heart,
  Footprints,
  Link,
  Scissors,
  Anchor,
  Key,
  Crown,
  Scale,
  Hammer,
  Sword,
  Shield,
  Home,
  DoorClosed,
  Castle,
  Crosshair,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

export interface ParsedClue {
  type: 'icon' | 'word';
  value: string;
}

export function parseClue(clue: string): ParsedClue {
  if (clue.startsWith('i:')) {
    return { type: 'icon', value: clue.substring(2) };
  }
  if (clue.startsWith('w:')) {
    return { type: 'word', value: clue.substring(2) };
  }
  return { type: 'word', value: clue };
}

// Visual label for icons
export const ICON_LABELS: Record<string, string> = {
  sun: 'Sun',
  moon: 'Moon',
  star: 'Star',
  cloud: 'Cloud',
  rain: 'Rain',
  storm: 'Storm',
  wind: 'Wind',
  flame: 'Fire / Flame',
  drop: 'Water Drop',
  waves: 'Waves / Waters',
  river: 'River',
  rainbow: 'Rainbow',
  mountain: 'Mountain',
  cave: 'Cave',
  tree: 'Tree',
  leaf: 'Leaf',
  olive: 'Olive Branch',
  wheat: 'Wheat',
  seed: 'Seed',
  flower: 'Flower',
  grapes: 'Grapes',
  fruit: 'Fruit',
  honey: 'Honey',
  salt: 'Salt',
  island: 'Island',
  bread: 'Bread / Loaf',
  basket: 'Basket',
  jar: 'Jar of Oil',
  gift: 'Gift',
  chest: 'Treasure Chest',
  coins: 'Silver Coins',
  cup: 'Cup / Chalice',
  lamp: 'Lamp',
  candle: 'Candle',
  speech: 'Words / Voice',
  cross: 'Cross',
  nails: 'Nails',
  thorns: 'Crown of Thorns',
  shofar: 'Ram Horn / Shofar',
  tablets: 'Stone Tablets',
  scroll: 'Sacred Scroll',
  altar: 'Altar',
  temple: 'Temple',
  tent: 'Tent',
  bird: 'Dove / Bird',
  fish: 'Fish',
  sheep: 'Lamb / Sheep',
  lion: 'Lion',
  serpent: 'Serpent',
  frog: 'Frog (Plague)',
  baby: 'Baby',
  wings: 'Angel Wings',
  eye: 'Eye / Vision',
  hand: 'Hand',
  heart: 'Heart',
  footprints: 'Footprints / March',
  chain: 'Chains',
  scissors: 'Shears / Haircut',
  staff: 'Shepherd Staff',
  harp: 'David\'s Harp',
  boat: 'Boat / Ark',
  net: 'Fishing Net',
  rock: 'Rock / Stone',
  keys: 'Kingdom Keys',
  crown: 'Royal Crown',
  ring: 'Signet Ring',
  coat: 'Coat of Colors',
  scales: 'Scales / Justice',
  ladder: 'Jacob\'s Ladder',
  hammer: 'Hammer',
  sword: 'Sword of Spirit',
  shield: 'Shield of Faith',
  helmet: 'Helmet of Salvation',
  spear: 'Spear',
  sling: 'Sling & Stone',
  sickle: 'Harvest Sickle',
  well: 'Water Well',
  pillars: 'Pillars',
  wall: 'City Wall',
  gate: 'City Gate',
  door: 'Doorway',
  tower: 'Watchtower',
  bricks: 'Bricks & Mortar',
  pyramid: 'Pyramid (Egypt)',
  house: 'House',
  anchor: 'Anchor of Hope',
};

// Lucide mapping with fallbacks
const LUCIDE_MAP: Record<string, LucideIcon> = {
  sun: Sun,
  moon: Moon,
  star: Star,
  cloud: Cloud,
  rain: CloudRain,
  storm: Zap,
  wind: Wind,
  flame: Flame,
  drop: Droplet,
  waves: Waves,
  river: Waves,
  rainbow: Sparkles,
  mountain: Mountain,
  cave: Mountain,
  tree: Trees,
  leaf: Leaf,
  olive: Leaf,
  wheat: Sparkles,
  seed: Sparkles,
  flower: Flower2,
  grapes: Apple,
  fruit: Apple,
  honey: Droplet,
  salt: Sparkles,
  island: Mountain,
  bread: Apple,
  basket: Gift,
  jar: Wine,
  gift: Gift,
  chest: Gift,
  coins: Coins,
  cup: Wine,
  lamp: Lamp,
  candle: Flame,
  speech: MessageSquare,
  cross: Sparkles,
  nails: Crosshair,
  thorns: Crown,
  shofar: Wind,
  tablets: Scroll,
  scroll: Scroll,
  altar: Landmark,
  temple: Landmark,
  tent: Tent,
  bird: Bird,
  fish: Fish,
  sheep: Heart,
  lion: Sparkles,
  serpent: Sparkles,
  frog: Sparkles,
  baby: Heart,
  wings: Bird,
  eye: Eye,
  hand: Hand,
  heart: Heart,
  footprints: Footprints,
  chain: Link,
  scissors: Scissors,
  staff: Crosshair,
  harp: Sparkles,
  boat: Waves,
  net: Crosshair,
  rock: Mountain,
  keys: Key,
  crown: Crown,
  ring: Sparkles,
  coat: Sparkles,
  scales: Scale,
  ladder: Link,
  hammer: Hammer,
  sword: Sword,
  shield: Shield,
  helmet: Shield,
  spear: Sword,
  sling: Crosshair,
  sickle: Scissors,
  well: Droplet,
  pillars: Landmark,
  wall: Landmark,
  gate: DoorClosed,
  door: DoorClosed,
  tower: Castle,
  bricks: Castle,
  pyramid: Mountain,
  house: Home,
  anchor: Anchor,
};

export interface FourSignClueCardProps {
  clue: string;
  index: number;
  revealed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FourSignClueCard: React.FC<FourSignClueCardProps> = ({
  clue,
  index,
  revealed = true,
  size = 'md',
  className = '',
}) => {
  const parsed = parseClue(clue);
  const IconComp = parsed.type === 'icon' ? LUCIDE_MAP[parsed.value] || Sparkles : null;
  const label = parsed.type === 'icon' ? ICON_LABELS[parsed.value] || parsed.value : parsed.value;

  if (!revealed) {
    return (
      <div
        className={`relative rounded-2xl border-2 border-dashed border-[var(--border-tint)]/60 bg-[var(--surface-container)] flex flex-col items-center justify-center text-center p-3 transition-all ${
          size === 'sm' ? 'h-24' : size === 'lg' ? 'h-48' : 'h-36'
        } ${className}`}
      >
        <span className="w-8 h-8 rounded-full bg-[var(--surface-container-high)] text-[var(--on-container-variant)] font-extrabold text-sm flex items-center justify-center">
          #{index + 1}
        </span>
        <span className="text-xs font-semibold text-[var(--on-container-variant)] mt-2">
          Hidden Sign
        </span>
      </div>
    );
  }

  if (parsed.type === 'word') {
    return (
      <div
        className={`relative rounded-2xl border border-[var(--border-tint)] bg-gradient-to-br from-[var(--surface-card)] to-[var(--surface-container)] shadow-sm flex flex-col items-center justify-center text-center p-4 transition-all animate-fadeIn ${
          size === 'sm' ? 'h-24' : size === 'lg' ? 'h-48' : 'h-36'
        } ${className}`}
      >
        <div className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
          Sign #{index + 1} • Word
        </div>
        <div className="text-2xl opacity-40 mb-1 text-amber-500 font-serif">“</div>
        <p className={`font-serif italic font-bold text-[var(--on-container)] ${size === 'lg' ? 'text-lg sm:text-xl' : size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {parsed.value}
        </p>
      </div>
    );
  }

  // Icon Clue
  return (
    <div
      className={`relative rounded-2xl border border-[var(--border-tint)] bg-gradient-to-b from-[var(--surface-card)] to-[var(--surface-container)] shadow-sm flex flex-col items-center justify-center text-center p-3 transition-all animate-fadeIn ${
        size === 'sm' ? 'h-24' : size === 'lg' ? 'h-48' : 'h-36'
      } ${className}`}
    >
      <div className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
        Sign #{index + 1}
      </div>

      <div
        className={`rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner ${
          size === 'lg' ? 'w-20 h-20 mb-2' : size === 'sm' ? 'w-10 h-10 mb-1' : 'w-14 h-14 mb-2'
        }`}
      >
        {IconComp && <IconComp size={size === 'lg' ? 42 : size === 'sm' ? 22 : 30} strokeWidth={2.2} />}
      </div>

      <span
        className={`font-extrabold capitalize text-[var(--on-container)] tracking-tight ${
          size === 'lg' ? 'text-base' : size === 'sm' ? 'text-[11px]' : 'text-xs sm:text-sm'
        }`}
      >
        {label}
      </span>
    </div>
  );
};
