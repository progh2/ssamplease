import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { days } from './content/days';
import type { TaskStatus } from './types';
import { createSafeStorage, recoverSave, statusesForDay } from './engine/save';
import { canLeaveSchool, canStartTask, isTaskResolved } from './engine/taskEngine';
import { nextLesson, timetable } from './engine/schedule';
import { purchaseBudget, unitPrice } from './engine/workflow';
import { sanitizeDrafts, type Drafts, type DraftValue } from './engine/drafts';

export const useSaveHealth = create<{ failed: boolean }>(() => ({ failed: false }));

interface GameStore {
  memories: Drafts;
  drafts: Drafts;
  setDraft: (id: string, field: string, value: DraftValue) => void;
  currentDay: number;
  taskStatuses: Record<string, TaskStatus>;
  feedback: string | null;
  accuracy: number;
  history: Record<string, TaskStatus>;
  purchaseQuantity: number;
  activeScheduledId: string | null;
  enterClassroom: (id: string) => void;
  returnToOffice: () => void;
  comparisonAttached: boolean;
  attachComparison: () => void;
  setPurchaseQuantity: (quantity: number) => void;
  completeTask: (id: string, status: Extract<TaskStatus, 'completed' | 'resolved_with_issue'>, feedback: string, inaccurate?: boolean) => void;
  closeFeedback: () => void;
  advanceDay: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(persist((set) => ({
  memories: {},
  drafts: {},
  setDraft: (id, field, value) => set(state => {
    if (!days.find(day => day.day === state.currentDay)?.tasks.some(task => task.id === id) || isTaskResolved(state.taskStatuses[id])) return state;
    return { drafts: { ...state.drafts, [id]: { ...state.drafts[id], [field]: value } } };
  }),
  currentDay: 1,
  taskStatuses: statusesForDay(1),
  feedback: null,
  accuracy: 100,
  history: {},
  purchaseQuantity: 2,
  activeScheduledId: null,
  comparisonAttached: false,
  enterClassroom: (id) => set((state) => {
    if (nextLesson(state.currentDay, state.taskStatuses)?.id !== id || !canStartTask(id, { ...state.history, ...state.taskStatuses })) return state;
    return { activeScheduledId: id };
  }),
  returnToOffice: () => set({ activeScheduledId: null }),
  attachComparison: () => set((state) => state.currentDay === 7 && canStartTask('approval_revision', { ...state.history, ...state.taskStatuses }) ? { comparisonAttached: true } : state),
  setPurchaseQuantity: (quantity) => set((state) => {
    if (state.currentDay !== 5 || isTaskResolved(state.taskStatuses.edugreat_purchase) || ![1, 2, 3].includes(quantity)) return state;
    return { purchaseQuantity: quantity };
  }),
  completeTask: (id, status, feedback, inaccurate = false) => set((state) => {
    const task = days.find((day) => day.day === state.currentDay)?.tasks.find((entry) => entry.id === id);
    if (!task || !canStartTask(id, { ...state.history, ...state.taskStatuses }) || isTaskResolved(state.taskStatuses[id]) || !task.choices.some((choice) => choice.outcome === status)) return state;
    if (timetable[id] && (state.activeScheduledId !== id || nextLesson(state.currentDay, state.taskStatuses)?.id !== id)) return state;
    if (id === 'edugreat_purchase' && state.purchaseQuantity * unitPrice > purchaseBudget) return state;
    if (id === 'approval_revision' && !state.comparisonAttached) return state;
    const memory = sanitizeDrafts(state.drafts, [id])[id] ?? {};
    return { memories: { ...state.memories, [id]: memory }, taskStatuses: { ...state.taskStatuses, [id]: status }, history: { ...state.history, [id]: status }, activeScheduledId: timetable[id] ? null : state.activeScheduledId, feedback, accuracy: Math.max(0, state.accuracy - (inaccurate ? 5 : 0)) };
  }),
  closeFeedback: () => set({ feedback: null }),
  advanceDay: () => set((state) => {
    const day = days.find((entry) => entry.day === state.currentDay);
    if (!day || !canLeaveSchool(day.tasks, state.taskStatuses)) return state;
    const next = state.currentDay + 1;
    return { currentDay: next, taskStatuses: statusesForDay(next), feedback: null, activeScheduledId: null, drafts: {} };
  }),
  reset: () => set({ currentDay: 1, taskStatuses: statusesForDay(1), feedback: null, accuracy: 100, history: {}, purchaseQuantity: 2, activeScheduledId: null, comparisonAttached: false, drafts: {}, memories: {} }),
}), { name: 'teachers-please-save-v1', version: 8,
  storage: createJSONStorage(() => createSafeStorage(() => localStorage, () => useSaveHealth.setState({ failed: true }))),
  migrate: (saved) => recoverSave(saved),
  merge: (saved, current) => ({ ...current, ...recoverSave(saved) }),
  partialize: (state) => ({ currentDay: state.currentDay, taskStatuses: state.taskStatuses, accuracy: state.accuracy, history: state.history, purchaseQuantity: state.purchaseQuantity, comparisonAttached: state.comparisonAttached, drafts: state.drafts, memories: state.memories }) }));
