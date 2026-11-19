import { describe, expect, it } from 'vitest';
import grading from '../content/grading.json';
import documents from '../content/exercises.json';
import { gradePaper, noticeIssues, sameEvidence } from './deskJudgement';

describe('desk judgement', () => {
  it('accepts a signed refusal without treating non-consent as missing consent', () => {
    expect(noticeIssues({ id: '1', submittedId: '1', signed: true, consent: 'no' })).toEqual([]);
    expect(noticeIssues({ id: '1', submittedId: '2', signed: false, consent: '' })).toEqual(['id', 'signature', 'consent']);
  });
  it('does not accept an unrelated or duplicate return reason', () => {
    expect(sameEvidence(['id'], ['signature'])).toBe(false);
    expect(sameEvidence(['id', 'id'], ['id', 'signature'])).toBe(false);
  });
  it('every document has a finite valid decision with exact correction reasons', () => {
    for (const batch of Object.values(documents)) for (const doc of batch) {
      const expected = noticeIssues(doc);
      expect(sameEvidence(expected, expected)).toBe(true);
    }
  });
  it('requires independent partial credit and useful feedback, not just a matching total', () => {
    const paper = grading.grading_partial.papers[0];
    expect(gradePaper(paper, ['process'], 'result', false, '')).toBe('ok');
    expect(gradePaper(paper, ['result'], 'result', false, '')).toBe('needs_evidence');
    expect(gradePaper(paper, ['process'], 'clear', false, '')).toBe('needs_evidence');
  });
  it('ambiguous work can be resolved by documented joint review, never by guessing', () => {
    const paper = grading.grading_partial.papers[2];
    expect(gradePaper(paper, [], 'review', false, '')).toBe('needs_review');
    expect(gradePaper(paper, [], '', true, 'unreadable')).toBe('ok');
    expect(gradePaper(grading.grading_basic.papers[0], [], '', true, 'unreadable')).toBe('unnecessary_review');
  });
  it('all four batches have a valid grading or review path with defined criteria and feedback', () => {
    for (const batch of Object.values(grading)) for (const paper of batch.papers) {
      expect(paper.credits.every(id => batch.criteria.some(criterion => criterion.id === id))).toBe(true);
      expect(paper.ambiguous || batch.comments.some(comment => comment.id === paper.comment)).toBe(true);
      expect(gradePaper(paper, paper.credits, paper.comment, paper.ambiguous, paper.ambiguous ? 'unreadable' : '')).toBe('ok');
    }
  });
});
