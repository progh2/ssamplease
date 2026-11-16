import { days } from '../content/days';
import { sanitizeDrafts } from './drafts';
import type { TaskStatus } from '../types';
import type { StateStorage } from 'zustand/middleware';

type StorageAccess = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Keep the session playable when persistence is unavailable; surface errors to the UI. */
export function createSafeStorage(
  getStorage: () => StorageAccess,
  onError: (operation: 'read' | 'write' | 'remove', error: unknown) => void = () => {},
): StateStorage {
  const session = new Map<string, string>();
  const fallbackKeys = new Set<string>();
  return {
    getItem(name) {
      if (fallbackKeys.has(name)) return session.get(name) ?? null;
      try {
        const value = getStorage().getItem(name);
        if (value !== null) {
          const parsed: unknown = JSON.parse(value);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !('state' in parsed)) {
            throw new Error('Invalid saved-game envelope');
          }
          session.set(name, value);
        }
        return value;
      } catch (error) {
        fallbackKeys.add(name);
        onError('read', error);
        return session.get(name) ?? null;
      }
    },
    setItem(name, value) {
      session.set(name, value);
      try {
        getStorage().setItem(name, value);
        fallbackKeys.delete(name);
      } catch (error) {
        fallbackKeys.add(name);
        onError('write', error);
      }
    },
    removeItem(name) {
      session.delete(name);
      try {
        getStorage().removeItem(name);
        fallbackKeys.delete(name);
      } catch (error) {
        fallbackKeys.add(name);
        onError('remove', error);
      }
    },
  };
}

export function statusesForDay(day: number): Record<string, TaskStatus> {
  return Object.fromEntries((days.find((entry) => entry.day === day)?.tasks ?? []).map((task) => [task.id, 'available']));
}

/** Recover known progress only; never merge arbitrary persisted properties into actions. */
export function recoverSave(value: unknown) {
  const data = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const lastDay = days.length + 1;
  const currentDay = typeof data.currentDay === 'number' && Number.isInteger(data.currentDay) && data.currentDay >= 1 && data.currentDay <= lastDay ? data.currentDay : 1;
  const taskStatuses = statusesForDay(currentDay);
  const saved = data.taskStatuses && typeof data.taskStatuses === 'object' ? data.taskStatuses as Record<string, unknown> : {};
  for (const id of Object.keys(taskStatuses)) {
    if (saved[id] === 'completed' || saved[id] === 'resolved_with_issue') taskStatuses[id] = saved[id];
  }
  const accuracy = typeof data.accuracy === 'number' && Number.isFinite(data.accuracy) ? Math.max(0, Math.min(100, data.accuracy)) : 100;
  const history: Record<string, TaskStatus> = {};
  const previous = data.history && typeof data.history === 'object' ? data.history as Record<string, unknown> : {};
  for (const task of days.flatMap((day) => day.tasks)) {
    if (task.day > currentDay) continue;
    // Today's canonical status wins over a stale history entry.
    // Older saves discarded yesterday's statuses. Reaching a later day implies
    // required work was handled; infer only completion, never a dialogue choice.
    const historical = previous[task.id];
    const status = task.day === currentDay ? taskStatuses[task.id]
      : historical === 'completed' || historical === 'resolved_with_issue' ? historical
      : task.required ? 'completed' : undefined;
    if (status === 'completed' || status === 'resolved_with_issue') history[task.id] = status;
  }
  const quantity = typeof data.purchaseQuantity === 'number' && [1, 2, 3].includes(data.purchaseQuantity) ? data.purchaseQuantity : 2;
  const comparisonAttached = currentDay >= 7 && data.comparisonAttached === true;
  const drafts = sanitizeDrafts(data.drafts, Object.keys(taskStatuses).filter(id => taskStatuses[id] === 'available'));
  return { currentDay, taskStatuses, accuracy, history, purchaseQuantity: quantity, comparisonAttached, drafts };
}
