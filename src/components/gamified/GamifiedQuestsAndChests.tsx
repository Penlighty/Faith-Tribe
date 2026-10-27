import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { GamifiedChest, GamifiedGem, GamifiedXpBolt, ChestRarity } from './GamifiedMascot';
import { GamifiedButton } from './GamifiedButton';
import { fireConfettiBurst } from '../ui/StreakCelebration';
import { useTheme } from '../../theme/ThemeContext';

export interface QuestItem {
  id: string;
  title: string;
  current: number;
  total: number;
  rewardType: 'chest' | 'gems' | 'xp';
  rewardAmount?: number;
}

export const GamifiedQuestCard: React.FC<{
  quest: QuestItem;
  onClaim?: () => void;
  className?: string;
}> = ({ quest, onClaim, className = '' }) => {
  const percent = Math.min(100, Math.round((quest.current / quest.total) * 100));
  const isComplete = quest.current >= quest.total;

  return (
    <div
      className={`p-4 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-[var(--c-border)] shadow-sm flex flex-col gap-2.5 select-none ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--c-text)]">
          {quest.title}
        </span>
        <span className="text-xs font-black uppercase text-[var(--c-orange)] font-mono">
          {quest.current} / {quest.total}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Progress Bar with Chest cap */}
        <div className="progress-gamified flex-1">
          <div
            className="progress-gamified-fill bg-[var(--c-orange)]"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="shrink-0 -my-2 cursor-pointer" onClick={isComplete ? onClaim : undefined}>
          <GamifiedChest
            rarity="common"
            size={36}
            className={isComplete ? 'animate-bounce' : 'opacity-80'}
          />
        </div>
      </div>
    </div>
  );
};

export interface GamifiedChestModalProps {
  isOpen: boolean;
  initialRarity?: ChestRarity;
  onClose: (reward: { gems: number; xp: number }) => void;
}

export const GamifiedChestModal: React.FC<GamifiedChestModalProps> = ({
  isOpen,
  initialRarity = 'common',
  onClose,
}) => {
  const { triggerHaptic } = useTheme();
  const [rarity, setRarity] = useState<ChestRarity>(initialRarity);
  const [upgradesLeft, setUpgradesLeft] = useState(3);
  const [isOpened, setIsOpened] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgradeTap = () => {
    if (upgradesLeft <= 0 || isOpened) return;
    triggerHaptic('medium');
    setUpgradesLeft((prev) => prev - 1);

    // 40% chance to upgrade rarity
    const won = Math.random() < 0.45;
    if (won) {
      fireConfettiBurst('light');
      if (rarity === 'common') {
        setRarity('rare');
        setUpgradeMessage('UPGRADED TO RARE!');
      } else if (rarity === 'rare') {
        setRarity('epic');
        setUpgradeMessage('JACKPOT! EPIC CHEST!');
      }
    } else {
      setUpgradeMessage('No upgrade this tap, try again!');
    }
  };

  const handleOpenChest = () => {
    triggerHaptic('heavy');
    setIsOpened(true);
    fireConfettiBurst('high');
  };

  const gemsWon = rarity === 'epic' ? 60 : rarity === 'rare' ? 30 : 15;
  const xpWon = rarity === 'epic' ? 100 : rarity === 'rare' ? 50 : 25;

  const rarityTextColor =
    rarity === 'epic' ? 'text-[var(--c-purple)]' : rarity === 'rare' ? 'text-[var(--c-yellow)]' : 'text-[var(--c-orange-deep)]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-zinc-900 border-4 border-[var(--c-border)] shadow-2xl flex flex-col items-center gap-4 text-center">
        {/* Rarity Label */}
        <span className={`text-2xl font-black uppercase tracking-wider ${rarityTextColor}`}>
          {rarity} CHEST
        </span>

        {/* Chest Illustration */}
        <div className="my-2 cursor-pointer transition-transform hover:scale-105" onClick={!isOpened ? handleOpenChest : undefined}>
          <GamifiedChest rarity={rarity} size={110} isOpen={isOpened} />
        </div>

        {!isOpened ? (
          <>
            <p className="text-sm font-bold text-[var(--c-text)]">
              Tap for a chance to upgrade!
            </p>

            {upgradeMessage && (
              <span className="text-xs font-black text-[var(--c-green-lip)] animate-bounce">
                {upgradeMessage}
              </span>
            )}

            {/* 3 Circular Upgrade Buttons */}
            <div className="flex items-center gap-3 my-1">
              {[0, 1, 2].map((idx) => {
                const isUsable = idx < upgradesLeft;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={handleUpgradeTap}
                    disabled={!isUsable}
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white transition-all cursor-pointer ${
                      isUsable
                        ? 'bg-[var(--c-purple)] hover:brightness-110 shadow-md active:scale-95'
                        : 'bg-[var(--c-border)] opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp size={22} strokeWidth={3} />
                  </button>
                );
              })}
            </div>

            <GamifiedButton variant="blue" onClick={handleOpenChest} className="mt-2">
              OPEN CHEST
            </GamifiedButton>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 animate-fadeIn">
            <h4 className="text-xl font-black text-[var(--c-blue)]">
              REWARDS UNLOCKED!
            </h4>
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-[var(--c-blue-tint)] border border-[var(--c-blue)]/30">
              <div className="flex items-center gap-1.5">
                <GamifiedGem size={26} />
                <span className="font-black text-lg text-[var(--c-blue)]">+{gemsWon}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GamifiedXpBolt size={26} />
                <span className="font-black text-lg text-[var(--c-yellow)]">+{xpWon} XP</span>
              </div>
            </div>

            <GamifiedButton
              variant="green"
              onClick={() => onClose({ gems: gemsWon, xp: xpWon })}
              className="mt-3"
            >
              CLAIM REWARDS
            </GamifiedButton>
          </div>
        )}
      </div>
    </div>
  );
};
