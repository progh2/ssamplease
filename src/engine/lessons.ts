import { z } from 'zod';
import lessonData from '../content/lessons.json';

const bilingual = z.object({ ko: z.string().min(1), en: z.string().min(1) });
const schema = z.object({
  id: z.string().min(1), mode: z.enum(['sequence', 'rule']),
  title: bilingual, context: bilingual, question: bilingual, hint: bilingual,
  cards: z.array(z.object({ id: z.string(), ko: z.string(), en: z.string() })).optional(),
  correctOrder: z.array(z.string()).optional(),
  options: z.array(z.object({ id: z.string(), ko: z.string(), en: z.string(), outputs: z.array(z.string()) })).optional(),
  cases: z.array(z.object({ input: z.string(), expected: z.string() })).min(2),
  exitOptions: z.array(z.object({ id: z.string(), ko: z.string(), en: z.string(), correct: z.boolean() })).min(2),
}).superRefine((lesson, context) => {
  if (!lesson.exitOptions.some(option => option.correct)) context.addIssue({ code: 'custom', message: 'An understanding check needs a correct answer.' });
  if (lesson.mode === 'sequence') {
    const ids = lesson.cards?.map(card => card.id) ?? [];
    if (!ids.length || new Set(ids).size !== ids.length || lesson.correctOrder?.length !== ids.length || new Set(lesson.correctOrder).size !== ids.length || lesson.correctOrder.some(id => !ids.includes(id))) {
      context.addIssue({ code: 'custom', message: 'A sequence must use every unique card exactly once.' });
    }
  } else if (!lesson.options?.length || lesson.options.some(option => option.outputs.length !== lesson.cases.length) || !lesson.options.some(option => option.outputs.every((output, index) => output === lesson.cases[index].expected))) {
    context.addIssue({ code: 'custom', message: 'A rule puzzle must have complete examples and a reachable solution.' });
  }
});

export type Lesson = z.infer<typeof schema>;
export const lessons = z.array(schema).parse(lessonData);

export function lessonPasses(lesson: Lesson, order: string[], rule: string): boolean {
  if (lesson.mode === 'sequence') return order.join(',') === lesson.correctOrder?.join(',');
  const option = lesson.options?.find(item => item.id === rule);
  return !!option && option.outputs.every((output, index) => output === lesson.cases[index].expected);
}

export function localizedSample(text: string, en: boolean): string {
  const [ko, english] = text.split('|');
  return en ? english ?? ko : ko;
}
