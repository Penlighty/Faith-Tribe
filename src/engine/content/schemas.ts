import { z } from 'zod';

export const WhoSaidItemSchema = z.object({
  id: z.string().min(1),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  quote: z.string().min(1),
  answer: z.string().min(1),
  options: z.array(z.string().min(1)).length(4).refine(
    (opts) => new Set(opts).size === 4,
    { message: 'Options must contain 4 unique items' }
  ),
  ref: z.string().min(1),
  note: z.string().min(1),
}).refine(
  (data) => data.options.includes(data.answer),
  { message: 'Options must include the correct answer' }
);

export type WhoSaidItem = z.infer<typeof WhoSaidItemSchema>;

export const TestamentSortItemSchema = z.object({
  id: z.string().min(1),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  name: z.string().min(1),
  type: z.enum(['person', 'place', 'thing']),
  answer: z.enum(['OT', 'NT', 'BOTH']),
  hint: z.string().min(1),
  refs: z.string().min(1),
  note: z.string().optional(),
});

export type TestamentSortItem = z.infer<typeof TestamentSortItemSchema>;

export function validateWhoSaidData(data: unknown[]): WhoSaidItem[] {
  const ids = new Set<string>();
  const validated = data.map((item, index) => {
    const parsed = WhoSaidItemSchema.parse(item);
    if (ids.has(parsed.id)) {
      throw new Error(`Duplicate WhoSaid id '${parsed.id}' at index ${index}`);
    }
    ids.add(parsed.id);
    return parsed;
  });
  return validated;
}

export function validateTestamentSortData(data: unknown[]): TestamentSortItem[] {
  const ids = new Set<string>();
  const validated = data.map((item, index) => {
    const parsed = TestamentSortItemSchema.parse(item);
    if (ids.has(parsed.id)) {
      throw new Error(`Duplicate TestamentSort id '${parsed.id}' at index ${index}`);
    }
    ids.add(parsed.id);
    return parsed;
  });
  return validated;
}

export const FourSignsPuzzleSchema = z.object({
  id: z.string().min(1),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  answer: z.string().min(1),
  category: z.string().min(1),
  clues: z.array(z.string().min(1)).length(4),
  distractors: z.array(z.string().min(1)).length(3),
  ref: z.string().min(1),
  why: z.string().min(1),
});

export type FourSignsPuzzle = z.infer<typeof FourSignsPuzzleSchema>;

export const FourSignsIconSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  uses: z.number().int().nonnegative().optional(),
});

export type FourSignsIcon = z.infer<typeof FourSignsIconSchema>;

export function validateFourSignsData(data: unknown[]): FourSignsPuzzle[] {
  const ids = new Set<string>();
  const validated = data.map((item, index) => {
    const parsed = FourSignsPuzzleSchema.parse(item);
    if (ids.has(parsed.id)) {
      throw new Error(`Duplicate FourSigns id '${parsed.id}' at index ${index}`);
    }
    ids.add(parsed.id);
    return parsed;
  });
  return validated;
}

export const ScribesTilesWordSchema = z.object({
  id: z.string().min(1),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  answer: z.string().min(1),
  length: z.number().int().positive(),
  category: z.string().min(1),
  clue: z.string().min(1),
  ref: z.string().min(1),
  decoys: z.array(z.string().min(1)),
});

export type ScribesTilesWord = z.infer<typeof ScribesTilesWordSchema>;

export function validateScribesTilesData(data: unknown[]): ScribesTilesWord[] {
  const ids = new Set<string>();
  const validated = data.map((item, index) => {
    const parsed = ScribesTilesWordSchema.parse(item);
    if (ids.has(parsed.id)) {
      throw new Error(`Duplicate ScribesTiles id '${parsed.id}' at index ${index}`);
    }
    ids.add(parsed.id);
    return parsed;
  });
  return validated;
}

export const BibleOrNotItemSchema = z.object({
  id: z.string().min(1),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string().min(1),
  answer: z.enum(['IN_BIBLE', 'NOT_IN_BIBLE']),
  category: z.string().min(1),
  explanation: z.string().min(1),
  reference: z.string().optional(),
  misconception: z.string().optional(),
});

export type BibleOrNotItem = z.infer<typeof BibleOrNotItemSchema>;

export function validateBibleOrNotData(data: unknown[]): BibleOrNotItem[] {
  const ids = new Set<string>();
  const validated = data.map((item, index) => {
    const parsed = BibleOrNotItemSchema.parse(item);
    if (ids.has(parsed.id)) {
      throw new Error(`Duplicate BibleOrNot id '${parsed.id}' at index ${index}`);
    }
    ids.add(parsed.id);
    return parsed;
  });
  return validated;
}
