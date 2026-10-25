import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Icon } from '../design/icons';
import { useAuth } from '../engine/auth/AuthContext';
import { useTribes } from '../engine/tribes/TribeContext';
import { useSession } from '../engine/session/SessionContext';
import { useTheme } from '../theme/ThemeContext';
import { TRIBES, TRIBES_BY_ID } from '../design/tribes/tribes';
import { AuthModal } from '../components/auth/AuthModal';
import { InvitePolicy } from '../engine/tribes/types';

export interface TribeScreenProps {
  onJoinSession: (roomCode: string, mode?: 'online' | 'onsite') => void;
}

export const TribeScreen: React.FC<TribeScreenProps> = ({ onJoinSession }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    tribes,
    activeTribe,
    selectTribe,
    createTribe,
    joinTribeByInviteCode,
    addMemberByUsername,
    approveRequest,
    rejectRequest,
    removeMember,
    updateTribeSettings,
    liveActiveSession,
  } = useTribes();
  const { triggerHaptic } = useTheme();

  // Modals & form state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinByCodeModal, setShowJoinByCodeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'leaderboard' | 'settings'>('overview');

  // Form states
  const [newTribeName, setNewTribeName] = useState('');
  const [newTribeTagline, setNewTribeTagline] = useState('');
  const [newBiblicalTribe, setNewBiblicalTribe] = useState('judah');
  const [newInvitePolicy, setNewInvitePolicy] = useState<InvitePolicy>('open');
  const [isSubmittingTribe, setIsSubmittingTribe] = useState(false);

  // Add member by username state
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [addMemberMsg, setAddMemberMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Join by code state
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinMsg, setJoinMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [isJoiningCode, setIsJoiningCode] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);

  const isAdmin = !!(user && activeTribe?.adminUids?.includes(user.uid));

  // If user is not authenticated, show welcoming prompt
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 pt-4 sm:pt-8 flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-3xl bg-[var(--surface-container-high)] text-[var(--primary-action)] flex items-center justify-center text-3xl shadow-expressive">
            🤝
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--on-container)]">
            Fellowship Tribes
          </h1>
          <p className="text-sm sm:text-base text-[var(--on-container-variant)] max-w-md">
            Create or join a dedicated fellowship for your church, small group, or youth fellowship to play zero-friction games together.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="elevated" padding="md" className="flex flex-col gap-2">
            <span className="text-2xl">⚡</span>
            <h3 className="font-extrabold text-sm text-[var(--on-container)]">Zero-Friction Start</h3>
            <p className="text-xs text-[var(--on-container-variant)]">
              When an admin or host starts a round, members see a 1-click Join button — no typing room codes or scanning required.
            </p>
          </Card>

          <Card variant="elevated" padding="md" className="flex flex-col gap-2">
            <span className="text-2xl">📶</span>
            <h3 className="font-extrabold text-sm text-[var(--on-container)]">Online & Onsite</h3>
            <p className="text-xs text-[var(--on-container-variant)]">
              Works both online over cloud and offline via the host’s local hotspot or church Wi-Fi.
            </p>
          </Card>

          <Card variant="elevated" padding="md" className="flex flex-col gap-2">
            <span className="text-2xl">🏆</span>
            <h3 className="font-extrabold text-sm text-[var(--on-container)]">Tribe Leaderboards</h3>
            <p className="text-xs text-[var(--on-container-variant)]">
              Keep lifetime scores, victories, and stats across your small group over time.
            </p>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-3 pt-4">
          <Button
            variant="primary"
            size="hero"
            pill
            onClick={() => {
              triggerHaptic('medium');
              setShowAuthModal(true);
            }}
            className="w-full max-w-sm font-black shadow-expressive flex items-center justify-center gap-2"
          >
            <Icon name="person" size={20} />
            <span>Sign In / Create Account</span>
          </Button>
          <span className="text-xs text-[var(--on-container-variant)]">
            It takes less than 30 seconds to join.
          </span>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  // Handle creating a new Tribe
  const handleCreateTribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTribeName.trim()) return;
    setIsSubmittingTribe(true);
    triggerHaptic('medium');
    try {
      await createTribe(newTribeName, newTribeTagline, newBiblicalTribe, newInvitePolicy);
      setShowCreateModal(false);
      setNewTribeName('');
      setNewTribeTagline('');
    } finally {
      setIsSubmittingTribe(false);
    }
  };

  // Handle adding member by username
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTribe || !usernameToAdd.trim()) return;
    setIsAddingMember(true);
    setAddMemberMsg(null);
    triggerHaptic('light');

    try {
      const res = await addMemberByUsername(activeTribe.id, usernameToAdd);
      if (res.success) {
        setAddMemberMsg({ type: 'ok', text: `Disciple @${usernameToAdd.replace(/^@/, '')} added successfully!` });
        setUsernameToAdd('');
        triggerHaptic('heavy');
      } else {
        setAddMemberMsg({ type: 'err', text: res.error || 'Could not find or add disciple.' });
      }
    } finally {
      setIsAddingMember(false);
    }
  };

  // Handle joining by invite code
  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setIsJoiningCode(true);
    setJoinMsg(null);
    triggerHaptic('light');

    try {
      const res = await joinTribeByInviteCode(inviteCodeInput);
      if (res.success) {
        if (res.status === 'joined') {
          setJoinMsg({ type: 'ok', text: `Joined ${res.tribe?.name || 'Tribe'} successfully!` });
        } else {
          setJoinMsg({ type: 'ok', text: 'Join request submitted! The Tribe admin will review your request.' });
        }
        setInviteCodeInput('');
        triggerHaptic('heavy');
        setTimeout(() => setShowJoinByCodeModal(false), 1200);
      } else {
        setJoinMsg({ type: 'err', text: res.error || 'Failed to join Tribe.' });
      }
    } finally {
      setIsJoiningCode(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!activeTribe) return;
    triggerHaptic('light');
    const url = `${window.location.origin}?tribeInvite=${activeTribe.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const biblicalEmblem = activeTribe ? TRIBES_BY_ID[activeTribe.biblicalTribeId] : null;
  const membersList = activeTribe?.members ? Object.values(activeTribe.members) : [];
  const pendingList = activeTribe?.pendingRequests ? Object.values(activeTribe.pendingRequests) : [];

  // Sort members by totalScore descending for leaderboard
  const sortedMembers = [...membersList].sort(
    (a, b) => (b.stats?.totalScore || 0) - (a.stats?.totalScore || 0)
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 pt-4 sm:pt-6 flex flex-col gap-6">
      {/* Top Header & Tribe Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary-action)]">
            Fellowship Tribe
          </span>
          <div className="flex items-center gap-2.5">
            {biblicalEmblem && (
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{ backgroundColor: biblicalEmblem.container, color: biblicalEmblem.ink }}
                title={`Biblical Tribe: ${biblicalEmblem.name} (${biblicalEmblem.source})`}
              >
                {biblicalEmblem.name[0]}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--on-container)]">
              {activeTribe ? activeTribe.name : 'Your Tribes'}
            </h1>
          </div>
          {activeTribe?.tagline && (
            <p className="text-xs text-[var(--on-container-variant)] font-medium mt-0.5">
              "{activeTribe.tagline}"
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {tribes.length > 1 && (
            <select
              value={activeTribe?.id || ''}
              onChange={(e) => selectTribe(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs font-bold text-[var(--on-container)] cursor-pointer"
            >
              {tribes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="tonal"
            size="sm"
            pill
            leftIcon={<Icon name="link" size={14} />}
            onClick={() => setShowJoinByCodeModal(true)}
            className="text-xs font-bold"
          >
            Enter Invite Code
          </Button>

          <Button
            variant="primary"
            size="sm"
            pill
            leftIcon={<Icon name="plus" size={14} />}
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-bold"
          >
            Create Tribe
          </Button>
        </div>
      </div>

      {/* 🟢 LIVE ACTIVE GAME SESSION CALLOUT BANNER (Zero-Friction Join) */}
      {liveActiveSession && (
        <Card
          variant="elevated"
          padding="lg"
          className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent relative overflow-hidden shadow-lg animate-pulse"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md">
                🎮
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Live Fellowship Session in Progress
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                    {liveActiveSession.session.connectionMode === 'onsite' ? '📶 Onsite Hotspot' : '🌐 Online Cloud'}
                  </span>
                </div>
                <h3 className="text-lg font-black text-[var(--on-container)]">
                  {liveActiveSession.session.gameName}
                </h3>
                <p className="text-xs text-[var(--on-container-variant)]">
                  Hosted by <strong className="text-[var(--on-container)]">{liveActiveSession.session.hostName}</strong> for {liveActiveSession.tribe.name}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              pill
              leftIcon={<Icon name="play" size={18} />}
              onClick={() => {
                triggerHaptic('heavy');
                onJoinSession(liveActiveSession.session.roomCode, liveActiveSession.session.connectionMode);
              }}
              className="w-full sm:w-auto font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-expressive flex items-center justify-center gap-2"
            >
              Join Fellowship Game Now
            </Button>
          </div>
        </Card>
      )}

      {/* Tribe Sub-Tabs */}
      {activeTribe ? (
        <>
          <div className="flex border-b border-[var(--border-tint)] gap-2 overflow-x-auto select-none">
            {(['overview', 'members', 'leaderboard', 'settings'] as const).map((tId) => (
              <button
                key={tId}
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveTab(tId);
                }}
                className={`py-2 px-3 text-xs font-bold capitalize transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  activeTab === tId
                    ? 'border-[var(--primary-action)] text-[var(--primary-action)] font-black'
                    : 'border-transparent text-[var(--on-container-variant)] hover:text-[var(--on-container)]'
                }`}
              >
                {tId === 'overview' && 'Overview'}
                {tId === 'members' && `Members (${membersList.length})`}
                {tId === 'leaderboard' && 'Standings'}
                {tId === 'settings' && 'Tribe Settings'}
              </button>
            ))}
          </div>

          {/* Tab 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-5">
              {/* Quick Invite Link Card */}
              <Card variant="tonal" padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[var(--on-container)]">
                    Share Fellowship Invite Link
                  </span>
                  <span className="text-[11px] text-[var(--on-container-variant)]">
                    Code: <strong className="font-mono text-[var(--primary-action)]">{activeTribe.inviteCode}</strong> • Policy: {activeTribe.invitePolicy === 'open' ? 'Open to all' : 'Approval required'}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="tonal"
                    size="sm"
                    pill
                    leftIcon={<Icon name={copiedLink ? 'check' : 'copy'} size={14} />}
                    onClick={handleCopyInviteLink}
                    className="font-bold flex-1 sm:flex-initial"
                  >
                    {copiedLink ? 'Link Copied!' : 'Copy Invite Link'}
                  </Button>
                </div>
              </Card>

              {/* Add Member by Username (For Admins & Members) */}
              <Card variant="elevated" padding="md" className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--on-container-variant)] flex items-center gap-1.5">
                    <Icon name="person" size={14} /> Add Disciple by @Username
                  </h3>
                  <span className="text-[10px] text-[var(--on-container-variant)]">
                    They must have a Faith Tribe account
                  </span>
                </div>

                <form onSubmit={handleAddMember} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-[var(--on-container-variant)] text-xs">
                      @
                    </span>
                    <input
                      type="text"
                      value={usernameToAdd}
                      onChange={(e) => setUsernameToAdd(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="e.g. pastordavid"
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-xs font-mono font-bold text-[var(--on-container)] focus:outline-none focus:border-[var(--primary-action)]"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    pill
                    disabled={isAddingMember || !usernameToAdd.trim()}
                    className="font-bold text-xs"
                  >
                    {isAddingMember ? 'Adding…' : 'Add to Tribe'}
                  </Button>
                </form>

                {addMemberMsg && (
                  <p
                    className={`text-xs font-bold p-2 rounded-xl ${
                      addMemberMsg.type === 'ok'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {addMemberMsg.text}
                  </p>
                )}
              </Card>

              {/* Pending Requests Queue (For Admins) */}
              {isAdmin && pendingList.length > 0 && (
                <Card variant="elevated" padding="md" className="flex flex-col gap-3 border-2 border-amber-400/50 bg-amber-50/30 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      ⏳ Pending Membership Requests ({pendingList.length})
                    </span>
                    <span className="text-[10px] text-[var(--on-container-variant)]">
                      Vetting required by admin
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {pendingList.map((req) => (
                      <div
                        key={req.uid}
                        className="p-3 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar name={req.displayName} size="sm" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[var(--on-container)]">
                              {req.displayName}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--on-container-variant)]">
                              @{req.username}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            pill
                            onClick={() => approveRequest(activeTribe.id, req.uid)}
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="tonal"
                            size="sm"
                            pill
                            onClick={() => rejectRequest(activeTribe.id, req.uid)}
                            className="text-xs font-bold text-red-600 dark:text-red-400"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recent Members Preview */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
                  Fellowship Members ({membersList.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {membersList.slice(0, 6).map((m) => (
                    <div
                      key={m.uid}
                      className="p-3 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.displayName} size="sm" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[var(--on-container)] truncate max-w-[120px]">
                              {m.displayName}
                            </span>
                            {m.role === 'admin' && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                Admin
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-[var(--on-container-variant)]">
                            @{m.username}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--on-container-variant)]">
                        {m.stats?.totalScore || 0} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: MEMBERS */}
          {activeTab === 'members' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--on-container-variant)]">
                  All Disciples in {activeTribe.name}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {membersList.map((m) => (
                  <div
                    key={m.uid}
                    className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={m.displayName} size="md" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[var(--on-container)]">
                            {m.displayName}
                          </span>
                          {m.role === 'admin' && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-[var(--on-container-variant)]">
                          @{m.username} • Joined {new Date(m.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-mono font-black text-[var(--primary-action)]">
                          {m.stats?.totalScore || 0} pts
                        </span>
                        <span className="text-[10px] text-[var(--on-container-variant)]">
                          {m.stats?.victories || 0} wins • {m.stats?.gamesPlayed || 0} games
                        </span>
                      </div>

                      {isAdmin && m.uid !== user?.uid && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove @${m.username} from this Tribe?`)) {
                              removeMember(activeTribe.id, m.uid);
                            }
                          }}
                          className="w-7 h-7 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove member"
                        >
                          <Icon name="close" size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: LEADERBOARD / STANDINGS */}
          {activeTab === 'leaderboard' && (
            <Card variant="tonal" padding="lg" className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--on-container-variant)]">
                Fellowship Rankings ({sortedMembers.length} Disciples)
              </h3>

              <div className="flex flex-col gap-2">
                {sortedMembers.map((m, idx) => (
                  <div
                    key={m.uid}
                    className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-tint)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black w-6 text-center text-[var(--on-container-variant)]">
                        #{idx + 1}
                      </span>
                      <Avatar name={m.displayName} size="sm" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--on-container)]">
                          {m.displayName}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--on-container-variant)]">
                          @{m.username}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-sm font-black tabular-nums text-[var(--on-container)]">
                          {m.stats?.totalScore || 0} pts
                        </span>
                        <span className="text-[10px] text-[var(--on-container-variant)]">
                          {m.stats?.victories || 0} 👑 • {m.stats?.gamesPlayed || 0} played
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tab 4: SETTINGS (For Admin) */}
          {activeTab === 'settings' && (
            <Card variant="elevated" padding="lg" className="flex flex-col gap-4">
              <h3 className="text-sm font-black text-[var(--on-container)]">
                Tribe Administration & Policies
              </h3>

              {isAdmin ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--on-container-variant)] block mb-1">
                      Invite & Join Policy
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateTribeSettings(activeTribe.id, { invitePolicy: 'open' })}
                        className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          activeTribe.invitePolicy === 'open'
                            ? 'border-[var(--primary-action)] bg-[var(--surface-container-high)] font-bold'
                            : 'border-[var(--border-tint)] bg-[var(--surface-container)] opacity-70'
                        }`}
                      >
                        <span className="text-xs font-black">🔓 Open to All</span>
                        <span className="text-[11px] text-[var(--on-container-variant)]">
                          Anyone with your invite code/link joins directly into the group.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateTribeSettings(activeTribe.id, { invitePolicy: 'approval_required' })}
                        className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          activeTribe.invitePolicy === 'approval_required'
                            ? 'border-[var(--primary-action)] bg-[var(--surface-container-high)] font-bold'
                            : 'border-[var(--border-tint)] bg-[var(--surface-container)] opacity-70'
                        }`}
                      >
                        <span className="text-xs font-black">🛡️ Vetting Required</span>
                        <span className="text-[11px] text-[var(--on-container-variant)]">
                          People who use the link are placed in a queue for admin review and approval.
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--on-container-variant)]">
                  Only the Tribe administrator can modify group settings.
                </p>
              )}
            </Card>
          )}
        </>
      ) : (
        <Card variant="tonal" padding="lg" className="text-center flex flex-col items-center gap-3 py-10">
          <span className="text-3xl">🕊️</span>
          <h3 className="text-lg font-black text-[var(--on-container)]">
            You don't belong to any Tribe yet
          </h3>
          <p className="text-xs text-[var(--on-container-variant)] max-w-sm">
            Create a fellowship group for your small group or church, or enter an invite code from a host.
          </p>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              pill
              onClick={() => setShowCreateModal(true)}
              className="font-bold text-xs"
            >
              Create Tribe
            </Button>
            <Button
              variant="tonal"
              size="md"
              pill
              onClick={() => setShowJoinByCodeModal(true)}
              className="font-bold text-xs"
            >
              Enter Code
            </Button>
          </div>
        </Card>
      )}

      {/* CREATE TRIBE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card
            variant="elevated"
            padding="lg"
            className="w-full max-w-md bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[var(--on-container)]">
                Create a Fellowship Tribe
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface-container)] flex items-center justify-center cursor-pointer"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTribe} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--on-container-variant)] mb-1 block">
                  Fellowship Name
                </label>
                <input
                  type="text"
                  value={newTribeName}
                  onChange={(e) => setNewTribeName(e.target.value)}
                  placeholder="e.g. Grace Fellowship Youth"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-sm font-bold text-[var(--on-container)] focus:outline-none focus:border-[var(--primary-action)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--on-container-variant)] mb-1 block">
                  Tagline / Scripture Focus (Optional)
                </label>
                <input
                  type="text"
                  value={newTribeTagline}
                  onChange={(e) => setNewTribeTagline(e.target.value)}
                  placeholder="e.g. Walking in Light • 1 John 1:7"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-sm font-medium text-[var(--on-container)] focus:outline-none focus:border-[var(--primary-action)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--on-container-variant)] mb-1 block">
                  Biblical Emblem
                </label>
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)]">
                  {TRIBES.map((trb) => (
                    <button
                      key={trb.id}
                      type="button"
                      onClick={() => setNewBiblicalTribe(trb.id)}
                      className={`p-1.5 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer border ${
                        newBiblicalTribe === trb.id
                          ? 'border-[var(--primary-action)] bg-[var(--surface-card)]'
                          : 'border-transparent opacity-75'
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

              <div>
                <label className="text-xs font-bold text-[var(--on-container-variant)] mb-1 block">
                  Invite Policy
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewInvitePolicy('open')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      newInvitePolicy === 'open'
                        ? 'border-[var(--primary-action)] bg-[var(--surface-container-high)] text-[var(--primary-action)]'
                        : 'border-[var(--border-tint)] text-[var(--on-container-variant)]'
                    }`}
                  >
                    Open to All
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewInvitePolicy('approval_required')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      newInvitePolicy === 'approval_required'
                        ? 'border-[var(--primary-action)] bg-[var(--surface-container-high)] text-[var(--primary-action)]'
                        : 'border-[var(--border-tint)] text-[var(--on-container-variant)]'
                    }`}
                  >
                    Approval Required
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                pill
                disabled={isSubmittingTribe || !newTribeName.trim()}
                className="w-full mt-2 font-black shadow-md flex items-center justify-center gap-2"
              >
                {isSubmittingTribe ? 'Creating…' : 'Establish Fellowship Tribe'}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* JOIN BY INVITE CODE MODAL */}
      {showJoinByCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card
            variant="elevated"
            padding="lg"
            className="w-full max-w-sm bg-[var(--surface-card)] border-2 border-[var(--border-tint)] shadow-2xl rounded-3xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[var(--on-container)]">
                Join a Tribe
              </h2>
              <button
                type="button"
                onClick={() => setShowJoinByCodeModal(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface-container)] flex items-center justify-center cursor-pointer"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleJoinByCode} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--on-container-variant)] mb-1 block">
                  Tribe Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. TRB-BEREAN-4819"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--surface-container)] border border-[var(--border-tint)] text-sm font-mono font-black text-[var(--on-container)] focus:outline-none focus:border-[var(--primary-action)] text-center tracking-widest uppercase"
                />
              </div>

              {joinMsg && (
                <p
                  className={`text-xs font-bold p-2.5 rounded-xl ${
                    joinMsg.type === 'ok'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                  }`}
                >
                  {joinMsg.text}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                pill
                disabled={isJoiningCode || !inviteCodeInput.trim()}
                className="w-full font-black shadow-md flex items-center justify-center gap-2"
              >
                {isJoiningCode ? 'Verifying…' : 'Join Tribe'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
