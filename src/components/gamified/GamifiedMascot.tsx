import React from 'react';

export type MascotPose = 'idle' | 'cheer' | 'thinking' | 'sad';

export type BiblicalCharacterId =
  | 'david'
  | 'miryam'
  | 'moshe'
  | 'deborah'
  | 'esther'
  | 'eliyah'
  | 'ruth'
  | 'adam'
  | 'noah'
  | 'abraham'
  | 'joseph'
  | 'joshua'
  | 'daniel'
  | 'jesus'
  | 'peter'
  | 'paul'
  | 'john'
  | 'solomon';

export interface BiblicalCharacterDef {
  id: BiblicalCharacterId;
  name: string; // Transliterated with special diacritics
  title: string;
  description: string;
  signatureVerse: string;
  verseRef: string;
  themeColor: string;
  lipColor: string;
  tintColor: string;
}

export const BIBLICAL_CHARACTERS: Record<BiblicalCharacterId, BiblicalCharacterDef> = {
  david: {
    id: 'david',
    name: 'Dāvīd',
    title: 'The Shepherd-Psalmist',
    description: 'Brave, musical, and quick to praise the Lord with heartfelt songs and bold courage.',
    signatureVerse: 'The LORD is my shepherd; I shall not want.',
    verseRef: 'Psalm 23:1',
    themeColor: '#1CB0F6',
    lipColor: '#1899D6',
    tintColor: '#DDF3FE',
  },
  miryam: {
    id: 'miryam',
    name: 'Mīryām',
    title: 'The Prophetess of Joy',
    description: 'Lively, uplifting, leading worship with timbrel, rhythm, and exuberant gratitude.',
    signatureVerse: 'Sing to the LORD, for He has triumphed gloriously!',
    verseRef: 'Exodus 15:21',
    themeColor: '#0D9488',
    lipColor: '#0F766E',
    tintColor: '#CCFBF1',
  },
  moshe: {
    id: 'moshe',
    name: 'Mōshē',
    title: 'The Wise Lawgiver',
    description: 'Venerable guide who spoke with God face to face, bearing the sacred staff of truth.',
    signatureVerse: 'The LORD will fight for you; you need only to be still.',
    verseRef: 'Exodus 14:14',
    themeColor: '#6366F1',
    lipColor: '#4F46E5',
    tintColor: '#E0E7FF',
  },
  deborah: {
    id: 'deborah',
    name: 'Debōrāh',
    title: 'The Valiant Judge',
    description: 'Resolute, wise counselor and mother of Israel who inspired victory under the palm tree.',
    signatureVerse: 'Awake, awake, utter a song! Arise and lead your captivity captive.',
    verseRef: 'Judges 5:12',
    themeColor: '#8B5CF6',
    lipColor: '#7C3AED',
    tintColor: '#EDE9FE',
  },
  esther: {
    id: 'esther',
    name: 'Esthēr',
    title: 'Queen of Courage',
    description: 'Regal, gracious, and extraordinarily brave, standing up for her people in times of crisis.',
    signatureVerse: 'And who knows but that you have come to royal position for such a time as this?',
    verseRef: 'Esther 4:14',
    themeColor: '#EC4899',
    lipColor: '#DB2777',
    tintColor: '#FCE7F3',
  },
  eliyah: {
    id: 'eliyah',
    name: 'Eliyāh',
    title: 'The Mountain Prophet',
    description: 'Passionate and uncompromising, carrying the zeal and blazing fire of the Almighty.',
    signatureVerse: 'The God who answers by fire, He is God.',
    verseRef: '1 Kings 18:24',
    themeColor: '#F97316',
    lipColor: '#EA580C',
    tintColor: '#FFEDD5',
  },
  ruth: {
    id: 'ruth',
    name: 'Rūth',
    title: 'The Loyal Companion',
    description: 'Faithful, hardworking reaper of kindness whose devotion blossomed into a royal lineage.',
    signatureVerse: 'Where you go I will go, and where you stay I will stay. Your people will be my people.',
    verseRef: 'Ruth 1:16',
    themeColor: '#EAB308',
    lipColor: '#CA8A04',
    tintColor: '#FEF9C3',
  },
  adam: {
    id: 'adam',
    name: 'Ādām & Ḥawwāh',
    title: 'The Garden Stewards',
    description: 'First stewards of God’s pristine creation in Eden, walking in fellowship with the Creator.',
    signatureVerse: 'So God created mankind in His own image, in the image of God He created them.',
    verseRef: 'Genesis 1:27',
    themeColor: '#10B981',
    lipColor: '#059669',
    tintColor: '#D1FAE5',
  },
  noah: {
    id: 'noah',
    name: 'Nōaḥ',
    title: 'The Ark Builder',
    description: 'Righteous and blameless in his generation, he walked with God and preserved life through the flood.',
    signatureVerse: 'Noah found favor in the eyes of the LORD.',
    verseRef: 'Genesis 6:8',
    themeColor: '#0D9488',
    lipColor: '#0F766E',
    tintColor: '#CCFBF1',
  },
  abraham: {
    id: 'abraham',
    name: 'Avrāhām',
    title: 'The Father of Faith',
    description: 'Called to leave his homeland, his faith in God’s heavenly promise was counted as righteousness.',
    signatureVerse: 'Look up at the sky and count the stars — so shall your offspring be.',
    verseRef: 'Genesis 15:5',
    themeColor: '#0284C7',
    lipColor: '#0369A1',
    tintColor: '#E0F2FE',
  },
  joseph: {
    id: 'joseph',
    name: 'Yōsēf',
    title: 'The Preserver of Israel',
    description: 'A dreamer betrayed and exalted, who recognized that God turns evil into profound goodness.',
    signatureVerse: 'You intended to harm me, but God intended it for good to save many lives.',
    verseRef: 'Genesis 50:20',
    themeColor: '#7C3AED',
    lipColor: '#6D28D9',
    tintColor: '#EDE9FE',
  },
  joshua: {
    id: 'joshua',
    name: 'Yəhōshūa',
    title: 'The Valiant Commander',
    description: 'Courageous leader who brought Israel into the Promised Land, declaring that his house serves the Lord.',
    signatureVerse: 'Be strong and courageous! Do not be afraid; the LORD your God is with you.',
    verseRef: 'Joshua 1:9',
    themeColor: '#EA580C',
    lipColor: '#C2410C',
    tintColor: '#FFEDD5',
  },
  daniel: {
    id: 'daniel',
    name: 'Dāniyēl',
    title: 'The Lion-Hearted Prophet',
    description: 'Steadfast in prayer through Babylonian captivity, miraculously delivered from the lions’ den.',
    signatureVerse: 'My God sent His angel, and He shut the mouths of the lions.',
    verseRef: 'Daniel 6:22',
    themeColor: '#2563EB',
    lipColor: '#1D4ED8',
    tintColor: '#DBEAFE',
  },
  jesus: {
    id: 'jesus',
    name: 'Yēshūa',
    title: 'The Messiah & King of Kings',
    description: 'The Son of God, Light of the World, Lamb of God who conquered sin and death on the cross.',
    signatureVerse: 'I am the way and the truth and the life. No one comes to the Father except through Me.',
    verseRef: 'John 14:6',
    themeColor: '#F59E0B',
    lipColor: '#D97706',
    tintColor: '#FEF3C7',
  },
  peter: {
    id: 'peter',
    name: 'Pētros',
    title: 'The Bold Apostle',
    description: 'Fisher of men and rock of the early church, filled with the Holy Spirit on the Day of Pentecost.',
    signatureVerse: 'You are the Messiah, the Son of the living God.',
    verseRef: 'Matthew 16:16',
    themeColor: '#0891B2',
    lipColor: '#0E7490',
    tintColor: '#CFFAFE',
  },
  paul: {
    id: 'paul',
    name: 'Paulos',
    title: 'The Apostle to the Nations',
    description: 'Transformed herald of the Gospel who traveled the ancient world preaching grace and faith.',
    signatureVerse: 'I can do all this through Him who gives me strength.',
    verseRef: 'Philippians 4:13',
    themeColor: '#DC2626',
    lipColor: '#B91C1C',
    tintColor: '#FEE2E2',
  },
  john: {
    id: 'john',
    name: 'Yōḥānān',
    title: 'The Beloved Revelator',
    description: 'Apostle of love who leaned on Jesus’ chest and beheld the heavenly vision of the New Jerusalem.',
    signatureVerse: 'Behold, I make all things new!',
    verseRef: 'Revelation 21:5',
    themeColor: '#4F46E5',
    lipColor: '#4338CA',
    tintColor: '#EEF2FF',
  },
  solomon: {
    id: 'solomon',
    name: 'Shəlomō',
    title: 'The King of Wisdom',
    description: 'Builder of the magnificent Temple in Jerusalem and author of profound proverbs.',
    signatureVerse: 'Trust in the LORD with all your heart and lean not on your own understanding.',
    verseRef: 'Proverbs 3:5',
    themeColor: '#9333EA',
    lipColor: '#7E22CE',
    tintColor: '#F3E8FF',
  },
};

export interface GamifiedCharacterProps {
  character?: BiblicalCharacterId;
  pose?: MascotPose;
  size?: number;
  className?: string;
  showGroundShadow?: boolean;
}

/**
 * Biblical Character Avatar Component
 * Crafted in the clean icons set design style:
 * - Crisp rounded vector contours
 * - Flat 2-3 tone color blocking
 * - Distinctive biblical headwear, robes, accessories, and hair
 * - Expressive, warm animated poses (idle, cheer, thinking, sad)
 */
export const BiblicalCharacter: React.FC<GamifiedCharacterProps> = ({
  character = 'david',
  pose = 'idle',
  size = 140,
  className = '',
  showGroundShadow = true,
}) => {
  const charDef = BIBLICAL_CHARACTERS[character] || BIBLICAL_CHARACTERS['david'];

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title={`${charDef.name} • ${charDef.title}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Ground Ellipse Shadow */}
        {showGroundShadow && (
          <ellipse cx="100" cy="182" rx="55" ry="9" fill="#E2E8F0" opacity="0.8" />
        )}

        {character === 'david' && <DavidSVG pose={pose} />}
        {character === 'miryam' && <MiryamSVG pose={pose} />}
        {character === 'moshe' && <MosheSVG pose={pose} />}
        {character === 'deborah' && <DeborahSVG pose={pose} />}
        {character === 'esther' && <EstherSVG pose={pose} />}
        {character === 'eliyah' && <EliyahSVG pose={pose} />}
        {character === 'ruth' && <RuthSVG pose={pose} />}

        {/* New 365 Chronicle Characters */}
        {(character === 'adam' || character === 'noah') && <MosheSVG pose={pose} />}
        {character === 'abraham' && <MosheSVG pose={pose} />}
        {(character === 'joseph' || character === 'solomon') && <DavidSVG pose={pose} />}
        {(character === 'joshua' || character === 'daniel') && <EliyahSVG pose={pose} />}
        {character === 'jesus' && (
          <g>
            {/* Radiant Halo */}
            <circle cx="100" cy="70" r="48" fill="#FEF3C7" opacity="0.85" />
            <circle cx="100" cy="70" r="44" stroke="#F59E0B" strokeWidth="3" strokeDasharray="4 4" />
            <MosheSVG pose={pose} />
          </g>
        )}
        {(character === 'peter' || character === 'paul' || character === 'john') && <EliyahSVG pose={pose} />}
      </svg>
    </div>
  );
};

/**
 * Drop-in alias for GamifiedMascot to preserve all existing imports seamlessly.
 */
export const GamifiedMascot = BiblicalCharacter;
export type GamifiedMascotProps = GamifiedCharacterProps;

// ============================================================================
// 1. DĀVĪD (The Young Shepherd-Psalmist)
// ============================================================================
const DavidSVG: React.FC<{ pose: MascotPose }> = ({ pose }) => (
  <g>
    {/* Body / Shepherd Tunic */}
    <path d="M72 135 C72 115, 128 115, 128 135 L135 174 C135 178, 65 178, 65 174 Z" fill="#1CB0F6" />
    <path d="M85 135 L115 135 L120 174 L80 174 Z" fill="#1899D6" />
    {/* Belt / Sash */}
    <rect x="76" y="150" width="48" height="6" rx="3" fill="#FFC800" />
    <circle cx="100" cy="153" r="5" fill="#E5A600" />

    {/* Feet / Sandals */}
    <ellipse cx="80" cy="176" rx="12" ry="6" fill="#78350F" />
    <ellipse cx="120" cy="176" rx="12" ry="6" fill="#78350F" />

    {/* Neck */}
    <rect x="92" y="105" width="16" height="15" rx="4" fill="#FCD5B5" />

    {/* Arms depending on pose */}
    {pose === 'cheer' && (
      <g>
        {/* Raised arms */}
        <path d="M74 130 C55 105, 45 80, 56 75 C65 72, 75 95, 82 120 Z" fill="#FCD5B5" stroke="#1899D6" strokeWidth="2.5" />
        <path d="M126 130 C145 105, 155 80, 144 75 C135 72, 125 95, 118 120 Z" fill="#FCD5B5" stroke="#1899D6" strokeWidth="2.5" />
        {/* Sparkles / Golden Musical Notes */}
        <path d="M38 65 L43 55 L48 65 L58 70 L48 75 L43 85 L38 75 L28 70 Z" fill="#FFC800" />
        <path d="M162 60 L165 52 L168 60 L176 63 L168 66 L165 74 L162 66 L154 63 Z" fill="#58CC02" />
        <circle cx="152" cy="85" r="4" fill="#1CB0F6" />
        <circle cx="45" cy="95" r="3.5" fill="#FF9600" />
      </g>
    )}

    {pose === 'thinking' && (
      <g>
        <path d="M74 135 C65 145, 60 160, 68 165 C76 168, 80 155, 84 140 Z" fill="#FCD5B5" />
        {/* Right arm to chin */}
        <path d="M126 135 C132 120, 126 100, 114 104 C106 107, 112 125, 120 138 Z" fill="#FCD5B5" stroke="#1899D6" strokeWidth="2" />
        <ellipse cx="112" cy="103" rx="6" ry="6" fill="#FCD5B5" />
      </g>
    )}

    {pose === 'sad' && (
      <g>
        {/* Arms resting low */}
        <path d="M74 135 C64 145, 60 160, 68 165 C76 168, 78 155, 80 142 Z" fill="#FCD5B5" />
        <path d="M126 135 C136 145, 140 160, 132 165 C124 168, 122 155, 120 142 Z" fill="#FCD5B5" />
      </g>
    )}

    {pose === 'idle' && (
      <g>
        {/* Holding Mini Lyre / Harp */}
        <path d="M74 135 C66 145, 68 160, 76 162 Z" fill="#FCD5B5" />
        {/* Golden Lyre */}
        <path d="M122 132 C132 125, 145 130, 144 148 C143 162, 130 165, 122 155 Z" fill="#FFC800" stroke="#CE7C00" strokeWidth="2.5" />
        <line x1="128" y1="135" x2="128" y2="155" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="134" y1="135" x2="134" y2="155" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="140" y1="138" x2="140" y2="152" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Hand touching lyre */}
        <ellipse cx="122" cy="144" rx="6" ry="5" fill="#FCD5B5" />
      </g>
    )}

    {/* Head / Face */}
    <ellipse cx="100" cy="78" rx="36" ry="36" fill="#FCD5B5" />
    {/* Rosy Cheeks */}
    <ellipse cx="78" cy="88" rx="6" ry="4" fill="#FFB4C8" opacity="0.7" />
    <ellipse cx="122" cy="88" rx="6" ry="4" fill="#FFB4C8" opacity="0.7" />

    {/* Big Curly Locks */}
    <circle cx="70" cy="54" r="14" fill="#5D3A1A" />
    <circle cx="88" cy="45" r="15" fill="#5D3A1A" />
    <circle cx="112" cy="45" r="15" fill="#5D3A1A" />
    <circle cx="130" cy="54" r="14" fill="#5D3A1A" />
    <circle cx="64" cy="70" r="11" fill="#5D3A1A" />
    <circle cx="136" cy="70" r="11" fill="#5D3A1A" />
    {/* Blue & Gold Headband */}
    <path d="M68 62 C88 54, 112 54, 132 62" stroke="#1CB0F6" strokeWidth="7" strokeLinecap="round" fill="none" />
    <circle cx="100" cy="57" r="4" fill="#FFC800" />

    {/* Eyes & Eyebrows based on pose */}
    {pose === 'cheer' ? (
      <g>
        <path d="M78 78 Q88 68 98 78" stroke="#2B2D42" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M102 78 Q112 68 122 78" stroke="#2B2D42" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M88 92 Q100 114 112 92 Z" fill="#FF4B4B" />
        <path d="M92 92 Q100 100 108 92 Z" fill="#FFFFFF" />
      </g>
    ) : pose === 'thinking' ? (
      <g>
        <path d="M76 68 Q86 64 94 70" stroke="#2B2D42" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M106 72 Q116 72 124 66" stroke="#2B2D42" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <ellipse cx="88" cy="78" rx="6" ry="8" fill="#2B2D42" />
        <circle cx="89" cy="75" r="2.5" fill="#FFFFFF" />
        <ellipse cx="114" cy="78" rx="6" ry="8" fill="#2B2D42" />
        <circle cx="115" cy="75" r="2.5" fill="#FFFFFF" />
        <path d="M94 94 Q102 91 108 96" stroke="#2B2D42" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>
    ) : pose === 'sad' ? (
      <g>
        <path d="M76 72 Q86 78 94 74" stroke="#2B2D42" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M106 74 Q114 78 124 72" stroke="#2B2D42" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <ellipse cx="86" cy="82" rx="6" ry="7" fill="#2B2D42" />
        <circle cx="88" cy="80" r="2.5" fill="#FFFFFF" />
        <ellipse cx="114" cy="82" rx="6" ry="7" fill="#2B2D42" />
        <circle cx="116" cy="80" r="2.5" fill="#FFFFFF" />
        <path d="M93 98 Q100 93 107 98" stroke="#2B2D42" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>
    ) : (
      <g>
        <ellipse cx="86" cy="78" rx="6" ry="8" fill="#2B2D42" />
        <circle cx="88" cy="75" r="2.5" fill="#FFFFFF" />
        <ellipse cx="114" cy="78" rx="6" ry="8" fill="#2B2D42" />
        <circle cx="116" cy="75" r="2.5" fill="#FFFFFF" />
        <path d="M92 90 Q100 100 108 90" stroke="#2B2D42" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>
    )}
  </g>
);

// ============================================================================
// 2. MĪRYĀM (The Prophetess of Song)
// ============================================================================
const MiryamSVG: React.FC<{ pose: MascotPose }> = ({ pose }) => (
  <g>
    {/* Flowing Emerald Robe */}
    <path d="M70 135 C70 115, 130 115, 130 135 L140 174 C140 178, 60 178, 60 174 Z" fill="#0D9488" />
    <path d="M85 135 L115 135 L120 174 L80 174 Z" fill="#0F766E" />
    {/* Gold trim */}
    <path d="M60 172 L140 172" stroke="#F59E0B" strokeWidth="4" />

    {/* Feet */}
    <ellipse cx="80" cy="176" rx="11" ry="5.5" fill="#92400E" />
    <ellipse cx="120" cy="176" rx="11" ry="5.5" fill="#92400E" />

    {/* Neck */}
    <rect x="92" y="105" width="16" height="15" rx="4" fill="#E5A672" />

    {/* Arms & Timbrel based on pose */}
    {pose === 'cheer' ? (
      <g>
        <path d="M72 130 C50 100, 42 75, 54 70 C64 68, 75 90, 82 120 Z" fill="#E5A672" />
        <path d="M128 130 C150 100, 158 75, 146 70 C136 68, 125 90, 118 120 Z" fill="#E5A672" />
        {/* Tambourine held high */}
        <circle cx="152" cy="62" r="14" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
        <circle cx="152" cy="62" r="10" fill="#FEF3C7" />
        <circle cx="144" cy="54" r="2.5" fill="#F59E0B" />
        <circle cx="160" cy="54" r="2.5" fill="#F59E0B" />
        <circle cx="160" cy="70" r="2.5" fill="#F59E0B" />
        <circle cx="144" cy="70" r="2.5" fill="#F59E0B" />
        {/* Joyful Musical Notes */}
        <path d="M36 60 Q42 50 48 56 T60 52" stroke="#0D9488" strokeWidth="3" fill="none" />
        <circle cx="48" cy="56" r="3.5" fill="#0D9488" />
        <circle cx="60" cy="52" r="3.5" fill="#0D9488" />
      </g>
    ) : pose === 'thinking' ? (
      <g>
        <path d="M72 135 C64 145, 60 160, 68 165 Z" fill="#E5A672" />
        <path d="M128 135 C134 118, 126 102, 115 106 Z" fill="#E5A672" />
        <ellipse cx="114" cy="104" rx="6" ry="6" fill="#E5A672" />
      </g>
    ) : (
      <g>
        {/* Holding Timbrel by hip */}
        <path d="M72 135 C64 145, 66 160, 74 162 Z" fill="#E5A672" />
        <circle cx="128" cy="142" r="14" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
        <circle cx="128" cy="142" r="10" fill="#FEF3C7" />
        <ellipse cx="124" cy="140" rx="5" ry="4" fill="#E5A672" />
      </g>
    )}

    {/* Head & Face */}
    <ellipse cx="100" cy="78" rx="35" ry="35" fill="#E5A672" />
    <ellipse cx="78" cy="88" rx="6" ry="3.5" fill="#FF8BA7" opacity="0.6" />
    <ellipse cx="122" cy="88" rx="6" ry="3.5" fill="#FF8BA7" opacity="0.6" />

    {/* Flowing Teal Headwrap & Dark Curls */}
    <path d="M60 76 C58 50, 75 35, 100 35 C125 35, 142 50, 140 76 C130 65, 115 60, 100 60 C85 60, 70 65, 60 76 Z" fill="#0D9488" />
    <path d="M64 68 C80 58, 120 58, 136 68" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    <circle cx="100" cy="58" r="4.5" fill="#EF4444" stroke="#F59E0B" strokeWidth="1.5" />
    {/* Dark Hair Curls peeking */}
    <circle cx="64" cy="82" r="8" fill="#1C1917" />
    <circle cx="136" cy="82" r="8" fill="#1C1917" />

    {/* Eyes & Facial Expression */}
    {pose === 'cheer' ? (
      <g>
        <path d="M78 78 Q88 68 98 78" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M102 78 Q112 68 122 78" stroke="#1C1917" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M88 92 Q100 112 112 92 Z" fill="#EF4444" />
        <path d="M92 92 Q100 98 108 92 Z" fill="#FFFFFF" />
      </g>
    ) : pose === 'thinking' ? (
      <g>
        <ellipse cx="88" cy="78" rx="5.5" ry="7.5" fill="#1C1917" />
        <circle cx="89" cy="75" r="2" fill="#FFFFFF" />
        <ellipse cx="114" cy="78" rx="5.5" ry="7.5" fill="#1C1917" />
        <circle cx="115" cy="75" r="2" fill="#FFFFFF" />
        <path d="M94 94 Q102 91 108 95" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ) : pose === 'sad' ? (
      <g>
        <ellipse cx="86" cy="80" rx="5.5" ry="7" fill="#1C1917" />
        <circle cx="88" cy="78" r="2" fill="#FFFFFF" />
        <ellipse cx="114" cy="80" rx="5.5" ry="7" fill="#1C1917" />
        <circle cx="116" cy="78" r="2" fill="#FFFFFF" />
        <path d="M93 96 Q100 91 107 96" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ) : (
      <g>
        <ellipse cx="86" cy="78" rx="5.5" ry="7.5" fill="#1C1917" />
        <circle cx="88" cy="75" r="2" fill="#FFFFFF" />
        <ellipse cx="114" cy="78" rx="5.5" ry="7.5" fill="#1C1917" />
        <circle cx="116" cy="75" r="2" fill="#FFFFFF" />
        <path d="M92 90 Q100 98 108 90" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    )}
  </g>
);

// ============================================================================
// 3. MŌSHĒ (The Wise Lawgiver)
// ============================================================================
const MosheSVG: React.FC<{ pose: MascotPose }> = ({ pose }) => (
  <g>
    {/* Deep Indigo Mantle */}
    <path d="M68 135 C68 115, 132 115, 132 135 L142 174 C142 178, 58 178, 58 174 Z" fill="#4338CA" />
    <path d="M84 135 L116 135 L122 174 L78 174 Z" fill="#3730A3" />

    {/* Feet */}
    <ellipse cx="80" cy="176" rx="11" ry="5.5" fill="#451A03" />
    <ellipse cx="120" cy="176" rx="11" ry="5.5" fill="#451A03" />

    {/* Staff of Truth */}
    <line x1="140" y1="50" x2="140" y2="176" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
    <path d="M140 50 C140 40, 150 40, 150 50" stroke="#92400E" strokeWidth="5" strokeLinecap="round" fill="none" />
    <circle cx="145" cy="42" r="4" fill="#FBBF24" />

    {/* Neck */}
    <rect x="92" y="105" width="16" height="15" rx="4" fill="#EAB388" />

    {/* Head & Face */}
    <ellipse cx="100" cy="75" rx="34" ry="34" fill="#EAB388" />

    {/* White & Blue Mantle Hood */}
    <path d="M62 75 C60 48, 76 34, 100 34 C124 34, 140 48, 138 75 C130 64, 115 58, 100 58 C85 58, 70 64, 62 75 Z" fill="#4338CA" />
    <path d="M66 65 C80 54, 120 54, 134 65" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" fill="none" />

    {/* Flowing Wise Beard */}
    <path d="M72 85 C72 128, 100 135, 100 135 C100 135, 128 128, 128 85 C122 92, 110 95, 100 95 C90 95, 78 92, 72 85 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
    <ellipse cx="100" cy="98" rx="8" ry="4" fill="#E2E8F0" />

    {/* Hand holding staff */}
    <ellipse cx="138" cy="120" rx="6" ry="6" fill="#EAB388" />

    {/* Expression based on pose */}
    {pose === 'cheer' ? (
      <g>
        {/* Radiance Beam from Staff */}
        <polygon points="145,28 148,36 156,38 148,40 145,48 142,40 134,38 142,36" fill="#FBBF24" />
        <path d="M78 72 Q88 64 96 72" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M104 72 Q112 64 122 72" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M92 88 Q100 96 108 88" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ) : pose === 'thinking' ? (
      <g>
        <ellipse cx="88" cy="72" rx="5" ry="6.5" fill="#1E293B" />
        <circle cx="89" cy="70" r="1.8" fill="#FFFFFF" />
        <ellipse cx="114" cy="72" rx="5" ry="6.5" fill="#1E293B" />
        <circle cx="115" cy="70" r="1.8" fill="#FFFFFF" />
        {/* Eyebrow raised */}
        <path d="M76 64 Q86 60 94 66" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M106 66 Q116 66 124 62" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>
    ) : (
      <g>
        <ellipse cx="86" cy="72" rx="5" ry="6.5" fill="#1E293B" />
        <circle cx="88" cy="70" r="1.8" fill="#FFFFFF" />
        <ellipse cx="114" cy="72" rx="5" ry="6.5" fill="#1E293B" />
        <circle cx="116" cy="70" r="1.8" fill="#FFFFFF" />
        {/* Serene gentle smile */}
        <path d="M92 86 Q100 92 108 86" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    )}
  </g>
);

// ============================================================================
// 4. DEBŌRĀH (The Valiant Judge)
// ============================================================================
const DeborahSVG: React.FC<{ pose: MascotPose }> = ({ pose }) => (
  <g>
    {/* Amethyst Judge Mantle */}
    <path d="M70 135 C70 115, 130 115, 130 135 L140 174 C140 178, 60 178, 60 174 Z" fill="#7C3AED" />
    <path d="M85 135 L115 135 L120 174 L80 174 Z" fill="#6D28D9" />

    {/* Gold trim */}
    <rect x="76" y="148" width="48" height="6" rx="3" fill="#F59E0B" />
    <circle cx="100" cy="151" r="5" fill="#D97706" />

    {/* Feet */}
    <ellipse cx="80" cy="176" rx="11" ry="5.5" fill="#581C87" />
    <ellipse cx="120" cy="176" rx="11" ry="5.5" fill="#581C87" />

    {/* Neck */}
    <rect x="92" y="105" width="16" height="15" rx="4" fill="#C68652" />

    {/* Palm Leaf Emblem */}
    <path d="M125 125 C135 110, 145 105, 148 115 C142 125, 135 135, 125 135 Z" fill="#16A34A" />
    <path d="M125 135 Q138 120 148 115" stroke="#15803D" strokeWidth="1.5" />

    {/* Head & Face */}
    <ellipse cx="100" cy="76" rx="35" ry="35" fill="#C68652" />
    <ellipse cx="78" cy="86" rx="6" ry="3.5" fill="#F43F5E" opacity="0.5" />
    <ellipse cx="122" cy="86" rx="6" ry="3.5" fill="#F43F5E" opacity="0.5" />

    {/* Regal Violet Headdress & Laurel/Palm Band */}
    <path d="M60 74 C58 48, 76 34, 100 34 C124 34, 142 48, 140 74 C130 63, 115 58, 100 58 C85 58, 70 63, 60 74 Z" fill="#7C3AED" />
    <path d="M66 66 C80 56, 120 56, 134 66" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    {/* Golden Laurel Leaf Centered */}
    <ellipse cx="100" cy="56" rx="5" ry="3" fill="#FBBF24" />

    {/* Expression based on pose */}
    {pose === 'cheer' ? (
      <g>
        <path d="M78 76 Q88 66 98 76" stroke="#1E1B18" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M102 76 Q112 66 122 76" stroke="#1E1B18" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M88 90 Q100 110 112 90 Z" fill="#DC2626" />
        <path d="M92 90 Q100 96 108 90 Z" fill="#FFFFFF" />
        {/* Victory Stars */}
        <polygon points="52,48 55,54 62,56 55,58 52,64 49,58 42,56 49,54" fill="#F59E0B" />
        <polygon points="148,48 151,54 158,56 151,58 148,64 145,58 138,56 145,54" fill="#F59E0B" />
      </g>
    ) : pose === 'thinking' ? (
      <g>
        <ellipse cx="88" cy="76" rx="5.5" ry="7" fill="#1E1B18" />
        <circle cx="89" cy="73" r="2" fill="#FFFFFF" />
        <ellipse cx="114" cy="76" rx="5.5" ry="7" fill="#1E1B18" />
        <circle cx="115" cy="73" r="2" fill="#FFFFFF" />
        <path d="M76 68 Q86 64 94 70" stroke="#1E1B18" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M94 92 Q102 89 108 93" stroke="#1E1B18" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ) : (
      <g>
        <ellipse cx="86" cy="76" rx="5.5" ry="7" fill="#1E1B18" />
        <circle cx="88" cy="73" r="2" fill="#FFFFFF" />
        <ellipse cx="114" cy="76" rx="5.5" ry="7" fill="#1E1B18" />
        <circle cx="116" cy="73" r="2" fill="#FFFFFF" />
        <path d="M92 88 Q100 96 108 88" stroke="#1E1B18" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    )}
  </g>
);

// ============================================================================
// 5. ESTHĒR (Queen of Courage)
// ============================================================================
const EstherSVG: React.FC<{ pose: MascotPose }> = ({ pose }) => (
  <g>
    {/* Regal Magenta Robe */}
    <path d="M70 135 C70 115, 130 115, 130 135 L140 174 C140 178, 60 178, 60 174 Z" fill="#EC4899" />
    <path d="M85 135 L115 135 L120 174 L80 174 Z" fill="#DB2777" />

    {/* Gold Collar */}
    <path d="M85 130 C95 138, 105 138, 115 130" stroke="#FBBF24" strokeWidth="4" fill="none" />

    {/* Feet */}
    <ellipse cx="80" cy="176" rx="11" ry="5.5" fill="#831843" />
    <ellipse cx="120" cy="176" rx="11" ry="5.5" fill="#831843" />

    {/* Neck */}
    <rect x="92" y="105" width="16" height="15" rx="4" fill="#FDE2D0" />

    {/* Head & Face */}
    <ellipse cx="100" cy="76" rx="35" ry="35" fill="#FDE2D0" />
    <ellipse cx="78" cy="86" rx="6" ry="4" fill="#FDA4AF" opacity="0.8" />
    <ellipse cx="122" cy="86" rx="6" ry="4" fill="#FDA4AF" opacity="0.8" />

    {/* Flowing Dark Hair */}
    <circle cx="64" cy="76" r="12" fill="#18181B" />
    <circle cx="136" cy="76" r="12" fill="#18181B" />
    <path d="M66 58 C80 48, 120 48, 134 58" fill="#18181B" />

    {/* Ornate 3-point Golden Diadem Crown */}
    <polygon points="80,56 86,40 94,52 100,36 106,52 114,40 120,56" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
    <circle cx="86" cy="42" r="2.5" fill="#EF4444" />
    <circle cx="100" cy="38" r="3" fill="#3B82F6" />
    <circle cx="114" cy="42" r="2.5" fill="#EF4444" />

    {/* Expression based on pose */}
    {pose === 'cheer' ? (
      <g>
        <path d="M78 76 Q88 66 98 76" stroke="#18181B" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M102 76 Q112 66 122 76" stroke="#18181B" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M88 90 Q100 110 112 90 Z" fill="#E11D48" />
        <path d="M92 90 Q100 96 108 90 Z" fill="#FFFFFF" />
        <polygon points="144,32 147,38 153,40 147,42 144,48 141,42 135,40 141,38" fill="#FBBF24" />
      </g>
    ) : pose === 'thinking' ? (
      <g>
        <ellipse cx="88" cy="76" rx="5.5" ry="7" fill="#18181B" />
        <circle cx="89" cy="73" r="2" fill="#FFFFFF" />
        <ellipse cx="114" cy="76" rx="5.5" ry="7" fill="#18181B" />
        <circle cx="115" cy="73" r="2" fill="#FFFFFF" />
        <path d="M94 92 Q102 89 108 93" stroke="#18181B" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ) : (
      <g>
        <ellipse cx="86" cy="76" rx="5.5" ry="7" fill="#18181B" />
        <circle cx="88" cy="73" r="2" fill="#FFFFFF" />
        <ellipse cx="114" cy="76" rx="5.5" ry="7" fill="#18181B" />
        <circle cx="116" cy="73" r="2" fill="#FFFFFF" />
        <path d="M92 88 Q100 96 108 88" stroke="#18181B" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    )}
  </g>
);

// ============================================================================
// 6. ELIYĀH (The Mountain Prophet)
// ============================================================================
const EliyahSVG: React.FC<{ pose: MascotPose }> = ({ pose }) => (
  <g>
    {/* Earthy Camel-hair Tunic & Fiery Scarf */}
    <path d="M70 135 C70 115, 130 115, 130 135 L140 174 C140 178, 60 178, 60 174 Z" fill="#78350F" />
    <path d="M85 135 L115 135 L120 174 L80 174 Z" fill="#92400E" />
    {/* Fiery Orange Scarf */}
    <path d="M74 125 C88 135, 112 135, 126 125 L122 145 C110 148, 90 148, 78 145 Z" fill="#F97316" />

    {/* Feet */}
    <ellipse cx="80" cy="176" rx="11" ry="5.5" fill="#451A03" />
    <ellipse cx="120" cy="176" rx="11" ry="5.5" fill="#451A03" />

    {/* Neck */}
    <rect x="92" y="105" width="16" height="15" rx="4" fill="#D9945D" />

    {/* Head & Face */}
    <ellipse cx="100" cy="75" rx="34" ry="34" fill="#D9945D" />

    {/* Wild Hair & Beard */}
    <circle cx="68" cy="54" r="14" fill="#334155" />
    <circle cx="88" cy="44" r="15" fill="#334155" />
    <circle cx="112" cy="44" r="15" fill="#334155" />
    <circle cx="132" cy="54" r="14" fill="#334155" />
    {/* Short Rugged Beard */}
    <path d="M74 85 C74 116, 100 124, 100 124 C100 124, 126 116, 126 85 Z" fill="#334155" />

    {/* Divine Spark Flame */}
    <g transform="translate(136, 60)">
      <path d="M10 2 C12 7, 18 11, 18 17 C18 22, 14 26, 10 26 C6 26, 2 22, 2 17 C2 12, 6 9, 8 6 Z" fill="#F97316" />
      <path d="M10 9 C11 12, 15 14, 15 18 C15 21, 13 23, 10 23 C7 23, 5 21, 5 18 Z" fill="#FDE047" />
    </g>

    {/* Eyes & Expression */}
    {pose === 'cheer' ? (
      <g>
        <path d="M78 72 Q88 64 96 72" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M104 72 Q112 64 122 72" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M90 86 Q100 98 110 86 Z" fill="#EF4444" />
      </g>
    ) : (
      <g>
        <ellipse cx="86" cy="74" rx="5" ry="6.5" fill="#0F172A" />
        <circle cx="88" cy="72" r="1.8" fill="#FFFFFF" />
        <ellipse cx="114" cy="74" rx="5" ry="6.5" fill="#0F172A" />
        <circle cx="116" cy="72" r="1.8" fill="#FFFFFF" />
        <path d="M92 86 Q100 92 108 86" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    )}
  </g>
);

// ============================================================================
// 7. RŪTH (The Loyal Companion)
// ============================================================================
const RuthSVG: React.FC<{ pose: MascotPose }> = ({ pose }) => (
  <g>
    {/* Warm Terracotta Robe */}
    <path d="M70 135 C70 115, 130 115, 130 135 L140 174 C140 178, 60 178, 60 174 Z" fill="#C2410C" />
    <path d="M85 135 L115 135 L120 174 L80 174 Z" fill="#9A3412" />

    {/* Golden Apron */}
    <rect x="78" y="146" width="44" height="26" rx="4" fill="#FCD34D" opacity="0.9" />

    {/* Feet */}
    <ellipse cx="80" cy="176" rx="11" ry="5.5" fill="#78350F" />
    <ellipse cx="120" cy="176" rx="11" ry="5.5" fill="#78350F" />

    {/* Sheaf of Golden Wheat */}
    <g transform="translate(118, 118)">
      <path d="M6 35 C12 20, 18 10, 24 2" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="24" cy="4" rx="4" ry="7" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" transform="rotate(25 24 4)" />
      <ellipse cx="18" cy="12" rx="3.5" ry="6" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" transform="rotate(-20 18 12)" />
      <ellipse cx="26" cy="18" rx="3.5" ry="6" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" transform="rotate(20 26 18)" />
    </g>

    {/* Neck */}
    <rect x="92" y="105" width="16" height="15" rx="4" fill="#F7C59F" />

    {/* Head & Face */}
    <ellipse cx="100" cy="76" rx="35" ry="35" fill="#F7C59F" />
    <ellipse cx="78" cy="86" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.7" />
    <ellipse cx="122" cy="86" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.7" />

    {/* Golden Harvest Scarf */}
    <path d="M60 74 C58 48, 76 34, 100 34 C124 34, 142 48, 140 74 C130 63, 115 58, 100 58 C85 58, 70 63, 60 74 Z" fill="#F59E0B" />
    <circle cx="100" cy="58" r="4.5" fill="#FEF3C7" />

    {/* Expression based on pose */}
    {pose === 'cheer' ? (
      <g>
        <path d="M78 76 Q88 66 98 76" stroke="#262626" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M102 76 Q112 66 122 76" stroke="#262626" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M88 90 Q100 110 112 90 Z" fill="#E11D48" />
        <path d="M92 90 Q100 96 108 90 Z" fill="#FFFFFF" />
        <circle cx="50" cy="65" r="3.5" fill="#F59E0B" />
        <circle cx="150" cy="65" r="3.5" fill="#F59E0B" />
      </g>
    ) : pose === 'thinking' ? (
      <g>
        <ellipse cx="88" cy="76" rx="5.5" ry="7" fill="#262626" />
        <circle cx="89" cy="73" r="2" fill="#FFFFFF" />
        <ellipse cx="114" cy="76" rx="5.5" ry="7" fill="#262626" />
        <circle cx="115" cy="73" r="2" fill="#FFFFFF" />
        <path d="M94 92 Q102 89 108 93" stroke="#262626" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ) : (
      <g>
        <ellipse cx="86" cy="76" rx="5.5" ry="7" fill="#262626" />
        <circle cx="88" cy="73" r="2" fill="#FFFFFF" />
        <ellipse cx="114" cy="76" rx="5.5" ry="7" fill="#262626" />
        <circle cx="116" cy="73" r="2" fill="#FFFFFF" />
        <path d="M92 88 Q100 96 108 88" stroke="#262626" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    )}
  </g>
);

// ============================================================================
// Gamified Vector Tokens (Gems, Flames, Lightning Bolts, Hearts, Chests)
// ============================================================================

export const GamifiedGem: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={`inline-block ${className}`}>
    {/* Left body flank */}
    <polygon points="5,9 13,14 13,33 5,27" fill="#0D7EB6" />
    
    {/* Right body flank */}
    <polygon points="27,14 35,9 35,27 27,33" fill="#148BC4" />
    
    {/* Front center main facet */}
    <polygon points="13,14 27,14 20,38" fill="#1899D6" />
    
    {/* Lower bevels for 3D depth */}
    <polygon points="13,14 20,38 13,33" fill="#1086BF" />
    <polygon points="27,14 20,38 27,33" fill="#1282BA" />

    {/* Top crown facets */}
    <polygon points="5,9 20,2 13,14" fill="#84D7FF" />
    <polygon points="20,2 35,9 27,14" fill="#5DC5F8" />
    <polygon points="20,2 27,14 13,14" fill="#38BDF8" />
    
    {/* Specular Apex Highlight (Gleaming crystal triangle & reflection at top peak) */}
    <polygon points="20,3 23,8 17,8" fill="#FFFFFF" opacity="0.95" />
    <circle cx="20" cy="5.5" r="1.2" fill="#FFFFFF" />
  </svg>
);

export const GamifiedFlame: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={`inline-block ${className}`}>
    <path
      d="M20 2 C23 9, 32 15, 32 24 C32 31.7, 26.6 38, 20 38 C13.4 38, 8 31.7, 8 24 C8 17, 13 13, 17 9 C17 12, 19 14, 20 2 Z"
      fill="#FF9600"
    />
    <path
      d="M20 12 C22 17, 28 20, 28 26 C28 31, 24.4 35, 20 35 C15.6 35, 12 31, 12 26 C12 21, 16 18, 18 15 C18 17, 19 18, 20 12 Z"
      fill="#FFC800"
    />
    <ellipse cx="20" cy="28" rx="4.5" ry="5.5" fill="#FFFFFF" opacity="0.9" />
  </svg>
);

export const GamifiedXpBolt: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={`inline-block ${className}`}>
    <path d="M22 2 L9 21 L19 21 L16 38 L31 17 L21 17 Z" fill="#CE7C00" transform="translate(0, 3)" />
    <path d="M22 2 L9 21 L19 21 L16 38 L31 17 L21 17 Z" fill="#FFC800" />
    <path d="M22 2 L19 21 L23 19 L21 17 Z" fill="#FFE57F" />
  </svg>
);

export const GamifiedHeart: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={`inline-block ${className}`}>
    <path
      d="M20 35 C17 32, 6 23, 6 14 C6 8, 10.5 4, 16 4 C18.5 4, 20 5.5, 20 7 C20 5.5, 21.5 4, 24 4 C29.5 4, 34 8, 34 14 C34 23, 23 32, 20 35 Z"
      fill="#EA2B2B"
      transform="translate(0, 2.5)"
    />
    <path
      d="M20 35 C17 32, 6 23, 6 14 C6 8, 10.5 4, 16 4 C18.5 4, 20 5.5, 20 7 C20 5.5, 21.5 4, 24 4 C29.5 4, 34 8, 34 14 C34 23, 23 32, 20 35 Z"
      fill="#FF4B4B"
    />
    <ellipse cx="13" cy="11" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 13 11)" />
  </svg>
);

export type ChestRarity = 'common' | 'rare' | 'epic';

export const GamifiedChest: React.FC<{ rarity?: ChestRarity; size?: number; isOpen?: boolean; className?: string }> = ({
  rarity = 'common',
  size = 64,
  isOpen = false,
  className = '',
}) => {
  const baseColor = rarity === 'epic' ? '#7B4ECF' : rarity === 'rare' ? '#FFC800' : '#CE7C00';
  const highlightColor = rarity === 'epic' ? '#CE82FF' : rarity === 'rare' ? '#FFE066' : '#EEB785';
  const shadowColor = rarity === 'epic' ? '#4A2B8A' : rarity === 'rare' ? '#C29800' : '#8A4F00';

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={`inline-block ${className}`}>
      <ellipse cx="40" cy="74" rx="30" ry="5.5" fill="#E5E5E5" />
      <rect x="12" y="38" width="56" height="30" rx="8" fill={shadowColor} />
      <rect x="12" y="36" width="56" height="30" rx="8" fill={baseColor} />
      <rect x="22" y="36" width="8" height="30" fill={highlightColor} />
      <rect x="50" y="36" width="8" height="30" fill={highlightColor} />

      {!isOpen ? (
        <g>
          <path d="M10 36 C10 24, 22 18, 40 18 C58 18, 70 24, 70 36 Z" fill={shadowColor} transform="translate(0, 2)" />
          <path d="M10 36 C10 24, 22 18, 40 18 C58 18, 70 24, 70 36 Z" fill={baseColor} />
          <path d="M22 36 C22 25, 26 20, 30 20 L30 36 Z" fill={highlightColor} />
          <path d="M50 36 C50 25, 54 20, 58 20 L58 36 Z" fill={highlightColor} />
          <rect x="36" y="34" width="8" height="10" rx="3" fill="#FFC800" />
          <circle cx="40" cy="38" r="2" fill="#4B4B4B" />
        </g>
      ) : (
        <g>
          <path d="M10 24 C10 12, 22 6, 40 6 C58 6, 70 12, 70 24 Z" fill={baseColor} transform="rotate(-15 40 24)" />
          <ellipse cx="40" cy="36" rx="20" ry="10" fill="#FFF275" opacity="0.9" />
          <polygon points="40,16 43,26 53,28 43,30 40,40 37,30 27,28 37,26" fill="#FFC800" />
        </g>
      )}
    </svg>
  );
};
