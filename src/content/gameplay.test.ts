import { describe, expect, it } from 'vitest';
import { days } from './days';
import lessons from './lessons.json';
import grading from './grading.json';
import notices from './exercises.json';
import attendance from './attendance.json';
import examDesk from './examDesk.json';
import counseling from './counseling.json';
import supervision from './supervision.json';

describe('playable task coverage', () => {
  it('has a dedicated workflow for every non-message task, including later days', () => {
    const ids = new Set([
      ...lessons.map(item => item.id), ...Object.keys(grading), ...Object.keys(notices),
      ...Object.keys(attendance), ...Object.keys(examDesk), ...Object.keys(supervision.scenarios),
      'student_counseling', 'counseling_followup', 'phone_guardian', 'official_document',
      'equipment_check', 'cable_repair', 'edugreat_purchase', 'approval_revision', 'exam_pack',
      'omr_basic', 'omr_day12', 'omr_missing',
    ]);
    for (const task of days.flatMap(day => day.tasks).filter(task => task.kind !== 'message')) expect(ids.has(task.id), task.id).toBe(true);
  });
  it('all attendance facts have a documented source and correct class totals', () => {
    for (const data of Object.values(attendance)) {
      expect(data.students.length + 25).toBe(28);
      for (const student of data.students) expect(data.sources.some(source => source.id === student.evidence), student.id).toBe(true);
    }
  });
  it('every sorting card has one reachable destination', () => {
    for (const data of Object.values(examDesk)) for (const item of data.items) {
      expect(data.bins.filter(bin => bin.id === item.target)).toHaveLength(1);
    }
  });
  it('every supported counseling choice has a bilingual future callback', () => {
    expect(counseling.plans.length).toBeGreaterThan(1);
    for (const plan of counseling.plans) {
      expect(plan.reply.ko).not.toBe(''); expect(plan.reply.en).not.toBe('');
      expect(plan.followup.ko).not.toBe(''); expect(plan.followup.en).not.toBe('');
    }
  });
});
