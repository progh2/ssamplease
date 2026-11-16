import { describe, it, expect } from 'vitest';
import { createSafeStorage, recoverSave } from './save';

describe('saved progress recovery', () => {
  it('preserves legacy day and issue resolutions', () => {
    const saved = recoverSave({ currentDay: 2, accuracy: 95, taskStatuses: { notice_variant: 'resolved_with_issue' } });
    expect(saved.currentDay).toBe(2);
    expect(saved.taskStatuses.notice_variant).toBe('resolved_with_issue');
    expect(saved.taskStatuses.class_question).toBe('available');
  });
  it('discards unknown IDs and restores invalid states to actionable work', () => {
    const saved = recoverSave({ currentDay: 1, accuracy: Infinity, taskStatuses: { message_welcome: 'locked', invented: 'completed' } });
    expect(saved.taskStatuses.message_welcome).toBe('available');
    expect(saved.taskStatuses.invented).toBeUndefined();
    expect(saved.accuracy).toBe(100);
  });
  it('does not interpret corrupt day numbers as an ending', () => {
    for (const currentDay of [-1, 99, 1.5, '16', null]) expect(recoverSave({ currentDay }).currentDay).toBe(1);
    expect(recoverSave({ currentDay: 16 }).currentDay).toBe(16);
  });
  it('rejects future history and reconciles conflicting current-day history', () => {
    const saved = recoverSave({ currentDay: 2, taskStatuses: { notice_variant: 'resolved_with_issue' }, history: { notice_variant: 'completed', class_question: 'completed', class_final: 'completed', message_welcome: 'completed' } });
    expect(saved.history.notice_variant).toBe('resolved_with_issue');
    expect(saved.history.class_question).toBeUndefined();
    expect(saved.history.class_final).toBeUndefined();
    expect(saved.history.message_welcome).toBe('completed');
  });
  it('reconstructs required prior-day completion for legacy and partial migrations', () => {
    for (const history of [undefined, {}, { notice_variant: 'resolved_with_issue' }]) {
      const saved = recoverSave({ currentDay: 7, history });
      expect(saved.history.edugreat_purchase).toBe('completed');
      expect(saved.history.attendance_basic).toBe('completed');
      expect(saved.history.approval_revision).toBeUndefined();
      if (history?.notice_variant) expect(saved.history.notice_variant).toBe('resolved_with_issue');
    }
  });
  it('recovers a comparison attachment only at the revision stage or later', () => {
    expect(recoverSave({ currentDay: 5, comparisonAttached: true }).comparisonAttached).toBe(false);
    expect(recoverSave({ currentDay: 7, comparisonAttached: true }).comparisonAttached).toBe(true);
    expect(recoverSave({ currentDay: 7, comparisonAttached: 'true' }).comparisonAttached).toBe(false);
  });
});

describe('persistence failures', () => {
  it('recovers malformed JSON without throwing or deleting the original', () => {
    const errors: string[] = [];
    let original = '{broken';
    const storage = createSafeStorage(() => ({ getItem: () => original, setItem: (_, value) => { original = value; }, removeItem: () => { original = ''; } }), (operation) => errors.push(operation));
    expect(storage.getItem('save')).toBeNull();
    expect(original).toBe('{broken');
    expect(errors).toEqual(['read']);
  });
  it('keeps current session data if browser storage access is blocked', () => {
    const storage = createSafeStorage(() => { throw new Error('SecurityError'); });
    expect(storage.getItem('save')).toBeNull();
    storage.setItem('save', '{"state":{"currentDay":2}}');
    expect(storage.getItem('save')).toBe('{"state":{"currentDay":2}}');
    storage.removeItem('save');
    expect(storage.getItem('save')).toBeNull();
  });
  it('does not reload stale persisted progress after a quota failure', () => {
    let blocked = true;
    let persisted = '{"state":{"currentDay":1}}';
    const storage = createSafeStorage(() => ({ getItem: () => persisted, setItem: (_, value) => { if (blocked) throw new Error('QuotaExceededError'); persisted = value; }, removeItem: () => {} }));
    storage.setItem('save', '{"state":{"currentDay":2}}');
    expect(storage.getItem('save')).toBe('{"state":{"currentDay":2}}');
    blocked = false;
    storage.setItem('save', '{"state":{"currentDay":3}}');
    expect(persisted).toBe('{"state":{"currentDay":3}}');
    expect(storage.getItem('save')).toBe(persisted);
  });
});
