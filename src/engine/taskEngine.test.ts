import { describe, expect, it } from 'vitest';
import { days } from '../content/days';
import { canLeaveSchool, requiredTasksRemaining } from './taskEngine';
import type { TaskStatus } from '../types';

const dayOne = days[0];

describe('leave-school rule', () => {
  it('blocks leaving while a required task remains', () => {
    const statuses: Record<string, TaskStatus> = Object.fromEntries(dayOne.tasks.map((task) => [task.id, 'completed']));
    statuses[dayOne.tasks[0].id] = 'in_progress';
    expect(canLeaveSchool(dayOne.tasks, statuses)).toBe(false);
    expect(requiredTasksRemaining(dayOne.tasks, statuses)).toHaveLength(1);
  });

  it('accepts resolved_with_issue as handled work', () => {
    const statuses: Record<string, TaskStatus> = Object.fromEntries(dayOne.tasks.map((task) => [task.id, 'resolved_with_issue']));
    expect(canLeaveSchool(dayOne.tasks, statuses)).toBe(true);
  });
});
