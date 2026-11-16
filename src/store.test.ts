import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './store';
import { days } from './content/days';
import { timetable } from './engine/schedule';
import { recoverSave } from './engine/save';
import { purchaseStage } from './engine/workflow';

beforeEach(() => useGameStore.getState().reset());
describe('progression commands', () => {
  it('rejects skipping work and completing a locked or nonexistent task', () => {
    const game = useGameStore.getState();
    game.advanceDay();
    game.completeTask('class_first', 'completed', '');
    game.completeTask('fake', 'completed', '');
    expect(useGameStore.getState().currentDay).toBe(1);
    expect(useGameStore.getState().taskStatuses.class_first).toBe('available');
    expect(useGameStore.getState().taskStatuses.fake).toBeUndefined();
  });
  it('allows all 15 days to finish using valid resolutions', () => {
    for (const day of days) {
      expect(useGameStore.getState().currentDay).toBe(day.day);
      for (const task of day.tasks) {
        if (timetable[task.id]) useGameStore.getState().enterClassroom(task.id);
        if (task.id === 'approval_revision') useGameStore.getState().attachComparison();
        useGameStore.getState().completeTask(task.id, task.choices[0].outcome, '');
      }
      useGameStore.getState().advanceDay();
    }
    expect(useGameStore.getState().currentDay).toBe(16);
  });
  it('requires entering the scheduled classroom before completing a lesson', () => {
    useGameStore.getState().completeTask('message_welcome', 'completed', '');
    useGameStore.getState().completeTask('notice_basic', 'completed', '');
    useGameStore.getState().completeTask('class_first', 'completed', '');
    expect(useGameStore.getState().taskStatuses.class_first).toBe('available');
    useGameStore.getState().enterClassroom('class_question');
    expect(useGameStore.getState().activeScheduledId).toBeNull();
    useGameStore.getState().enterClassroom('class_first');
    useGameStore.getState().completeTask('class_first', 'completed', '');
    expect(useGameStore.getState().activeScheduledId).toBeNull();
    expect(useGameStore.getState().taskStatuses.class_first).toBe('completed');
  });
  it('keeps one purchase through budget correction, revision and approval', () => {
    useGameStore.setState(recoverSave({ currentDay: 5 }));
    useGameStore.getState().completeTask('message_admin', 'completed', '');
    useGameStore.getState().completeTask('cable_repair', 'completed', '');
    useGameStore.getState().setPurchaseQuantity(3);
    useGameStore.getState().completeTask('edugreat_purchase', 'completed', '');
    expect(purchaseStage(useGameStore.getState().history)).toBe('draft');
    useGameStore.getState().setPurchaseQuantity(1);
    useGameStore.getState().completeTask('edugreat_purchase', 'completed', '');
    expect(purchaseStage(useGameStore.getState().history)).toBe('submitted');
    useGameStore.setState(recoverSave({ ...useGameStore.getState(), currentDay: 7, taskStatuses: {} }));
    useGameStore.getState().completeTask('message_approval_return', 'completed', '');
    useGameStore.getState().completeTask('approval_revision', 'completed', '');
    expect(purchaseStage(useGameStore.getState().history)).toBe('revision');
    useGameStore.getState().attachComparison();
    useGameStore.getState().completeTask('approval_revision', 'completed', '');
    expect(purchaseStage(useGameStore.getState().history)).toBe('resubmitted');
    useGameStore.setState(recoverSave({ ...useGameStore.getState(), currentDay: 9, taskStatuses: {} }));
    useGameStore.getState().completeTask('message_approval_done', 'completed', '');
    expect(purchaseStage(useGameStore.getState().history)).toBe('approved');
    expect(useGameStore.getState().purchaseQuantity).toBe(1);
  });
});
