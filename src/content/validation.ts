import { z } from 'zod';

const key = z.string().trim().min(1);
const taskSchema = z.object({
  id: key,
  day: z.number().int().positive(),
  kind: z.enum(['document', 'class', 'grading', 'message', 'equipment', 'approval', 'attendance', 'counseling', 'exam']),
  titleKey: key,
  descriptionKey: key,
  required: z.boolean(),
  variants: z.array(key),
  choices: z.array(z.object({
    labelKey: key,
    outcome: z.enum(['completed', 'resolved_with_issue']),
    feedbackKey: key,
  })).min(1),
});

export const contentSchema = z.array(z.object({
  day: z.number().int().positive(),
  weekday: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI']),
  titleKey: key,
  introKey: key,
  tasks: z.array(taskSchema).min(1),
})).min(1);

const dependencySchema = z.record(key, z.array(key));
const timetableSchema = z.record(key, z.object({
  period: z.number().int().min(1).max(4),
  classroom: key,
}));

/** Structural and reference validation runs before the engine consumes content. */
export function validateContent(rawDays: unknown, rawDependencies: unknown, rawTimetable: unknown) {
  const days = contentSchema.parse(rawDays);
  const dependencies = dependencySchema.parse(rawDependencies);
  const timetable = timetableSchema.parse(rawTimetable);
  const tasks = new Map<string, z.infer<typeof taskSchema>>();
  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  for (const [index, day] of days.entries()) {
    if (day.day !== index + 1) throw new Error('Days must be unique and consecutive starting at 1');
    if (day.weekday !== weekdays[index % 5]) throw new Error(`Wrong weekday for day ${day.day}`);
    for (const task of day.tasks) {
      if (tasks.has(task.id)) throw new Error(`Duplicate task ID: ${task.id}`);
      if (task.day !== day.day) throw new Error(`Task ${task.id} belongs to the wrong day`);
      tasks.set(task.id, task);
    }
  }
  for (const [id, required] of Object.entries(dependencies)) {
    const task = tasks.get(id);
    if (!task) throw new Error(`Unknown dependent task: ${id}`);
    for (const prerequisite of required) {
      const previous = tasks.get(prerequisite);
      if (!previous) throw new Error(`Unknown prerequisite: ${prerequisite}`);
      if (previous.day > task.day) throw new Error(`Future prerequisite: ${id} -> ${prerequisite}`);
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) throw new Error(`Dependency cycle at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const previous of dependencies[id] ?? []) visit(previous);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of tasks.keys()) visit(id);

  const periods = new Set<string>();
  for (const [id, entry] of Object.entries(timetable)) {
    const task = tasks.get(id);
    if (!task) throw new Error(`Unknown timetable task: ${id}`);
    if (task.kind !== 'class' && task.kind !== 'exam') throw new Error(`Unsupported scheduled task: ${id}`);
    const slot = `${task.day}:${entry.period}`;
    if (periods.has(slot)) throw new Error(`Overlapping timetable period: ${slot}`);
    periods.add(slot);
    // A class cannot depend, even indirectly, on a later class that cannot yet run.
    const checkEarlier = (previous: string) => {
      const previousTask = tasks.get(previous)!;
      if (previousTask.day === task.day && timetable[previous]?.period > entry.period) {
        throw new Error(`Later period prerequisite: ${id} -> ${previous}`);
      }
      for (const prerequisite of dependencies[previous] ?? []) checkEarlier(prerequisite);
    };
    for (const previous of dependencies[id] ?? []) checkEarlier(previous);
  }
  for (const task of tasks.values()) {
    if (task.kind === 'class' && !timetable[task.id]) throw new Error(`Missing class timetable: ${task.id}`);
  }
  return days;
}
