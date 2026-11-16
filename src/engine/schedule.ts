import timetableData from '../content/timetables.json';
import { days } from '../content/days';
import { isTaskResolved } from './taskEngine';
import type { TaskStatus } from '../types';

export const timetable: Record<string, { period: number; classroom: string }> = timetableData;

export function nextLesson(day: number, statuses: Record<string, TaskStatus>) {
  return days.find((entry) => entry.day === day)?.tasks
    .filter((task) => timetable[task.id] && !isTaskResolved(statuses[task.id]))
    .sort((a, b) => timetable[a.id].period - timetable[b.id].period)[0];
}
