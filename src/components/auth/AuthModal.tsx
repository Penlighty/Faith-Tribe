import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../../design/icons';
import { useAuth } from '../../engine/auth/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { TRIBES, TRIBES_BY_ID } from '../../design/tribes/tribes';
import { TribeAvatar } from '../tribes/TribeAvatar';
import { TribalAssessmentModal } from '../tribes/TribalAssessmentModal';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredForHost?: boolean;
  onSuccess?: () => void;
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={`${className} shrink-0`} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
    />
  </svg>
);

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
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

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
        setError(res.error || 'Google sign-in was cancelled or failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-fadeIn p-4 sm:p-6 flex justify-center items-start sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerHaptic('light');
          onClose();
        }
      }}
    >
      <div className="my-auto w-full max-w-md py-4 sm:py-6">
        <Card
          variant="elevated"
          padding="none"
          className="w-full bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-[28px] sm:rounded-[32px] flex flex-col relative overflow-hidden animate-scaleUp max-h-[88vh]"
        >
          {/* Fixed Pinned Header (Never cut off or lost during scroll) */}
          <div className="p-5 sm:p-6 pb-3 border-b border-[var(--border-tint)] flex flex-col gap-2 relative bg-[var(--surface-card)] shrink-0">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[var(--surface-container)] hover:bg-[var(--surface-container-high)] text-[var(--on-container-variant)] flex items-center justify-center transition-colors cursor-pointer border border-[var(--border-tint)]/60"
              aria-label="Close"
            >
              <Icon name="close" size={18} />
            </button>

            {/* Header Content */}
            <div className="flex flex-col gap-1 pr-10">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary-action)]">
                <Icon name="cross" size={14} />
                <span>Faith Tribe Account</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--on-container)]">
                {tab === 'signin' ? 'Sign In to Faith Tribe' : 'Join the Fellowship'}
              </h2>
            </div>

            {/* Tab Switcher */}
            <div className="flex rounded-2xl bg-[var(--surface-container)] p-1 border border-[var(--border-tint)] mt-1">
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
          </div>

          {/* Scrollable Form Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4">
            {requiredForHost ? (
              <div className="text-xs text-amber-800 dark:text-amber-200 font-semibold bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-300/40 flex items-start gap-2.5">
                <div className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">
                  <Icon name="shield" size={16} />
                </div>
                <span>
                  <strong>Host Authentication Required:</strong> You must sign in to initiate and manage game rooms for your fellowship.
                </span>
              </div>
            ) : (
              <p className="text-xs text-[var(--on-container-variant)] font-medium">
                Sign in to keep your scores, rank on leaderboards, and belong to your Tribe fellowship.
              </p>
            )}

            {/* Error Alert Box */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-400/40 text-xs text-red-700 dark:text-red-300 font-medium flex items-start gap-2.5 leading-relaxed">
                <Icon name="close" size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign In Button (Top priority quick auth) */}
            <Button
              type="button"
              variant="tonal"
              size="lg"
              pill
              disabled={submitting || isLoading}
              onClick={handleGoogleSignIn}
              leftIcon={<GoogleIcon />}
              className="w-full font-bold flex items-center justify-center gap-2.5 text-xs shadow-xs"
            >
              <span>Continue with Google</span>
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-[var(--border-tint)]" />
              <span className="text-[10px] uppercase font-bold text-[var(--on-container-variant)] tracking-wider">
                Or with email
              </span>
              <div className="flex-1 h-[1px] bg-[var(--border-tint)]" />
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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

                  {/* Ancestral Tribe Calling & Assessment Card */}
                  <div className="p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase tracking-wider text-[var(--on-container-variant)] flex items-center gap-1">
                        <Icon name="tribe" size={13} className="text-[var(--primary-action)]" />
                        <span>Ancestral Tribe Calling</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAssessmentModal(true)}
                        className="text-[11px] font-black text-[var(--primary-action)] underline hover:opacity-80 cursor-pointer"
                      >
                        Discover Calling (7 Traits)
                      </button>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-tint)]">
                      <TribeAvatar tribeId={selectedTribeId} size="sm" showGlow />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-black text-[var(--on-container)] truncate">
                          Tribe of {TRIBES_BY_ID[selectedTribeId]?.name || 'Judah'}
                        </span>
                        <span className="text-[10px] text-[var(--on-container-variant)] truncate">
                          {TRIBES_BY_ID[selectedTribeId]?.title} &bull; {TRIBES_BY_ID[selectedTribeId]?.source}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAssessmentModal(true)}
                        className="px-2.5 py-1 rounded-full bg-[var(--surface-container)] text-[10px] font-bold text-[var(--primary-action)] border border-[var(--border-tint)] hover:bg-[var(--surface-container-high)] cursor-pointer"
                      >
                        Assess
                      </button>
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
                className="w-full mt-1 font-black shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Tribe Account'}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );

  return createPortal(
    <>
      {modalContent}
      <TribalAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        onAssigned={(tribeId) => {
          setSelectedTribeId(tribeId);
          setShowAssessmentModal(false);
        }}
      />
    </>,
    document.body
  );
};
