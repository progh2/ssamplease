import { describe, expect, it } from 'vitest';
import { days } from './days';
import { validateContent } from './validation';
import dependencies from './dependencies.json';
import timetable from './timetables.json';

describe('story content validation', () => {
  it('accepts shipped content and cross-day prerequisites', () => {
    expect(() => validateContent(days, dependencies, timetable)).not.toThrow();
    expect(() => validateContent(days, { ...dependencies, notice_variant: ['notice_basic'] }, timetable)).not.toThrow();
  });
  it('rejects missing keys and missing completion choices', () => {
    const invalid = structuredClone(days);
    invalid[0].tasks[0].titleKey = '';
    expect(() => validateContent(invalid, dependencies, timetable)).toThrow();
    const invalidChoice = structuredClone(days);
    invalidChoice[0].tasks[0].choices = [];
    expect(() => validateContent(invalidChoice, dependencies, timetable)).toThrow();
  });
  it('rejects duplicate task IDs and wrong task/day ownership', () => {
    const duplicate = structuredClone(days);
    duplicate[0].tasks[1].id = duplicate[0].tasks[0].id;
    expect(() => validateContent(duplicate, dependencies, timetable)).toThrow('Duplicate task ID');
    const wrongDay = structuredClone(days);
    wrongDay[0].tasks[0].day = 2;
    expect(() => validateContent(wrongDay, dependencies, timetable)).toThrow('wrong day');
  });
  it('rejects dangling IDs, future prerequisites, and cycles', () => {
    expect(() => validateContent(days, { ...dependencies, notice_basic: ['missing'] }, timetable)).toThrow('Unknown prerequisite');
    expect(() => validateContent(days, { ...dependencies, notice_basic: ['notice_variant'] }, timetable)).toThrow('Future prerequisite');
    expect(() => validateContent(days, { ...dependencies, message_welcome: ['class_first'] }, timetable)).toThrow('Dependency cycle');
  });
  it('rejects missing or unknown timetable entries and invalid periods', () => {
    const missing: Partial<typeof timetable> = { ...timetable };
    delete missing.class_first;
    expect(() => validateContent(days, dependencies, missing)).toThrow('Missing class timetable');
    expect(() => validateContent(days, dependencies, { ...timetable, missing: { period: 2, classroom: '2-1' } })).toThrow('Unknown timetable task');
    expect(() => validateContent(days, dependencies, { ...timetable, class_first: { period: 0, classroom: '2-1' } })).toThrow();
  });
  it('rejects overlapping classes and indirect later-period dependencies', () => {
    const expanded = structuredClone(days);
    expanded[0].tasks.push({ ...expanded[0].tasks[2], id: 'late_class' });
    expect(() => validateContent(expanded, dependencies, { ...timetable, late_class: { period: 2, classroom: '2-2' } })).toThrow('Overlapping timetable');
    expect(() => validateContent(expanded, { ...dependencies, notice_basic: ['late_class'] }, { ...timetable, late_class: { period: 3, classroom: '2-2' } })).toThrow('Later period prerequisite');
  });
});
