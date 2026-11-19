import { describe, expect, it } from 'vitest';
import content from './supervision.json';
import timetable from './timetables.json';

describe('supervision scenario integrity', () => {
  it('has a recoverable procedure for every incident in the scheduled classroom', () => {
    for (const [id, scenario] of Object.entries(content.scenarios)) {
      expect(timetable[id as keyof typeof timetable]).toEqual({ period: scenario.period, classroom: scenario.room });
      expect(scenario.events.length).toBeGreaterThanOrEqual(2);
      expect(new Set(scenario.events.map(event => event.id)).size).toBe(scenario.events.length);
      for (const event of scenario.events) {
        expect(event.seat).toBeGreaterThanOrEqual(1);
        expect(event.seat).toBeLessThanOrEqual(6);
        expect(content.rules.some(rule => rule.id === event.ruleId)).toBe(true);
        expect(event.choices.filter(choice => choice.id === event.correct)).toHaveLength(1);
        expect(event.choices.filter(choice => choice.id !== event.correct).every(choice => choice.feedback.ko.length > 0 && choice.feedback.en.length > 0)).toBe(true);
        expect(event.observation.ko).not.toBe('');
        expect(event.observation.en).not.toBe('');
      }
    }
  });
  it('uses different handover records across the three exam days', () => {
    expect(new Set(Object.values(content.scenarios).map(scenario => scenario.expectedReport)).size).toBe(3);
    expect(content.scenarios.supervise_day13.expectedReport).toBe('identity');
    expect(content.scenarios.supervise_question.room).toBe('2-4');
  });
});
