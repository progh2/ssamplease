import { expect, it } from 'vitest';
import { recoverSave } from './save';

it('keeps unfinished current-day drafts but discards completed and unrelated tasks', () => {
  const saved = recoverSave({ currentDay: 7, taskStatuses: { phone_guardian: 'resolved_with_issue' }, drafts: { phone_guardian: { called: true }, approval_revision: { note: '검토 중' }, notice_basic: { index: 1 } } });
  expect(saved.drafts).toEqual({ approval_revision: { note: '검토 중' } });
});
it('bounds draft payloads and rejects nested objects and nonfinite numbers', () => {
  const saved = recoverSave({ currentDay: 9, drafts: { official_document: { title: '가'.repeat(5000), amount: Infinity, nested: { evil: true }, checks: ['0', '1'] } } });
  expect(saved.drafts.official_document.title).toHaveLength(2000);
  expect(saved.drafts.official_document.amount).toBeUndefined();
  expect(saved.drafts.official_document.nested).toBeUndefined();
  expect(saved.drafts.official_document.checks).toEqual(['0', '1']);
});
