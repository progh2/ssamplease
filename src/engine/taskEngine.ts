import type { TaskDefinition, TaskStatus } from '../types';
import dependencies from '../content/dependencies.json';

export function prerequisites(id: string): string[] {
  return (dependencies as Record<string, string[]>)[id] ?? [];
}

export function canStartTask(id: string, statuses: Record<string, TaskStatus>) {
  return prerequisites(id).every((required) => isTaskResolved(statuses[required]));
}

export const resolvedStatuses: TaskStatus[] = ['completed', 'resolved_with_issue'];

export function isTaskResolved(status: TaskStatus | undefined) {
  return status !== undefined && resolvedStatuses.includes(status);
}

export function requiredTasksRemaining(tasks: TaskDefinition[], statuses: Record<string, TaskStatus>) {
  return tasks.filter((task) => task.required && !isTaskResolved(statuses[task.id]));
}

export function canLeaveSchool(tasks: TaskDefinition[], statuses: Record<string, TaskStatus>) {
  return requiredTasksRemaining(tasks, statuses).length === 0;
}
