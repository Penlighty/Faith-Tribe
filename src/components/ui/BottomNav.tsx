import React from 'react';
import { motion } from 'framer-motion';
import { Home, Play, Gamepad2, Settings } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

export type NavTabId = 'home' | 'play' | 'games' | 'settings';

export interface BottomNavProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  visible?: boolean;
}

const TABS: { id: NavTabId; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'play', label: 'Play', icon: Play },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  visible = true,
}) => {
  const { reducedMotion, triggerHaptic } = useTheme();

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none select-none md:hidden">
      <motion.nav
        initial={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="pointer-events-auto bg-[var(--surface-card)]/90 backdrop-blur-xl border border-[var(--border-tint)] rounded-full p-1.5 shadow-expressive-lg flex items-center gap-1 max-w-sm w-full justify-between"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('selection');
                onTabChange(tab.id);
              }}
              className={`relative flex-1 py-2 px-3 rounded-full flex flex-col items-center justify-center gap-0.5 text-xs transition-colors outline-none cursor-pointer ${
                isActive
                  ? 'text-[var(--primary-action)] font-bold'
                  : 'text-[var(--on-container-variant)] font-medium hover:text-[var(--on-container)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-pill"
                  className="absolute inset-0 bg-[var(--surface-container-high)] rounded-full -z-10"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
              <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              <span className="text-[11px] leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};
