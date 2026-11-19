export type NoticeRecord = { id: string; submittedId: string; signed: boolean; consent: string };
export function noticeIssues(doc: NoticeRecord): string[] {
  return [
    ...(doc.id !== doc.submittedId ? ['id'] : []),
    ...(!doc.signed ? ['signature'] : []),
    ...(!['yes', 'no'].includes(doc.consent) ? ['consent'] : []),
  ];
}
export function sameEvidence(selected: string[], expected: string[]): boolean {
  return selected.length === expected.length && new Set(selected).size === selected.length && selected.every(id => expected.includes(id));
}
export function gradePaper(
  paper: { credits: string[]; comment: string; ambiguous: boolean },
  credits: string[],
  comment: string,
  review: boolean,
  reviewReason: string,
): 'ok' | 'needs_evidence' | 'needs_review' | 'unnecessary_review' {
  if (paper.ambiguous) return review && reviewReason === 'unreadable' ? 'ok' : 'needs_review';
  if (review) return 'unnecessary_review';
  return sameEvidence(credits, paper.credits) && comment === paper.comment ? 'ok' : 'needs_evidence';
}
