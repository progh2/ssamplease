import type { Dispatch, SetStateAction } from 'react';
import { useGameStore } from '../store';
import type { DraftValue } from '../engine/drafts';

export function useDraftState<T extends DraftValue>(taskId: string, field: string, initial: T, valid?: (value: T) => boolean): [T, Dispatch<SetStateAction<T>>] {
  const saved = useGameStore(state => state.drafts[taskId]?.[field]);
  const compatible = Array.isArray(initial) ? Array.isArray(saved) : typeof initial === typeof saved;
  const value = compatible && (!valid || valid(saved as T)) ? saved as T : initial;
  const set: Dispatch<SetStateAction<T>> = next => useGameStore.getState().setDraft(taskId, field, typeof next === 'function' ? next(value) : next);
  return [value, set];
}
