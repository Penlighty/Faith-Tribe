import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Icon, type IconName } from '../../design/icons';
import markOnDark from '../../assets/brand/mark-on-dark.svg';
import markOnLight from '../../assets/brand/mark-on-light.svg';
import { TYPOGRAPHY } from '../../theme/tokens';
import { NavTabId } from './BottomNav';
import { useTheme } from '../../theme/ThemeContext';
import { useSession } from '../../engine/session/SessionContext';
import { useAuth } from '../../engine/auth/AuthContext';
import { Avatar } from './Avatar';
import { AuthModal } from '../auth/AuthModal';

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
  { id: 'play', label: 'Join Room', icon: 'play' },
  { id: 'games', label: 'Game Library', icon: 'games' },
  { id: 'tribe', label: 'Tribe Fellowship', icon: 'team' },
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
  const { mode, setMode, isDark, soundEnabled, setSoundEnabled, triggerHaptic } = useTheme();
  const { currentUser } = useSession();
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
    <header className={`w-full flex items-center justify-between py-3.5 px-4 sm:px-6 lg:px-8 select-none border-b border-[var(--border-tint)]/40 bg-[var(--bg-tint)]/80 backdrop-blur-md sticky top-0 z-30 transition-all ${className}`}>
      {/* Brand & Left action */}
      <div className="flex items-center gap-3 min-w-0">
        {leftAction && <div className="shrink-0">{leftAction}</div>}
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={isDark ? markOnDark : markOnLight}
            alt="Faith Tribe Logo"
            className="w-8 h-8 rounded-xl object-contain shadow-sm shrink-0"
          />
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
                <Icon name={item.icon} variant={isActive ? 'tonal' : 'line'} size={16} />
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
            className="w-9 h-9 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--on-container)] transition-colors cursor-pointer border border-[var(--border-tint)]/60"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            <Icon
              name={soundEnabled ? 'sound-on' : 'sound-off'}
              variant={soundEnabled ? 'tonal' : 'line'}
              size={18}
            />
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

        {/* Authenticated User Pill vs Guest Sign-In Button */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowUserMenu(!showUserMenu);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] border border-[var(--border-tint)] text-xs font-semibold cursor-pointer transition-colors"
            >
              <Avatar name={user.displayName} size="sm" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="truncate max-w-[100px] text-[var(--on-container)] font-bold text-xs leading-none">
                  {user.displayName}
                </span>
                <span className="text-[10px] font-mono text-[var(--on-container-variant)] leading-none mt-0.5">
                  @{user.username}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] shadow-xl p-2 z-50 flex flex-col gap-1 animate-scaleUp">
                <div className="px-3 py-2 border-b border-[var(--border-tint)]">
                  <div className="text-xs font-bold text-[var(--on-container)] truncate">
                    {user.displayName}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--on-container-variant)]">
                    @{user.username}
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold mt-1">
                    {user.stats?.totalScore || 0} pts • {user.stats?.victories || 0} wins
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
