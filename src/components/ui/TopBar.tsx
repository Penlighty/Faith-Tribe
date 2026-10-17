import React from 'react';
import { Home, Play, Gamepad2, Settings, Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import { TYPOGRAPHY } from '../../theme/tokens';
import { NavTabId } from './BottomNav';
import { useTheme } from '../../theme/ThemeContext';
import { useSession } from '../../engine/session/SessionContext';
import { Avatar } from './Avatar';

export interface TopBarProps {
  title: string;
  subtitle?: string;
  badge?: string;
  leftAction?: React.ReactNode;
  rightActions?: React.ReactNode;
  activeTab?: NavTabId;
  onTabChange?: (tab: NavTabId) => void;
  className?: string;
}

const NAV_ITEMS: { id: NavTabId; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'play', label: 'Join Room', icon: Play },
  { id: 'games', label: 'Game Library', icon: Gamepad2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  badge = 'Beta',
  leftAction,
  rightActions,
  activeTab,
  onTabChange,
  className = '',
}) => {
  const { mode, setMode, isDark, soundEnabled, setSoundEnabled, triggerHaptic } = useTheme();
  const { currentUser } = useSession();

  const handleToggleTheme = () => {
    triggerHaptic('light');
    setMode(isDark ? 'light' : 'dark');
  };

  const handleToggleSound = () => {
    triggerHaptic('light');
    setSoundEnabled(!soundEnabled);
  };

  return (
    <header className={`w-full flex items-center justify-between py-3.5 px-4 sm:px-6 lg:px-8 select-none border-b border-[var(--border-tint)]/40 bg-[var(--bg-tint)]/80 backdrop-blur-md sticky top-0 z-30 transition-all ${className}`}>
      {/* Brand & Left action */}
      <div className="flex items-center gap-3 min-w-0">
        {leftAction && <div className="shrink-0">{leftAction}</div>}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary-action)] text-[var(--primary-action-text)] flex items-center justify-center text-base shadow-sm shrink-0">
            🕊️
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={`${TYPOGRAPHY.screenTitle} text-[var(--on-container)] truncate leading-tight`}>
                {title}
              </h1>
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-container-high)] text-[var(--on-container-variant)] border border-[var(--border-tint)] shrink-0">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <span className="text-xs text-[var(--on-container-variant)] truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      {onTabChange && (
        <nav className="hidden md:flex items-center gap-1 bg-[var(--surface-container)] p-1 rounded-full border border-[var(--border-tint)] shadow-sm">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic('selection');
                  onTabChange(item.id);
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--surface-card)] text-[var(--primary-action)] shadow-sm'
                    : 'text-[var(--on-container-variant)] hover:text-[var(--on-container)] hover:bg-[var(--surface-container-high)]/60'
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Right Actions & Desktop Quick Utilities */}
      <div className="flex items-center gap-2 shrink-0">
        {rightActions}

        {/* Desktop Quick Toggles */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={handleToggleSound}
            className="w-9 h-9 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--on-container)] transition-colors cursor-pointer border border-[var(--border-tint)]/60"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="opacity-60" />}
          </button>

          <button
            onClick={handleToggleTheme}
            className="w-9 h-9 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--on-container)] transition-colors cursor-pointer border border-[var(--border-tint)]/60"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>
        </div>

        {/* User Avatar pill on tablet/desktop */}
        {currentUser && (
          <div className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs font-semibold">
            <Avatar name={currentUser.name} size="sm" />
            <span className="truncate max-w-[110px] text-[var(--on-container)]">{currentUser.name}</span>
          </div>
        )}
      </div>
    </header>
  );
};

