import type { IconName } from './icons';

/**
 * Mapping from legacy icon names (Lucide, Material, etc.) to Faith Tribe custom IconNames.
 * Adheres strictly to the mapping table defined in faith-tribe-icons/INTEGRATION_PROMPT.md.
 */
export const LEGACY_ICON_MAP: Record<string, IconName> = {
  // Required in INTEGRATION_PROMPT.md:
  Home: 'home',
  Play: 'play',
  Gamepad2: 'games',
  LayoutGrid: 'games',
  User: 'profile',
  Settings: 'settings',
  SlidersHorizontal: 'settings',
  ChevronLeft: 'back',
  ChevronRight: 'forward',
  ChevronUp: 'up',
  ChevronDown: 'down',
  ArrowRight: 'arrow-right',
  ArrowLeft: 'arrow-left',
  X: 'close',
  Menu: 'menu',
  MoreHorizontal: 'more',
  Check: 'check',
  Plus: 'plus',
  Minus: 'minus',
  Search: 'search',
  Filter: 'filter',
  Share2: 'share',
  Copy: 'copy',
  Link: 'link',
  QrCode: 'qr',
  Pencil: 'edit',
  Trash2: 'trash',
  RefreshCw: 'refresh',
  Info: 'info',
  HelpCircle: 'help',
  Bell: 'bell',
  Volume2: 'sound-on',
  VolumeX: 'sound-off',
  Vibrate: 'vibrate',
  Eye: 'eye',
  Lock: 'lock',
  Unlock: 'unlock',
  Flag: 'flag',
  Timer: 'timer',
  Clock: 'timer',
  Lightbulb: 'hint',
  BookOpen: 'book-open',
  BarChart3: 'scoreboard',
  Trophy: 'trophy',
  Crown: 'crown',
  Medal: 'medal',
  Star: 'star',
  Flame: 'flame',
  Heart: 'heart',
  Zap: 'bolt',
  Gem: 'gem',
  gem: 'gem',
  Diamond: 'gem',
  diamond: 'gem',
  Gems: 'gem',
  Shield: 'shield',
  SkipForward: 'skip',
  Pause: 'pause',
  Shuffle: 'shuffle',
  Target: 'target',
  Megaphone: 'host',
  LogIn: 'join',
  Users: 'team',
  UserPlus: 'person-add',
  Hash: 'code',
  MapPin: 'place',
  Box: 'thing',

  // Direct equivalents from existing codebase:
  CheckCircle2: 'check',
  XCircle: 'close',
  RotateCcw: 'refresh',
  Sliders: 'settings',
  Volume1: 'sound-on',
  Wheat: 'wheat',
  Award: 'medal',
  ShieldAlert: 'shield',
};

/**
 * Returns the mapped IconName for a given legacy icon identifier, or undefined if no equivalent exists.
 */
export function getLegacyIconName(legacyName: string): IconName | undefined {
  return LEGACY_ICON_MAP[legacyName];
}

export const getLegacyMappedIcon = getLegacyIconName;
