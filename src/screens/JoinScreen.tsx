import React, { useState, useEffect } from 'react';
import { Icon } from '@design/icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useSession } from '../engine/session/SessionContext';
import { useTheme } from '../theme/ThemeContext';

export interface JoinScreenProps {
  onBack: () => void;
  onJoined: () => void;
  prefilledCode?: string;
}

export const JoinScreen: React.FC<JoinScreenProps> = ({
  onBack,
  onJoined,
  prefilledCode = '',
}) => {
  const { joinSession, currentUser } = useSession();
  const { triggerHaptic } = useTheme();

  const [code, setCode] = useState(prefilledCode);
  const [name, setName] = useState(currentUser?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('join');
      if (urlCode) setCode(urlCode.toUpperCase());
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    setError('');
    setLoading(true);
    triggerHaptic('medium');

    try {
      const success = await joinSession(code.trim().toUpperCase(), name.trim());
      if (success) {
        onJoined();
      } else {
        setError('Could not join room. Please check the code.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error connecting to session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 pb-28 pt-2 sm:pt-6 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] flex items-center justify-center text-[var(--on-container)] transition-colors cursor-pointer"
          aria-label="Back"
        >
          <Icon name="arrow-left" size={20} />
        </button>
        <h2 className="text-xl font-bold">Join Session</h2>
      </div>

      <Card variant="hero" padding="lg" className="flex flex-col items-center gap-3 text-center">
        <Avatar name={name || 'Disciple'} size="xl" />
        <h1 className="text-2xl font-black">Enter the Room</h1>
        <p className="text-xs font-semibold opacity-75">
          Type the 4-letter room code shown on the host&apos;s screen.
        </p>
      </Card>

      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        {/* 4-Letter Code Input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="room-code-input" className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] px-1">
            4-Letter Room Code
          </label>
          <input
            id="room-code-input"
            type="text"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. ZION"
            className="w-full h-16 rounded-3xl bg-[var(--surface-card)] text-[var(--on-container)] border-2 border-[var(--border-tint)] focus:border-[var(--primary-action)] text-center font-mono text-3xl font-black tracking-widest uppercase outline-none shadow-sm"
            required
          />
        </div>

        {/* Display Name Input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="display-name-input" className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)] px-1">
            Your Display Name
          </label>
          <input
            id="display-name-input"
            type="text"
            maxLength={18}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priscilla"
            className="w-full h-14 rounded-2xl bg-[var(--surface-card)] text-[var(--on-container)] border-2 border-[var(--border-tint)] focus:border-[var(--primary-action)] px-4 font-bold text-base outline-none shadow-sm"
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="hero"
          pill
          disabled={code.length < 4 || !name.trim() || loading}
          leftIcon={<Icon name="join" size={20} />}
          className="w-full mt-2"
        >
          {loading ? 'Entering Room...' : 'Join Game Night'}
        </Button>
      </form>
    </div>
  );
};
