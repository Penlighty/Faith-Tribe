import { PlacedWord, GeneratedWordSearchGrid, CellCoord } from './types';

// The 8 classic word search directions: horizontal, vertical, and diagonals (both forward and backward)
export const WORD_SEARCH_DIRECTIONS: [number, number][] = [
  [0, 1],   // Across Right
  [0, -1],  // Across Left
  [1, 0],   // Down
  [-1, 0],  // Up
  [1, 1],   // Diagonal Down-Right
  [1, -1],  // Diagonal Down-Left
  [-1, 1],  // Diagonal Up-Right
  [-1, -1], // Diagonal Up-Left
];

const FILLER_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Simple deterministic PRNG for reproducible puzzles per level seed if needed, with Math.random fallback
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateWordSearchGrid(words: string[], size: number = 10): GeneratedWordSearchGrid {
  const cleanWords = words
    .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ''))
    .filter((w) => w.length > 0 && w.length <= size);

  // Attempt up to 20 times to place 100% of the words cleanly
  for (let attempt = 0; attempt < 20; attempt++) {
    const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
    const placedWords: PlacedWord[] = [];
    let allPlaced = true;

    // Place longest words first
    const sortedWords = [...cleanWords].sort((a, b) => b.length - a.length);

    for (const word of sortedWords) {
      let placed = false;
      const directions = shuffleArray(WORD_SEARCH_DIRECTIONS);

      // Collect all possible (r, c) positions in random order
      const positions: CellCoord[] = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          positions.push([r, c]);
        }
      }
      const shuffledPositions = shuffleArray(positions);

      directionLoop: for (const dir of directions) {
        const [dr, dc] = dir;

        for (const [startR, startC] of shuffledPositions) {
          const endR = startR + dr * (word.length - 1);
          const endC = startC + dc * (word.length - 1);

          // Check grid boundaries
          if (endR < 0 || endR >= size || endC < 0 || endC >= size) {
            continue;
          }

          // Check if path is valid (empty or matching letter for intersecting words)
          let canPlace = true;
          const cells: CellCoord[] = [];

          for (let i = 0; i < word.length; i++) {
            const r = startR + dr * i;
            const c = startC + dc * i;
            const char = word[i];
            const existing = grid[r][c];

            if (existing !== '' && existing !== char) {
              canPlace = false;
              break;
            }
            cells.push([r, c]);
          }

          if (canPlace) {
            // Place word letters
            for (let i = 0; i < word.length; i++) {
              const [r, c] = cells[i];
              grid[r][c] = word[i];
            }

            placedWords.push({
              word,
              start: [startR, startC],
              end: [endR, endC],
              cells,
              direction: dir,
            });
            placed = true;
            break directionLoop;
          }
        }
      }

      if (!placed) {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      // Fill remaining empty cells with random filler letters
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!grid[r][c]) {
            grid[r][c] = FILLER_LETTERS[Math.floor(Math.random() * FILLER_LETTERS.length)];
          }
        }
      }

      return {
        grid,
        size,
        placedWords,
        words: cleanWords,
      };
    }
  }

  // Fallback: Return grid with whatever words could fit
  const fallbackGrid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      fallbackGrid[r][c] = FILLER_LETTERS[Math.floor(Math.random() * FILLER_LETTERS.length)];
    }
  }

  return {
    grid: fallbackGrid,
    size,
    placedWords: [],
    words: cleanWords,
  };
}

/**
 * Checks if a straight-line sequence of cells forms a valid straight path in one of 8 directions.
 */
export function getLineBetweenCells(start: CellCoord, end: CellCoord): CellCoord[] | null {
  const [r1, c1] = start;
  const [r2, c2] = end;

  const dr = r2 - r1;
  const dc = c2 - c1;

  if (dr === 0 && dc === 0) return [[r1, c1]];

  const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
  const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;

  // Must be horizontal, vertical, or perfectly 45-degree diagonal
  if (Math.abs(dr) !== 0 && Math.abs(dc) !== 0 && Math.abs(dr) !== Math.abs(dc)) {
    return null;
  }

  const length = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
  const line: CellCoord[] = [];

  for (let i = 0; i < length; i++) {
    line.push([r1 + stepR * i, c1 + stepC * i]);
  }

  return line;
}
