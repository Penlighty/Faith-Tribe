const BIBLICAL_ROOM_CODES = [
  'ZION', 'EDEN', 'NOAH', 'RUTH', 'PAUL', 'LUKE', 'PRAY', 'HOPE',
  'LOVE', 'SALT', 'LION', 'DOVE', 'SEEK', 'GLOW', 'AMEN', 'BLES',
  'STAR', 'CALM', 'ROCK', 'KING', 'SHAL', 'GRAC', 'GOLD', 'HERD',
];

export function generateRoomCode(): string {
  const randomIndex = Math.floor(Math.random() * BIBLICAL_ROOM_CODES.length);
  return BIBLICAL_ROOM_CODES[randomIndex];
}

export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{4}$/.test(code.trim().toUpperCase());
}
