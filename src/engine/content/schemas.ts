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
