import React, { useState } from 'react';
import { ICONS, GAME_IDS, GAME_VISUALS, Icon, GameBadge, GameShape, IconName, VisualGameId } from '@design/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const DevIconGalleryScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [filter, setFilter] = useState('');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const iconNames = (Object.keys(ICONS) as IconName[]).sort();
  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedName(text);
    setTimeout(() => setCopiedName(null), 1500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[var(--primary-action)] text-white">
              Dev Gallery
            </span>
            <span className="text-xs font-mono text-[var(--on-container-variant)]">
              {iconNames.length} Icons · {GAME_IDS.length} Games
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Faith Tribe Icon Kit</h1>
          <p className="text-xs sm:text-sm text-[var(--on-container-variant)]">
            Visual audit gallery displaying all icons in Line and Tonal, plus Game Badges and Shapes.
          </p>
        </div>

        {onBack && (
          <Button variant="tonal" size="md" pill onClick={onBack} leftIcon={<Icon name="arrow-left" size={16} />}>
            Back to App
          </Button>
        )}
      </div>

      {/* Section 1: Game Badges & Identities */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Icon name="medal" size={20} className="text-[var(--primary-action)]" />
          <span>Game Badges &amp; Identities ({GAME_IDS.length})</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAME_IDS.map((gid) => {
            const visual = GAME_VISUALS[gid];
            return (
              <Card key={gid} variant="elevated" padding="md" className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: visual.ink }}>
                    {visual.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--surface-container)]">
                    {gid}
                  </span>
                </div>

                <div className="flex items-center justify-around py-3 rounded-2xl" style={{ backgroundColor: visual.container }}>
                  <div className="flex flex-col items-center gap-1">
                    <GameBadge game={gid} variant="tonal" size={48} />
                    <span className="text-[10px] font-bold" style={{ color: visual.ink }}>Tonal</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <GameBadge game={gid} variant="solid" size={48} />
                    <span className="text-[10px] font-bold" style={{ color: visual.ink }}>Solid</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <GameShape game={gid} size={40} className="opacity-90" />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: visual.ink }}>Shape</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono opacity-80 pt-1 border-t border-[var(--border-tint)]">
                  <span>Ink: {visual.ink}</span>
                  <span>Container: {visual.container}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section 2: Universal Icon Kit */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Icon name="star" size={20} className="text-[var(--primary-action)]" />
            <span>Universal Icons ({filteredIcons.length} of {iconNames.length})</span>
          </h2>

          <input
            type="text"
            placeholder="Search icons (e.g. host, timer, wheat)..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-64 h-10 px-3 rounded-xl bg-[var(--surface-card)] text-[var(--on-container)] border border-[var(--border-tint)] text-xs font-medium outline-none focus:border-[var(--primary-action)]"
          />
        </div>

        {copiedName && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold text-center animate-fadeIn">
            Copied &lt;Icon name=&quot;{copiedName}&quot; /&gt; to clipboard!
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredIcons.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleCopy(name)}
              className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] hover:border-[var(--primary-action)] transition-all flex flex-col items-center gap-2 text-center group cursor-pointer hover:shadow-md"
              title="Click to copy name"
            >
              <div className="flex items-center gap-3 py-1">
                <div className="flex flex-col items-center gap-1">
                  <Icon name={name} variant="line" size={24} className="text-[var(--on-container)] group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-mono text-[var(--on-container-variant)]">line</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Icon name={name} variant="tonal" size={24} className="text-[var(--primary-action)] group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-mono text-[var(--primary-action)]">tonal</span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold truncate max-w-full text-[var(--on-container)]">
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
