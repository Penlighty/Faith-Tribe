// Faith Tribe Visual Identity - 12 Ancestral Tribe Character Avatars
// Vector emblems with rich personality matching biblical archetypes (no emojis)

import React from 'react';
import { TRIBES_BY_ID, TribeDefinition } from '../../design/tribes/tribes';

export type TribeAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

interface TribeAvatarProps {
  tribeId: string;
  size?: TribeAvatarSize;
  className?: string;
  showBorder?: boolean;
  showGlow?: boolean;
  withTooltip?: boolean;
}

const SIZE_CONFIG: Record<TribeAvatarSize, { px: number; iconSize: number; strokeWidth: number }> = {
  xs: { px: 28, iconSize: 18, strokeWidth: 1.5 },
  sm: { px: 36, iconSize: 22, strokeWidth: 1.8 },
  md: { px: 48, iconSize: 30, strokeWidth: 2 },
  lg: { px: 64, iconSize: 40, strokeWidth: 2.2 },
  xl: { px: 88, iconSize: 56, strokeWidth: 2.4 },
  hero: { px: 112, iconSize: 72, strokeWidth: 2.5 },
};

export const TribeAvatar: React.FC<TribeAvatarProps> = ({
  tribeId,
  size = 'md',
  className = '',
  showBorder = true,
  showGlow = false,
  withTooltip = true,
}) => {
  const tribe: TribeDefinition = TRIBES_BY_ID[tribeId] || TRIBES_BY_ID['judah'];
  const { px, iconSize } = SIZE_CONFIG[size];

  const renderEmblemVector = () => {
    switch (tribe.id) {
      // 1. ISSACHAR - Celestial Sage (Sundial, Sunburst, Moon & Constellation Stars of Seasons)
      case 'issachar':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Outer Chronos Sundial Ring */}
            <circle cx="24" cy="24" r="21" strokeWidth="2" strokeDasharray="2 3" opacity="0.6" />
            <circle cx="24" cy="24" r="17" strokeWidth="1.8" />
            {/* Center Solar Disc */}
            <circle cx="24" cy="24" r="6" fill="currentColor" fillOpacity="0.25" strokeWidth="2" />
            {/* Cardinal Radiating Rays */}
            <path d="M24 3v4M24 41v4M3 24h4M41 24h4" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M9 9l3 3M36 36l3 3M9 39l3-3M36 12l3-3" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
            {/* Crescent Moon of the Months & 7-Pointed Star of Seasons */}
            <path d="M24 18a6 6 0 100 12c-2.5 0-4.5-2.7-4.5-6s2-6 4.5-6z" fill="currentColor" />
            <circle cx="31" cy="17" r="1.5" fill="currentColor" />
            <circle cx="17" cy="31" r="1.5" fill="currentColor" />
          </svg>
        );

      // 2. JUDAH - The Royal Lion & Scepter
      case 'judah':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Regal Crown / Scepter Tip Top */}
            <path d="M19 6l5-3 5 3-2 5h-6l-2-5z" fill="currentColor" strokeWidth="1.5" />
            <circle cx="24" cy="3" r="1.5" fill="currentColor" />
            {/* Majestic Lion Face & Mane Silhouette */}
            <path
              d="M14 17c-3 3-5 8-4 13 1.2 5.5 5 10 10 12h8c5-2 8.8-6.5 10-12 1-5-1-10-4-13"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Mane radiating locks */}
            <path d="M11 20c-2.5 3-3 7-2 11M37 20c2.5 3 3 7 2 11" strokeWidth="2" strokeLinecap="round" />
            {/* Lion Muzzle & Nose */}
            <path d="M21 27l3 3 3-3v-4h-6v4z" fill="currentColor" strokeWidth="1.5" />
            <path d="M24 30v4m-3 0c0 1.5 1.5 2.5 3 2.5s3-1 3-2.5" strokeWidth="2" strokeLinecap="round" />
            {/* Noble Lion Eyes */}
            <path d="M18 21l3 1M30 21l-3 1" strokeWidth="2.4" strokeLinecap="round" />
            {/* Scepter Cross Base */}
            <path d="M24 38v5M21 41h6" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      // 3. LEVI - High Priest Breastplate with 12 Jewel Insets & Holy Altar Flame
      case 'levi':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Eternal Sacred Altar Flame at top */}
            <path
              d="M24 3c2 3.5 5 5 5 8.5 0 3-2.2 5.5-5 5.5s-5-2.5-5-5.5c0-3.5 3-5 5-8.5z"
              fill="currentColor"
              fillOpacity="0.3"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M24 7c1 1.8 2.5 2.8 2.5 4.5 0 1.5-1.1 2.5-2.5 2.5s-2.5-1-2.5-2.5c0-1.7 1.5-2.7 2.5-4.5z" fill="currentColor" />
            {/* Priest Pectoral Breastplate Frame */}
            <rect x="11" y="17" width="26" height="26" rx="4" strokeWidth="2.2" fill="currentColor" fillOpacity="0.1" />
            {/* Hanging Chains / Golden Rings */}
            <path d="M15 17v-4M33 17v-4" strokeWidth="2" strokeLinecap="round" />
            {/* 12 Inset Stones (3x4 Grid of Gems) */}
            <rect x="15" y="21" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="22" y="21" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="29" y="21" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="15" y="28" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="22" y="28" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="29" y="28" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="15" y="35" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="22" y="35" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="29" y="35" width="4" height="4" rx="1" fill="currentColor" />
          </svg>
        );

      // 4. BENJAMIN - Courageous Wolf & Marksman Bow-Arrow
      case 'benjamin':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Tactician Marksman Bow Arc */}
            <path d="M37 9c6 8 6 22 0 30" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M37 9l-1 30" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
            {/* Arrow on String aiming forward */}
            <path d="M12 24h25M17 19l-5 5 5 5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            {/* Wolf Ear & Brow Silhouette */}
            <path
              d="M15 10l6 8 8-2 3 7-5 5 3 6-5 4-8-3-5 3v-7l-4-5 6-7-1-9z"
              fill="currentColor"
              fillOpacity="0.2"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Wolf Keen Eye */}
            <circle cx="21" cy="20" r="1.8" fill="currentColor" />
          </svg>
        );

      // 5. ZEBULUN - Seafaring Galley Vessel & Coastal Haven Anchor
      case 'zebulun':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Tall Ship Mast & Billowing Sail */}
            <path d="M24 6v24" strokeWidth="2.4" strokeLinecap="round" />
            <path
              d="M24 7c7 1 14 5 14 13-6 0-11-2-14-3V7z"
              fill="currentColor"
              fillOpacity="0.3"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M24 10c-5 1-10 4-10 10 4 0 7-1 10-2V10z" strokeWidth="1.8" />
            {/* Galley Hull on the Deep */}
            <path
              d="M8 29c8 2 24 2 32 0-2 7-9 10-16 10S10 36 8 29z"
              fill="currentColor"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Ocean Crest Waves */}
            <path
              d="M4 41c4-2 7-2 11 0s7 2 11 0 7-2 11 0 5 1 7 0"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );

      // 6. JOSEPH - Fruitful Bough by the Well with Over-The-Wall Vines
      case 'joseph':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Deep Wellspring Base */}
            <ellipse cx="24" cy="38" rx="14" ry="4" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
            <path d="M10 38v4c0 2.2 6.3 4 14 4s14-1.8 14-4v-4" strokeWidth="2" />
            {/* Central Living Trunk */}
            <path d="M24 38V18" strokeWidth="2.8" strokeLinecap="round" />
            {/* Branches Climbing Over the Wall (Left & Right arches) */}
            <path d="M24 28c-6-1-12-6-13-13 6 0 11 3 13 8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 23c6-1 13-5 15-12-6 0-12 3-15 7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Fruit / Olive Cluster Nodes */}
            <circle cx="11" cy="15" r="3" fill="currentColor" />
            <circle cx="17" cy="10" r="2.5" fill="currentColor" />
            <circle cx="39" cy="11" r="3" fill="currentColor" />
            <circle cx="32" cy="7" r="2.5" fill="currentColor" />
            <circle cx="24" cy="12" r="3" fill="currentColor" />
          </svg>
        );

      // 7. NAPHTALI - Swift Mountain Gazelle (Hind on High Places)
      case 'naphtali':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Mountain Crags Base */}
            <path d="M6 42l11-13 7 7 10-14 8 20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Graceful Leaping Gazelle / Hind */}
            <path
              d="M12 28c2-4 7-8 12-8h6l6-8 2 2-4 9v6l-4 4-7-1-6 6-5-10z"
              fill="currentColor"
              fillOpacity="0.25"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Slender Antlers / Horns of Grace */}
            <path d="M34 14c2-5 6-8 9-9M32 17c0-4 3-7 6-8" strokeWidth="1.8" strokeLinecap="round" />
            {/* Swift Leaping Front Legs */}
            <path d="M32 30l6 8M27 34l3 7" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      // 8. ASHER - Cruse of Anointed Oil & Royal Wheat Sheaves
      case 'asher':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Holy Anointing Oil Vessel (Cruse) */}
            <path
              d="M21 11h6v4c3 3 5 8 5 14 0 6.6-3.6 12-8 12s-8-5.4-8-12c0-6 2-11 5-14v-4z"
              fill="currentColor"
              fillOpacity="0.2"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Vessel Neck & Rim */}
            <ellipse cx="24" cy="11" rx="4" ry="1.5" strokeWidth="2" />
            {/* Holy Oil Droplet Rising */}
            <path
              d="M24 17c1.5 2 3 3.5 3 5s-1.3 2.5-3 2.5-3-1-3-2.5 1.5-3 3-5z"
              fill="currentColor"
            />
            {/* Flourishing Royal Olive & Wheat Garlands (Left & Right) */}
            <path d="M11 36c-4-4-5-12-2-18 2 4 4 7 7 9" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="18" r="2" fill="currentColor" />
            <path d="M37 36c4-4 5-12 2-18-2 4-4 7-7 9" strokeWidth="2" strokeLinecap="round" />
            <circle cx="39" cy="18" r="2" fill="currentColor" />
          </svg>
        );

      // 9. GAD - Vanguard Warrior Shield & Victory Standard
      case 'gad':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Vanguard Battle Shield */}
            <path
              d="M24 5l16 5v14c0 12-7 20-16 23-9-3-16-11-16-23V10l16-5z"
              fill="currentColor"
              fillOpacity="0.2"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Central Embossed Cross / Boss */}
            <circle cx="24" cy="24" r="7" strokeWidth="2" />
            <path d="M24 14v20M14 24h20" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="24" cy="24" r="2.5" fill="currentColor" />
            {/* Overcomer Stars */}
            <circle cx="24" cy="10" r="1.5" fill="currentColor" />
            <circle cx="18" cy="33" r="1.5" fill="currentColor" />
            <circle cx="30" cy="33" r="1.5" fill="currentColor" />
          </svg>
        );

      // 10. DAN - Scales of Righteousness & Watchful Arbiter
      case 'dan':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Central Pillar of Justice */}
            <path d="M24 6v34M16 40h16" strokeWidth="2.4" strokeLinecap="round" />
            {/* Top Watchful Eagle Finial */}
            <path d="M19 9c2-3 5-4 5-4s3 1 5 4c-3 1-7 1-10 0z" fill="currentColor" />
            {/* Horizontal Balance Beam */}
            <path d="M10 14h28" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="24" cy="14" r="2" fill="currentColor" />
            {/* Left Balance Scale Pan & Strings */}
            <path d="M10 14l-4 9h8l-4-9z" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M6 23c0 2.5 1.8 4 4 4s4-1.5 4-4" fill="currentColor" fillOpacity="0.25" strokeWidth="1.8" />
            {/* Right Balance Scale Pan & Strings */}
            <path d="M38 14l-4 9h8l-4-9z" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M34 23c0 2.5 1.8 4 4 4s4-1.5 4-4" fill="currentColor" fillOpacity="0.25" strokeWidth="1.8" />
          </svg>
        );

      // 11. REUBEN - Majestic Living River & Dawn Sunburst
      case 'reuben':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Dawn Sun of the Firstborn */}
            <circle cx="24" cy="15" r="7" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
            <path d="M24 4v4M13 15h-4M39 15h-4M16 7l3 3M32 7l-3 3" strokeWidth="2" strokeLinecap="round" />
            {/* Cascading Living River Streams (Dignified Might) */}
            <path
              d="M10 26c5-3 10 3 14 0s9-3 14 0"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M8 33c6-3 10 3 16 0s10-3 16 0"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M6 40c7-3 12 3 18 0s11-3 18 0"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
        );

      // 12. SIMEON - Fortified Rampart & Covenant Twin Blades
      case 'simeon':
        return (
          <svg viewBox="0 0 48 48" width={iconSize} height={iconSize} fill="none" stroke="currentColor">
            {/* Fortified City Watchtower Rampart */}
            <path
              d="M12 40V24l3-3v-4h4v3h4v-3h4v3h4v-3h4v4l3 3v16H12z"
              fill="currentColor"
              fillOpacity="0.15"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Fortress Gate Arch */}
            <path d="M20 40v-8c0-2.2 1.8-4 4-4s4 1.8 4 4v8" strokeWidth="2.2" />
            {/* Twin Crossed Covenant Blades of Fierce Resolve */}
            <path d="M15 11l18 18M33 11L15 29" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M13 13l4-4M35 13l-4-4" strokeWidth="2" strokeLinecap="round" />
            {/* Watchtower Eye Finial */}
            <circle cx="24" cy="22" r="2" fill="currentColor" />
          </svg>
        );

      default:
        return null;
    }
  };

  const containerStyle: React.CSSProperties = {
    width: px,
    height: px,
    backgroundColor: tribe.container,
    color: tribe.ink,
    borderColor: showBorder ? tribe.accent : 'transparent',
    boxShadow: showGlow ? `0 0 16px ${tribe.accent}66` : undefined,
  };

  return (
    <div
      style={containerStyle}
      title={withTooltip ? `${tribe.name} • ${tribe.title} (${tribe.source})` : undefined}
      className={`relative rounded-2xl flex items-center justify-center shrink-0 transition-transform select-none ${
        showBorder ? 'border-2' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-center drop-shadow-xs transition-transform hover:scale-105">
        {renderEmblemVector()}
      </div>
    </div>
  );
};
