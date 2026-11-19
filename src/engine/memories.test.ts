import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../store';
import { recoverSave } from './save';

beforeEach(() => useGameStore.getState().reset());
describe('committed story memories', () => {
  it('only commits choices on valid completion and cannot farm or replace a completed choice', () => {
    useGameStore.setState(recoverSave({ currentDay: 8 }));
    const game = useGameStore.getState();
    game.setDraft('student_counseling', 'supportPlan', 'buddy');
    expect(useGameStore.getState().memories.student_counseling).toBeUndefined();
    game.completeTask('student_counseling', 'completed', '');
    game.setDraft('student_counseling', 'supportPlan', 'pause');
    game.completeTask('student_counseling', 'completed', '');
    expect(useGameStore.getState().memories.student_counseling.supportPlan).toBe('buddy');
    const restored = recoverSave({ ...useGameStore.getState(), currentDay: 14, taskStatuses: {} });
    expect(restored.memories.student_counseling.supportPlan).toBe('buddy');
    expect(restored.drafts.student_counseling).toBeUndefined();
  });
  it('does not infer a conversation from legacy completion or accept future memories', () => {
    expect(recoverSave({ currentDay: 14 }).memories).toEqual({});
    const restored = recoverSave({ currentDay: 2, memories: { class_final: { approach: 'pairs' }, grading_basic: { teachingPlan: 'trace' } } });
    expect(restored.memories).toEqual({});
  });
  it('a pending review outcome can resolve the expanded grading task', () => {
    useGameStore.setState(recoverSave({ currentDay: 14 }));
    useGameStore.getState().setDraft('grading_post_exam', 'teachingPlan', 'condition');
    useGameStore.getState().completeTask('grading_post_exam', 'resolved_with_issue', '');
    expect(useGameStore.getState().taskStatuses.grading_post_exam).toBe('resolved_with_issue');
    expect(useGameStore.getState().memories.grading_post_exam.teachingPlan).toBe('condition');
  });
  it('rejects dispatch before approval acknowledgement', () => {
    useGameStore.setState(recoverSave({ currentDay: 9 }));
    useGameStore.getState().completeTask('official_document', 'completed', '');
    expect(useGameStore.getState().taskStatuses.official_document).toBe('available');
    useGameStore.getState().completeTask('message_approval_done', 'completed', '');
    useGameStore.getState().completeTask('official_document', 'completed', '');
    expect(useGameStore.getState().taskStatuses.official_document).toBe('completed');
  });
});
