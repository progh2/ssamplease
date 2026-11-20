import { expect, it } from 'vitest';
import { z } from 'zod';
import labs from './lessonLabs.json';
import { lessons } from '../engine/lessons';

it('every lesson has a bilingual workshop with reachable card decisions and specific feedback', () => {
  const text = z.object({ ko: z.string().min(1), en: z.string().min(1) });
  const schema = z.object({ title: text, brief: text, ending: text, kind: z.string(), bins: z.array(z.object({id:z.string(),label:text})).min(2), cards: z.array(z.object({id:z.string(),text, target:z.string(),explanation:text})).min(3) });
  expect(Object.keys(labs).sort()).toEqual(lessons.map(l=>l.id).sort());
  for (const raw of Object.values(labs)) {
    const lab = schema.parse(raw);
    expect(new Set(lab.cards.map(c=>c.id)).size).toBe(lab.cards.length);
    for (const card of lab.cards) expect(lab.bins.filter(b=>b.id===card.target)).toHaveLength(1);
  }
  expect(new Set(Object.values(labs).map(l=>l.kind)).size).toBeGreaterThanOrEqual(5);
});
