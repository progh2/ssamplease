import { describe, expect, it } from 'vitest';
import { lessons, lessonPasses } from './lessons';
import { days } from '../content/days';

describe('lesson scenarios', () => {
  it('gives every scheduled class its own scenario and a reachable understanding check', () => {
    const classIds = days.flatMap(day => day.tasks.filter(task => task.kind === 'class').map(task => task.id));
    expect(lessons.map(lesson => lesson.id).sort()).toEqual(classIds.sort());
    for (const lesson of lessons) {
      expect(lesson.exitOptions.some(option => option.correct)).toBe(true);
      expect(lesson.cases.length).toBeGreaterThanOrEqual(2);
      if (lesson.mode === 'sequence') {
        expect(lessonPasses(lesson, lesson.correctOrder!, '')).toBe(true);
        expect(lessonPasses(lesson, [...lesson.correctOrder!].reverse(), '')).toBe(false);
      } else {
        expect(lesson.options!.filter(option => lessonPasses(lesson, [], option.id))).toHaveLength(1);
        expect(lessonPasses(lesson, [], 'missing')).toBe(false);
      }
    }
  });
  it('tests boundaries that distinguish plausible incorrect rules', () => {
    const noon = lessons.find(lesson => lesson.id === 'class_question')!;
    expect(lessonPasses(noon, [], 'gt')).toBe(false);
    expect(lessonPasses(noon, [], 'eq')).toBe(false);
    expect(lessonPasses(noon, [], 'gte')).toBe(true);
    const loop = lessons.find(lesson => lesson.id === 'class_followup')!;
    expect(lessonPasses(loop, [], 'short')).toBe(false);
    expect(lessonPasses(loop, [], 'extra')).toBe(false);
    expect(lessonPasses(loop, [], 'correct')).toBe(true);
  });
});
