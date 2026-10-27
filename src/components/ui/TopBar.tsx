import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Icon, type IconName } from '../../design/icons';
import markOnDark from '../../assets/brand/mark-on-dark.svg';
import markOnLight from '../../assets/brand/mark-on-light.svg';
import { TYPOGRAPHY } from '../../theme/tokens';
import { NavTabId } from './BottomNav';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../engine/auth/AuthContext';
import { Avatar } from './Avatar';
import { AuthModal } from '../auth/AuthModal';
import { TribeAvatar } from '../tribes/TribeAvatar';
import { TRIBES_BY_ID } from '../../design/tribes/tribes';

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

const NAV_ITEMS: { id: NavTabId; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'path', label: 'Journey', icon: 'star' },
  { id: 'play', label: 'Join', icon: 'play' },
  { id: 'games', label: 'Games', icon: 'games' },
  { id: 'tribe', label: 'Fellowship', icon: 'team' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
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
  const { setMode, isDark, soundEnabled, setSoundEnabled, triggerHaptic } = useTheme();
  const { user, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleToggleTheme = () => {
    triggerHaptic('light');
    setMode(isDark ? 'light' : 'dark');
  };

  const handleToggleSound = () => {
    triggerHaptic('light');
    setSoundEnabled(!soundEnabled);
  };

  return (
    <header className={`w-full flex items-center justify-between py-2.5 px-4 sm:px-6 lg:px-8 select-none border-b border-[var(--border-tint)]/40 bg-[var(--bg-tint)]/90 backdrop-blur-md sticky top-0 z-30 transition-all ${className}`}>
      {/* Brand & Left action */}
      <div className="flex items-center gap-3 shrink-0">
        {leftAction && <div className="shrink-0">{leftAction}</div>}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src={isDark ? markOnDark : markOnLight}
            alt="Faith Tribe Logo"
            className="w-8 h-8 rounded-xl object-contain shadow-xs shrink-0"
          />
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-black text-lg sm:text-xl tracking-tight text-[var(--on-container)] select-none">
              Faith Tribe
            </span>
            {badge && (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[var(--surface-container-high)] text-[var(--on-container-variant)]/80 border border-[var(--border-tint)]/60 shrink-0">
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      {onTabChange && (
        <nav className="hidden lg:flex items-center gap-0.5 bg-[var(--surface-container)]/70 backdrop-blur-md p-1 rounded-full border border-[var(--border-tint)]/60 shadow-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic('selection');
                  onTabChange(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--surface-card)] text-[var(--primary-action)] shadow-sm'
                    : 'text-[var(--on-container-variant)] hover:text-[var(--on-container)] hover:bg-[var(--surface-container-high)]/60'
                }`}
              >
                <Icon name={item.icon} variant={isActive ? 'tonal' : 'line'} size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Right Actions & Desktop Quick Utilities */}
      <div className="flex items-center gap-2 shrink-0 relative">
        {rightActions}

        {/* Desktop Quick Toggles */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={handleToggleSound}
            className="w-8 h-8 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--on-container)] transition-colors cursor-pointer border border-[var(--border-tint)]/60"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            <Icon
              name={soundEnabled ? 'sound-on' : 'sound-off'}
              variant={soundEnabled ? 'tonal' : 'line'}
              size={16}
            />
          </button>

          <button
            onClick={handleToggleTheme}
            className="w-8 h-8 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--on-container)] transition-colors cursor-pointer border border-[var(--border-tint)]/60"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>
        </div>

        {/* Authenticated User Pill vs Guest Sign-In Button */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowUserMenu(!showUserMenu);
              }}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-[var(--surface-container)]/80 hover:bg-[var(--surface-container-high)] border border-[var(--border-tint)]/80 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              <TribeAvatar tribeId={user.biblicalTribeId || 'judah'} size="xs" />
              <span className="hidden sm:inline truncate max-w-[110px] text-[var(--on-container)] font-bold text-xs">
                {user.displayName || user.username}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] shadow-xl p-2 z-50 flex flex-col gap-1 animate-scaleUp">
                <div className="px-3 py-2 border-b border-[var(--border-tint)] flex items-center gap-2.5">
                  <TribeAvatar tribeId={user.biblicalTribeId || 'judah'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[var(--on-container)] truncate">
                      {user.displayName}
                    </div>
                    <div className="text-[10px] text-[var(--primary-action)] font-black uppercase truncate">
                      Tribe of {TRIBES_BY_ID[user.biblicalTribeId || 'judah']?.name || 'Judah'}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                      {user.stats?.totalScore || 0} pts • {user.stats?.victories || 0} wins
                    </div>
                  </div>
                </div>

                {onTabChange && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onTabChange('tribe');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-[var(--surface-container)] text-[var(--on-container)] flex items-center gap-2 cursor-pointer"
                  >
                    <Icon name="team" size={14} />
                    <span>My Fellowships</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <Icon name="close" size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              setShowAuthModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary-action)] text-white hover:opacity-90 transition-opacity text-xs font-bold cursor-pointer shadow-sm"
          >
            <Icon name="person" size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};
