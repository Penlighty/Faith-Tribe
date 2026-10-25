import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../../design/icons';
import { useAuth } from '../../engine/auth/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { TRIBES } from '../../design/tribes/tribes';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredForHost?: boolean;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  requiredForHost = false,
  onSuccess,
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, isLoading } = useAuth();
  const { triggerHaptic } = useTheme();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedTribeId, setSelectedTribeId] = useState('judah');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    triggerHaptic('medium');

    try {
      if (tab === 'signin') {
        if (!email.trim() || !password) {
          setError('Please enter both email and password.');
          setSubmitting(false);
          return;
        }
        const res = await signInWithEmail(email, password);
        if (res.success) {
          triggerHaptic('heavy');
          onSuccess?.();
          onClose();
        } else {
          setError(res.error || 'Failed to sign in.');
        }
      } else {
        if (!email.trim() || !password || !username.trim() || !displayName.trim()) {
          setError('Please fill out all fields.');
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setSubmitting(false);
          return;
        }
        const res = await signUpWithEmail(
          email,
          password,
          username,
          displayName,
          selectedTribeId
        );
        if (res.success) {
          triggerHaptic('heavy');
          onSuccess?.();
          onClose();
        } else {
          setError(res.error || 'Failed to create account.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSubmitting(true);
    triggerHaptic('light');
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        triggerHaptic('heavy');
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || 'Google sign-in was cancelled.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-md bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl flex flex-col gap-4 relative overflow-hidden animate-scaleUp max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <Icon name="close" size={16} />
        </button>

        {/* Header Notice */}
        <div className="flex flex-col gap-1 pr-8">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary-action)]">
            <Icon name="cross" size={14} />
            <span>Faith Tribe Account</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--on-container)]">
            {tab === 'signin' ? 'Sign In to Faith Tribe' : 'Join the Fellowship'}
          </h2>
          {requiredForHost ? (
            <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-300/40">
              🛡️ <strong>Host Authentication Required:</strong> You must sign in to initiate and manage game rooms for your fellowship.
            </p>
          ) : (
            <p className="text-xs text-[var(--on-container-variant)]">
              Sign in to keep your scores, rank on leaderboards, and belong to your Tribe fellowship.
            </p>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-[var(--surface-container)] p-1 border border-[var(--border-tint)]">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setTab('signin');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'signin'
                ? 'bg-[var(--surface-card)] text-[var(--primary-action)] shadow-sm'
                : 'text-[var(--on-container-variant)] hover:text-[var(--on-container)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setTab('signup');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'signup'
                ? 'bg-[var(--surface-card)] text-[var(--primary-action)] shadow-sm'
                : 'text-[var(--on-container-variant)] hover:text-[var(--on-container)]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-400/30 text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
            <Icon name="close" size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {tab === 'signup' && (
            <>
              <div>
                <label className="text-xs font-bold text-[var(--on-container-variant)] mb-1 block">
                  Username (@handle)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-[var(--on-container-variant)] text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    placeholder="e.g. pastordavid"
                    required
                    maxLength={20}
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-sm font-mono font-bold text-[var(--on-container)] focus:outline-none focus:border-[var(--primary-action)]"
                  />
                </div>
                <span className="text-[10px] text-[var(--on-container-variant)] mt-0.5 block">
                  Other disciples can add you to their Tribe using @{username || 'username'}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--on-container-variant)] mb-1 block">
                  Display / Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. David Ogunleye"
                  required
                  maxLength={30}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-sm font-bold text-[var(--on-container)] focus:outline-none focus:border-[var(--primary-action)]"
                />
              </div>

              {/* Biblical Tribe Emblem Picker */}
              <div>
                <label className="text-xs font-bold text-[var(--on-container-variant)] mb-1 block">
                  Select Biblical Tribe Emblem
                </label>
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
                  {TRIBES.map((trb) => (
                    <button
                      key={trb.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedTribeId(trb.id);
                      }}
                      className={`p-1.5 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer border ${
                        selectedTribeId === trb.id
                          ? 'border-[var(--primary-action)] bg-[var(--surface-card)] shadow-sm'
                          : 'border-transparent hover:bg-[var(--surface-container-high)] opacity-75'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                        style={{ backgroundColor: trb.container, color: trb.ink }}
                      >
                        {trb.name[0]}
                      </span>
                      <span className="truncate w-full text-center">{trb.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-[var(--on-container-variant)] mb-1 block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="disciple@fellowship.org"
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-sm font-medium text-[var(--on-container)] focus:outline-none focus:border-[var(--primary-action)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--on-container-variant)] mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-sm font-medium text-[var(--on-container)] focus:outline-none focus:border-[var(--primary-action)]"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            pill
            disabled={submitting || isLoading}
            className="w-full mt-2 font-black shadow-md flex items-center justify-center gap-2"
          >
            {submitting ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Tribe Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-[1px] bg-[var(--border-tint)]" />
          <span className="text-[10px] uppercase font-bold text-[var(--on-container-variant)] tracking-wider">
            Or
          </span>
          <div className="flex-1 h-[1px] bg-[var(--border-tint)]" />
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="tonal"
          size="md"
          pill
          disabled={submitting || isLoading}
          onClick={handleGoogleSignIn}
          className="w-full font-bold flex items-center justify-center gap-2 text-xs"
        >
          <span>Continue with Google</span>
        </Button>
      </Card>
    </div>
  );
};
